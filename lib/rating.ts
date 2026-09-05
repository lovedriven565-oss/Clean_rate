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
