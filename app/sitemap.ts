import type { MetadataRoute } from "next";
import {
  getAllBrands,
  getAllCompanies,
  getEntityTimestamps,
  getSolutionSlugs,
} from "@/lib/db/queries";
import { getCategoryBySlug } from "@/lib/categories";
import { getIndexableCities, getIndexableLandingCitySlugs, getIndexableLandings } from "@/lib/landing";
import { getCityBySlug, getMarketByCity } from "@/lib/markets";
import { absoluteUrl, cityAlternates, pageAlternates } from "@/lib/site";

/**
 * Sitemap генерируется на запрос (не при билде): lastmod берётся из реальных
 * updatedAt записей D1, поэтому файл должен оставаться живым между деплоями.
 *
 * Категории (/rating?category=...) намеренно не включены: /rating фильтруется на клиенте,
 * и параметризованные URL отдавали бы одинаковый HTML — дубли для индексации.
 * hreflang в sitemap отдаётся только там, где страница реально индексируема
 * и имеет взаимный набор альтернатив (глобальные страницы — один URL, региональные —
 * только города, прошедшие порог индексации для этой услуги/хаба).
 */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [solutionSlugs, brands, companies, timestamps] = await Promise.all([
    getSolutionSlugs(),
    getAllBrands(),
    getAllCompanies(),
    getEntityTimestamps(),
  ]);
  // Компании закрытых рынков (KZ пока выключен) не попадают в sitemap:
  // их страницы отдают noindex, а карта сайта не должна рекламировать закрытый контент.
  const openMarketCompanies = companies.filter((company) => getMarketByCity(company.city).enabled);
  const landings = getIndexableLandings(openMarketCompanies);
  const cityHubs = getIndexableCities(openMarketCompanies);
  // Дата статичных страниц — последний контентный срез статей/структуры.
  const staticDate = new Date("2026-02-14T00:00:00.000Z");

  // Для агрегаторов lastmod — реальный максимум updatedAt их сущностей,
  // а не зашитая дата: иначе краулер видит вечно «старые» /rating и /solutions.
  const maxTimestamp = (map: Map<string, Date>): Date => {
    let max = staticDate.getTime();
    for (const date of map.values()) max = Math.max(max, date.getTime());
    return new Date(max);
  };
  const companiesUpdated = maxTimestamp(timestamps.companies);
  const solutionsUpdated = maxTimestamp(timestamps.solutions);
  const brandsUpdated = maxTimestamp(timestamps.brands);
  const homeUpdated = new Date(Math.max(companiesUpdated.getTime(), solutionsUpdated.getTime(), brandsUpdated.getTime()));

  // Самая свежая правка профиля компании в каждом городе — lastmod хаба и его посадочных.
  const cityMax = new Map<string, number>();
  for (const company of companies) {
    const updated = (timestamps.companies.get(company.slug) ?? staticDate).getTime();
    cityMax.set(company.city, Math.max(cityMax.get(company.city) ?? 0, updated));
  }
  const cityDate = (citySlug: string): Date => {
    const resolved = getCityBySlug(citySlug);
    const max = resolved ? cityMax.get(resolved.city.name) : undefined;
    return max ? new Date(max) : staticDate;
  };

  const cityHubSlugs = new Set(cityHubs.map(({ city }) => city));
  const landingIndexable = new Map<string, Set<string>>();
  for (const { category } of landings) {
    const categoryId = getCategoryBySlug(category);
    if (categoryId && !landingIndexable.has(categoryId)) {
      landingIndexable.set(categoryId, getIndexableLandingCitySlugs(openMarketCompanies, categoryId));
    }
  }

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: homeUpdated, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/solutions"), lastModified: solutionsUpdated, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/assistant"), lastModified: staticDate, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/rating"), lastModified: companiesUpdated, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/rating/methodology"), lastModified: staticDate, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/brands"), lastModified: brandsUpdated, changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/for-partners"), lastModified: staticDate, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/for-brands"), lastModified: staticDate, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/privacy"), lastModified: staticDate, changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/terms"), lastModified: staticDate, changeFrequency: "yearly", priority: 0.2 },
  ];

  return [
    ...staticPages.map((entry) => ({
      ...entry,
      alternates: {
        languages: { ru: entry.url, "x-default": entry.url },
      },
    })),
    // Городские хабы — только города с достаточным числом компаний.
    ...cityHubs.map(({ city }) => ({
      url: absoluteUrl(`/${city}`),
      lastModified: cityDate(city),
      changeFrequency: "weekly" as const,
      priority: 0.8,
      alternates: {
        languages:
          cityAlternates(city, undefined, { includeCitySlugs: cityHubSlugs }).languages ?? {},
      },
    })),
    ...solutionSlugs.map((slug) => {
      const path = `/solutions/${slug}`;
      return {
        url: absoluteUrl(path),
        lastModified: timestamps.solutions.get(slug) ?? staticDate,
        changeFrequency: "monthly" as const,
        priority: 0.8,
        alternates: { languages: pageAlternates(path).languages ?? {} },
      };
    }),
    // Профили компаний — только открытых рынков: закрытые (KZ) noindex и в карту не входят.
    ...openMarketCompanies.map((company) => {
      const path = `/companies/${company.slug}`;
      return {
        url: absoluteUrl(path),
        lastModified: timestamps.companies.get(company.slug) ?? staticDate,
        changeFrequency: "weekly" as const,
        priority: 0.6,
        alternates: { languages: pageAlternates(path).languages ?? {} },
      };
    }),
    ...brands.map((brand) => {
      const path = `/brands/${brand.slug}`;
      return {
        url: absoluteUrl(path),
        lastModified: timestamps.brands.get(brand.slug) ?? staticDate,
        changeFrequency: "monthly" as const,
        priority: 0.5,
        alternates: { languages: pageAlternates(path).languages ?? {} },
      };
    }),
    // Посадочные «услуга × город» — только индексируемые (≥2 компании).
    ...landings.map(({ city, category }) => {
      const categoryId = getCategoryBySlug(category);
      const includeCitySlugs = categoryId ? landingIndexable.get(categoryId) : undefined;
      return {
        url: absoluteUrl(`/${city}/${category}`),
        lastModified: cityDate(city),
        changeFrequency: "weekly" as const,
        priority: 0.7,
        alternates: {
          languages:
            cityAlternates(city, category, includeCitySlugs ? { includeCitySlugs } : undefined).languages ?? {},
        },
      };
    }),
  ];
}
