import { computeBrandScore, type BrandScoreInput } from "@/lib/brand-score";
import type {
  Brand,
  BrandScore,
  Category,
  CategoryId,
  Company,
  IntentKeyword,
  PriceEstimate,
  Solution,
  SolutionProduct,
} from "@/lib/types";
import {
  seedBrands,
  seedCategories,
  seedCompanies,
  seedIntentKeywords,
  seedPriceEstimates,
  seedSolutionProducts,
  seedSolutions,
} from "@/db/seed-data";

// --- Маппинг seed-data в типы UI ---

function seedCompanyToCompany(seed: (typeof seedCompanies)[number]): Company {
  return {
    id: seed.id,
    slug: seed.slug,
    name: seed.name,
    categories: seed.categories,
    city: seed.city,
    address: seed.address,
    verified: seed.verified,
    promoted: seed.promoted,
    equipment: seed.equipment,
    baseRating: seed.rating?.rating ?? 0,
    reviewCount: seed.rating?.reviewCount ?? 0,
    ratingSource: seed.ratingSource,
    priceFrom: seed.priceFrom,
    priceUnit: seed.priceUnit,
    coverImage: seed.coverImage,
    description: seed.description,
    tags: seed.tags,
    guarantees: seed.guarantees,
    websiteUrl: seed.websiteUrl,
    phone: seed.phone,
    telegramUrl: seed.telegramUrl,
    email: seed.email,
    experienceYears: seed.experienceYears,
  };
}

function seedBrandToBrand(seed: (typeof seedBrands)[number]): Brand {
  return {
    id: seed.id,
    slug: seed.slug,
    name: seed.name,
    tagline: seed.tagline,
    accent: seed.accent,
    focus: seed.focus,
    description: seed.description,
    affiliateUrl: seed.affiliateUrl,
    isSponsor: seed.isSponsor,
  };
}

export function getFallbackCompanies(): Company[] {
  return seedCompanies.map(seedCompanyToCompany);
}

export function getFallbackBrands(): Brand[] {
  return seedBrands.map(seedBrandToBrand);
}

export function getFallbackCategories(): Category[] {
  return seedCategories as Category[];
}

function seedSolutionToSolution(seed: (typeof seedSolutions)[number]): Solution {
  const brandMap = new Map(seedBrands.map((b) => [b.id, b.name]));
  const products: SolutionProduct[] = seedSolutionProducts
    .filter((sp) => sp.solutionId === seed.id)
    .map((sp) => ({
      id: sp.id,
      solutionId: sp.solutionId,
      brandId: sp.brandId,
      productId: sp.productId,
      brandName: sp.brandId ? brandMap.get(sp.brandId) : undefined,
      role: sp.role,
      note: sp.note,
    }));

  return {
    id: seed.id,
    slug: seed.slug,
    title: seed.title,
    problemType: seed.problemType,
    surface: seed.surface,
    material: seed.material,
    severity: seed.severity,
    audience: seed.audience,
    diySteps: seed.diySteps,
    warnings: seed.warnings,
    whenToCallPro: seed.whenToCallPro,
    diyCostNote: seed.diyCostNote,
    proTimeNote: seed.proTimeNote,
    searchKeywords: seed.searchKeywords,
    relatedCategory: seed.relatedCategory,
    status: seed.status,
    recommendedProducts: products,
  };
}

export function getFallbackSolutions(): Solution[] {
  return seedSolutions.filter((s) => s.status === "published").map(seedSolutionToSolution);
}

export function getFallbackIntentKeywords(): IntentKeyword[] {
  return seedIntentKeywords.map((k) => ({
    id: k.id,
    keyword: k.keyword,
    intent: k.intent,
    weight: k.weight,
    targetKind: k.targetKind,
    targetSlug: k.targetSlug,
  }));
}

export function getFallbackPriceEstimates(filter?: {
  solutionId?: string;
  categoryId?: CategoryId;
  countryCode?: string;
}): PriceEstimate[] {
  return seedPriceEstimates
    .filter((pe) => {
      if (filter?.solutionId && pe.solutionId !== filter.solutionId) return false;
      if (filter?.categoryId && pe.categoryId !== filter.categoryId) return false;
      if (filter?.countryCode && pe.countryCode !== filter.countryCode) return false;
      return true;
    })
    .map((pe) => ({
      id: pe.id,
      solutionId: pe.solutionId,
      categoryId: pe.categoryId,
      countryCode: pe.countryCode,
      city: pe.city,
      currency: pe.currency,
      priceMin: pe.priceMin,
      priceMax: pe.priceMax,
      unit: pe.unit,
      note: pe.note,
    }));
}

// --- Fallback «Индекса доверия профи» по seed-данным ---

export function initScoreInputs(brandIds: string[]): Map<string, BrandScoreInput> {
  return new Map(
    brandIds.map((brandId) => [
      brandId,
      { brandId, verifiedCompanyCount: 0, recommendedCount: 0, alternativeCount: 0, clickCount: 0 },
    ])
  );
}

/** Fallback-индекс: verified-связи = equipment верифицированных компаний (как в db/seed.ts). */
export function getFallbackBrandScores(brandIds: string[]): Map<string, BrandScore> {
  const inputs = initScoreInputs(brandIds);
  for (const company of seedCompanies) {
    if (!company.verified) continue;
    for (const brandId of company.equipment) {
      const input = inputs.get(brandId);
      if (input) input.verifiedCompanyCount += 1;
    }
  }
  for (const sp of seedSolutionProducts) {
    const input = sp.brandId ? inputs.get(sp.brandId) : undefined;
    if (!input) continue;
    if (sp.role === "recommended") input.recommendedCount += 1;
    else input.alternativeCount += 1;
  }
  return new Map([...inputs].map(([id, input]) => [id, computeBrandScore(input)]));
}

/**
 * Связи решение→бренд из seed для подсчёта индекса,
 * когда продуктовый граф в D1 ещё не засеян.
 */
export function getSeedSolutionProductLinks(): {
  brandId?: string;
  role: "recommended" | "alternative";
  total: number;
}[] {
  return seedSolutionProducts.map((sp) => ({ brandId: sp.brandId, role: sp.role, total: 1 }));
}
