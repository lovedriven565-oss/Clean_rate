import { CATEGORIES, getCategoryBySlug, getCategorySlug } from "@/lib/categories";
import { ENABLED_MARKETS, getCityBySlug, openCities, type City, type Market } from "@/lib/markets";
import { calculateRelevanceScore } from "@/lib/rating";
import type { Category, CategoryId, Company } from "@/lib/types";

/** Порог «тонкости» посадочной: меньше компаний → noindex и нет в sitemap. */
export const LANDING_INDEX_MIN_COMPANIES = 2;

export interface ResolvedLanding {
  market: Market;
  city: City;
  category: Category;
}

/** Валидирует /[city]/[category]: город открытого рынка + известный slug категории. */
export function resolveLandingParams(citySlug: string, categorySlug: string): ResolvedLanding | undefined {
  const foundCity = getCityBySlug(citySlug);
  const categoryId = getCategoryBySlug(categorySlug);
  const category = categoryId ? CATEGORIES.find((c) => c.id === categoryId) : undefined;
  if (!foundCity || !category) return undefined;
  return { ...foundCity, category };
}

/** Все комбинации «город × категория» для SSG (URL использует читаемый slug категории). */
export function landingStaticParams(): { city: string; category: string }[] {
  return ENABLED_MARKETS.flatMap((market) =>
    openCities(market).flatMap((city) => CATEGORIES.map((category) => ({ city: city.slug, category: getCategorySlug(category.id) })))
  );
}

/** Параметры городского хаба `/{city}` — только открытые города включённых рынков. */
export function cityStaticParams(): { city: string }[] {
  return ENABLED_MARKETS.flatMap((market) => openCities(market).map((city) => ({ city: city.slug })));
}

/** Валидирует `/{city}`: город открытого рынка (без категории). */
export function resolveCityParams(citySlug: string): { market: Market; city: City } | undefined {
  return getCityBySlug(citySlug);
}

/** Города с достаточным числом компаний для индексации городского хаба. */
export function getIndexableCities(companies: Company[]): { city: string }[] {
  return cityStaticParams().filter(({ city }) => {
    const resolved = getCityBySlug(city);
    if (!resolved) return false;
    return companies.filter((c) => c.city === resolved.city.name).length >= LANDING_INDEX_MIN_COMPANIES;
  });
}

/** Slug'и городов, где конкретная категория набирает порог индексации. */
export function getIndexableLandingCitySlugs(companies: Company[], categoryId: CategoryId): Set<string> {
  const slugs = new Set<string>();
  for (const market of ENABLED_MARKETS) {
    for (const city of openCities(market)) {
      const { organic, sponsors } = pickLandingCompanies(companies, city.name, categoryId, {
        countryCode: market.countryCode,
      });
      if (organic.length + sponsors.length >= LANDING_INDEX_MIN_COMPANIES) slugs.add(city.slug);
    }
  }
  return slugs;
}

export interface LandingCompanies {
  /** Органический список по убыванию релевантности — им достаются ранги. */
  organic: Company[];
  /** Платные размещения — отдельным блоком без ранга. */
  sponsors: Company[];
}

/** Спонсорских мест на посадочной «город × категория» — одно, остальным promoted остаётся органика. */
export const LANDING_SPONSOR_LIMIT = 1;

export function pickLandingCompanies(
  companies: Company[],
  cityName: string,
  categoryId: CategoryId,
  options?: { countryCode?: string },
): LandingCompanies {
  const inCity = companies.filter((c) => c.city === cityName && c.categories.includes(categoryId));
  // РФ: платные размещения без erid-маркировки не показываются — все идут в органику.
  if (options?.countryCode?.toUpperCase() === "RU") {
    return {
      sponsors: [],
      organic: inCity
        .map((c) => (c.promoted ? { ...c, promoted: false } : c))
        .sort((a, b) => calculateRelevanceScore(b) - calculateRelevanceScore(a)),
    };
  }
  // Слот один: побеждает самый релевантный promoted, остальные promoted честно уходят в органику.
  const promoted = inCity
    .filter((c) => c.promoted)
    .sort((a, b) => calculateRelevanceScore(b) - calculateRelevanceScore(a));
  const sponsors = promoted.slice(0, LANDING_SPONSOR_LIMIT);
  const overflow = promoted.slice(LANDING_SPONSOR_LIMIT).map((c) => ({ ...c, promoted: false }));
  return {
    sponsors,
    organic: [...inCity.filter((c) => !c.promoted), ...overflow]
      .sort((a, b) => calculateRelevanceScore(b) - calculateRelevanceScore(a)),
  };
}

/** Посадочные для sitemap: только страницы с достаточным числом компаний. */
export function getIndexableLandings(companies: Company[]): { city: string; category: string }[] {
  return landingStaticParams().filter(({ city, category }) => {
    const resolved = resolveLandingParams(city, category);
    if (!resolved) return false;
    const { organic, sponsors } = pickLandingCompanies(companies, resolved.city.name, resolved.category.id, {
      countryCode: resolved.market.countryCode,
    });
    return organic.length + sponsors.length >= LANDING_INDEX_MIN_COMPANIES;
  });
}

export interface FooterLandingLink {
  href: string;
  label: string;
}

/**
 * Прямые SEO-ссылки на посадочные для футера: до `perCityLimit`
 * первых категорий на каждый открытый город — хаб перелинковки для роботов.
 */
export function getFooterLandingLinks(perCityLimit = CATEGORIES.length): FooterLandingLink[] {
  const topCategories = CATEGORIES.slice(0, perCityLimit);
  return ENABLED_MARKETS.flatMap((market) =>
    openCities(market).flatMap((city) =>
      topCategories.map((category) => {
        const categorySlug = getCategorySlug(category.id);
        return {
          href: `/${city.slug}/${categorySlug}`,
          label: `${category.name} в ${city.nameIn}`,
        };
      })
    )
  );
}

/**
 * Посадочные, сгруппированные по городам — для компактного блока футера.
 * Ссылки ведут только на индексируемые страницы: внутренняя перелинковка на
 * noindex-посадочные расходует краул-бюджет без пользы.
 */
export function getFooterLandingLinksByCity(companies: Company[]): { cityName: string; links: FooterLandingLink[] }[] {
  const indexable = new Set(getIndexableLandings(companies).map((l) => `${l.city}/${l.category}`));
  return ENABLED_MARKETS.flatMap((market) =>
    openCities(market).flatMap((city) => {
      const links = CATEGORIES.filter((category) => indexable.has(`${city.slug}/${getCategorySlug(category.id)}`)).map(
        (category) => ({
          href: `/${city.slug}/${getCategorySlug(category.id)}`,
          label: category.name,
        })
      );
      return links.length > 0 ? [{ cityName: city.nameIn, links }] : [];
    })
  );
}

/**
 * Прямые ссылки на городские хабы `/{city}` — только хабы, проходящие порог
 * индексации (тонкий хаб получает noindex и не должен получать footer-ссылки).
 */
export function getFooterCityLinks(companies: Company[]): FooterLandingLink[] {
  return getIndexableCities(companies).flatMap(({ city }) => {
    const resolved = getCityBySlug(city);
    return resolved ? [{ href: `/${city}`, label: `Клининговые компании в ${resolved.city.nameIn}` }] : [];
  });
}
