import type { MetadataRoute } from "next";
import { getAllBrands, getCompanySlugs, getSolutionSlugs } from "@/lib/db/queries";
import { absoluteUrl } from "@/lib/site";

/**
 * Категории (/rating?category=...) намеренно не включены: /rating фильтруется на клиенте,
 * и параметризованные URL отдавали бы одинаковый HTML — дубли для индексации.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [solutionSlugs, companySlugs, brands] = await Promise.all([
    getSolutionSlugs(),
    getCompanySlugs(),
    getAllBrands(),
  ]);
  const lastModified = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/solutions"), lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/assistant"), lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/rating"), lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/rating/methodology"), lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/brands"), lastModified, changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/suppliers"), lastModified, changeFrequency: "weekly", priority: 0.6 },
    { url: absoluteUrl("/for-partners"), lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/for-brands"), lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/privacy"), lastModified, changeFrequency: "yearly", priority: 0.2 },
  ];

  return [
    ...staticPages,
    ...solutionSlugs.map((slug) => ({
      url: absoluteUrl(`/solutions/${slug}`),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...companySlugs.map((slug) => ({
      url: absoluteUrl(`/companies/${slug}`),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...brands.map((brand) => ({
      url: absoluteUrl(`/brands/${brand.slug}`),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
