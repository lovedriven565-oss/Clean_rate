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

export interface LandingCompanies {
  /** Органический список по убыванию релевантности — им достаются ранги. */
  organic: Company[];
  /** Платные размещения — отдельным блоком без ранга. */
  sponsors: Company[];
}

export function pickLandingCompanies(companies: Company[], cityName: string, categoryId: CategoryId): LandingCompanies {
  const inCity = companies.filter((c) => c.city === cityName && c.categories.includes(categoryId));
  return {
    sponsors: inCity.filter((c) => c.promoted),
    organic: inCity
      .filter((c) => !c.promoted)
      .sort((a, b) => calculateRelevanceScore(b) - calculateRelevanceScore(a)),
  };
}

/** Посадочные для sitemap: только страницы с достаточным числом компаний. */
export function getIndexableLandings(companies: Company[]): { city: string; category: string }[] {
  return landingStaticParams().filter(({ city, category }) => {
    const resolved = resolveLandingParams(city, category);
    if (!resolved) return false;
    const { organic, sponsors } = pickLandingCompanies(companies, resolved.city.name, resolved.category.id);
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
export function getFooterLandingLinks(perCityLimit = 3): FooterLandingLink[] {
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
