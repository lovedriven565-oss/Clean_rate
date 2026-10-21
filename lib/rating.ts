import type { Company, RatingSource } from "@/lib/types";

const verifiedSources = new Set<RatingSource>(["google", "yandex"]);

export function hasPublishedRating(company: Company) {
  return company.reviewCount > 0 && company.ratingSource !== undefined && verifiedSources.has(company.ratingSource);
}

export function calculateProfileCompleteness(company: Company) {
  const fields = [
    company.description,
    company.websiteUrl,
    company.phone,
    company.email,
    company.priceFrom,
    company.experienceYears,
    company.tags.length > 0,
    company.categories.length > 0,
  ];
  return fields.filter(Boolean).length / fields.length;
}

export function calculateOrganicScore(company: Company): number | null {
  if (!hasPublishedRating(company)) return null;

  const ratingPoints = Math.min(75, Math.max(0, (company.baseRating / 5) * 75));
  const confidencePoints = Math.min(15, (Math.log10(company.reviewCount + 1) / 2) * 15);
  const verificationPoints = company.verified ? 5 : 0;
  const profilePoints = calculateProfileCompleteness(company) * 5;

  return Math.round((ratingPoints + confidencePoints + verificationPoints + profilePoints) * 10) / 10;
}

export function calculateRelevanceScore(company: Company) {
  const organicScore = calculateOrganicScore(company) ?? 0;
  const verificationSignal = company.verified ? 8 : 0;
  const profileSignal = calculateProfileCompleteness(company) * 4;
  const experienceSignal = Math.min(company.experienceYears ?? 0, 10) * 0.3;
  return organicScore + verificationSignal + profileSignal + experienceSignal;
}

export function ratingSourceLabel(source?: RatingSource) {
  if (source === "google") return "Google";
  if (source === "yandex") return "Яндекс";
  if (source === "new") return "Новый профиль";
  return "Источник не подтверждён";
}

export interface SponsoredSplit {
  /** Платные размещения — отдельным блоком над органикой, без ранга. */
  sponsors: Company[];
  /** Органический порядок — единственный, кто получает ранги. */
  organic: Company[];
}

/**
 * Разделяет уже отфильтрованный/отсортированный список: promoted-компании уходят
 * в верхний спонсорский блок («Рекламное размещение»), органический порядок и ранги
 * не трогаются. Порядок внутри каждой группы сохраняет сортировку входного списка.
 */
export function splitSponsors(companies: Company[]): SponsoredSplit {
  return {
    sponsors: companies.filter((c) => c.promoted),
    organic: companies.filter((c) => !c.promoted),
  };
}

export interface HomeCompanies {
  /** Топ по органическому баллу — единственные, кто получает ранг на главной. */
  organic: Company[];
  /** Платные размещения — показываются отдельной строкой с пометкой «Спонсор», без ранга. */
  sponsors: Company[];
}

/**
 * Блок «Рейтинг» на главной: ранги достаются только органическому топу,
 * спонсоры выносятся из нумерации — платное размещение не даёт позицию #1.
 */
export function pickHomeCompanies(companies: Company[], limit = 3): HomeCompanies {
  const sponsors = companies.filter((c) => c.promoted);
  const organic = companies
    .filter((c) => !c.promoted)
    .sort((a, b) => calculateRelevanceScore(b) - calculateRelevanceScore(a))
    .slice(0, limit);
  return { organic, sponsors };
}
