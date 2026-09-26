import { drizzle } from "drizzle-orm/d1";
import { brands as brandsTable, campaigns as campaignsTable, products as productsTable } from "@/db/schema";
import { getDb } from "@/lib/db/client";
import { getBrandBySlug, getSolutionBySlug } from "@/lib/db/queries";
import {
  seedBrands,
  seedCampaigns,
  seedProducts,
  type SeedCampaign,
  type SeedProduct,
} from "@/db/seed-data";
import type {
  AdPlacement,
  AdTargetContext,
  Brand,
  Campaign,
  EligibleAd,
  ProductSafetyProfile,
  Solution,
} from "@/lib/types";
import {
  checkProductRelevance,
  filterAndRankEligibleCampaigns,
  resolveEligibleAd,
} from "./eligibility";

function parseJsonArray(val: string | null | undefined): string[] | null {
  if (!val) return null;
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function seedCampaignToCampaign(seed: SeedCampaign): Campaign {
  return {
    id: seed.id,
    brandId: seed.brandId,
    productId: seed.productId ?? null,
    name: seed.name,
    placement: seed.placement,
    status: seed.status,
    startsAt: seed.startsAt ? new Date(seed.startsAt) : null,
    endsAt: seed.endsAt ? new Date(seed.endsAt) : null,
    targetCountries: seed.targetCountries ?? null,
    targetCategories: seed.targetCategories ?? null,
    targetSurfaces: seed.targetSurfaces ?? null,
    targetSolutions: seed.targetSolutions ?? null,
    maxImpressions: seed.maxImpressions ?? null,
    maxClicks: seed.maxClicks ?? null,
    currentImpressions: seed.currentImpressions,
    currentClicks: seed.currentClicks,
    title: seed.title,
    description: seed.description,
    ctaText: seed.ctaText,
    ctaUrl: seed.ctaUrl,
    ctaType: seed.ctaType,
    badgeText: seed.badgeText ?? null,
    priority: seed.priority,
    createdAt: new Date(),
    updatedAt: null,
  };
}

function seedProductToProfile(seed: SeedProduct): ProductSafetyProfile {
  return {
    id: seed.id,
    slug: seed.slug,
    name: seed.name,
    brandId: seed.brandId,
    ph: seed.ph,
    compatibleSurfaces: seed.compatibleSurfaces,
    prohibitedSurfaces: seed.prohibitedSurfaces,
  };
}

/**
 * Получить все кампании (D1 с fallback на seed-data).
 */
export async function getAllCampaigns(): Promise<Campaign[]> {
  const d1 = await getDb();
  if (d1) {
    try {
      const db = drizzle(d1);
      const rows = await db.select().from(campaignsTable);
      if (rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          brandId: r.brandId,
          productId: r.productId,
          name: r.name,
          placement: r.placement as AdPlacement,
          status: r.status,
          startsAt: r.startsAt,
          endsAt: r.endsAt,
          targetCountries: parseJsonArray(r.targetCountries),
          targetCategories: parseJsonArray(r.targetCategories),
          targetSurfaces: parseJsonArray(r.targetSurfaces),
          targetSolutions: parseJsonArray(r.targetSolutions),
          maxImpressions: r.maxImpressions,
          maxClicks: r.maxClicks,
          currentImpressions: r.currentImpressions,
          currentClicks: r.currentClicks,
          title: r.title,
          description: r.description,
          ctaText: r.ctaText,
          ctaUrl: r.ctaUrl,
          ctaType: r.ctaType,
          badgeText: r.badgeText,
          priority: r.priority,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        }));
      }
    } catch {
      // Fallback при ошибке D1
    }
  }

  return seedCampaigns.map(seedCampaignToCampaign);
}

/**
 * Получить активные кампании (опционально отфильтрованные по placement).
 */
export async function getActiveCampaigns(placement?: AdPlacement): Promise<Campaign[]> {
  const all = await getAllCampaigns();
  return all.filter((c) => {
    if (c.status !== "active") return false;
    if (placement && c.placement !== placement) return false;
    return true;
  });
}

/**
 * Получить карту профилей безопасности продуктов (D1 с fallback на seed-data).
 */
export async function getProductsSafetyMap(): Promise<Map<string, ProductSafetyProfile>> {
  const map = new Map<string, ProductSafetyProfile>();

  const d1 = await getDb();
  if (d1) {
    try {
      const db = drizzle(d1);
      const rows = await db.select().from(productsTable);
      if (rows.length > 0) {
        for (const r of rows) {
          map.set(r.id, {
            id: r.id,
            slug: r.slug,
            name: r.name,
            brandId: r.brandId,
            ph: r.ph ?? undefined,
            compatibleSurfaces: parseJsonArray(r.compatibleSurfaces) ?? undefined,
            prohibitedSurfaces: parseJsonArray(r.prohibitedSurfaces) ?? undefined,
          });
        }
        return map;
      }
    } catch {
      // Fallback
    }
  }

  for (const sp of seedProducts) {
    map.set(sp.id, seedProductToProfile(sp));
  }

  return map;
}

/**
 * Основная точка входа: серверный выбор подходящей рекламы для слота.
 * Проходит через Eligibility Gate (проверка времени, бюджета, гео-таргетинга,
 * химической безопасности состава и релевантности).
 * 
 * ЕСЛИ ПОДХОДЯЩЕЙ КАМПАНИИ НЕТ — СТРОГО ВОЗВРАЩАЕТ null (никаких пустых рекламных дыр).
 */
export async function getEligibleAd(
  placement: AdPlacement,
  context: AdTargetContext,
  options?: { now?: Date }
): Promise<EligibleAd | null> {
  const activeCampaigns = await getActiveCampaigns(placement);
  if (activeCampaigns.length === 0) {
    return null;
  }

  const [productsMap, solution] = await Promise.all([
    getProductsSafetyMap(),
    context.solutionSlug ? getSolutionBySlug(context.solutionSlug) : Promise.resolve(null),
  ]);

  return resolveForContext(activeCampaigns, productsMap, context, {
    solution: solution ?? undefined,
    now: options?.now,
  });
}

/**
 * Пакетная выборка для страниц с клиентской фильтрацией (например, /rating): кампании и
 * профили продуктов загружаются один раз, затем гейт прогоняется для каждой категории.
 * Отсутствие партнёра у категории — честный `null`, слот на клиенте схлопывается.
 */
export async function getEligibleAdsForCategories(
  placement: AdPlacement,
  categoryIds: string[],
  baseContext: AdTargetContext = {},
  options?: { now?: Date }
): Promise<Record<string, EligibleAd | null>> {
  const result: Record<string, EligibleAd | null> = {};
  const activeCampaigns = await getActiveCampaigns(placement);
  if (activeCampaigns.length === 0) {
    for (const id of categoryIds) result[id] = null;
    return result;
  }

  const productsMap = await getProductsSafetyMap();
  const brandCache = new Map<string, Brand | null>();

  for (const categoryId of categoryIds) {
    result[categoryId] = await resolveForContext(
      activeCampaigns,
      productsMap,
      { ...baseContext, categoryId },
      { now: options?.now, brandCache }
    );
  }

  return result;
}

async function resolveForContext(
  activeCampaigns: Campaign[],
  productsMap: Map<string, ProductSafetyProfile>,
  context: AdTargetContext,
  options: { solution?: Solution; now?: Date; brandCache?: Map<string, Brand | null> }
): Promise<EligibleAd | null> {
  const ranked = filterAndRankEligibleCampaigns(activeCampaigns, context, {
    productsMap,
    solution: options.solution,
    now: options.now,
  });

  if (ranked.length === 0) {
    return null;
  }

  const bestCandidate = ranked[0].campaign;
  const brand = await resolveBrand(bestCandidate.brandId, options.brandCache);
  if (!brand) {
    return null;
  }

  const product = bestCandidate.productId ? productsMap.get(bestCandidate.productId) || null : null;

  // Причина допуска — тот же relevance-гейт, что пропустил кампанию: показываем пользователю
  // честное «почему подходит», а не маркетинговую формулировку рекламодателя.
  const reasonText =
    product && bestCandidate.placement === "solution.sponsored_product"
      ? checkProductRelevance({
          product,
          solution: options.solution,
          surface: context.surface || options.solution?.surface,
          campaignTargetSolutions: bestCandidate.targetSolutions,
          campaignTargetSurfaces: bestCandidate.targetSurfaces,
        }).reason
      : undefined;

  return resolveEligibleAd(bestCandidate, { brand, product, reasonText });
}

async function resolveBrand(brandId: string, cache?: Map<string, Brand | null>): Promise<Brand | null> {
  if (cache?.has(brandId)) return cache.get(brandId) ?? null;

  let brand: Brand | null = await getBrandBySlug(brandId);
  if (!brand) {
    const seedBrand = seedBrands.find((b) => b.id === brandId || b.slug === brandId);
    if (seedBrand) {
      brand = {
        id: seedBrand.id,
        slug: seedBrand.slug,
        name: seedBrand.name,
        tagline: seedBrand.tagline,
        accent: seedBrand.accent,
        focus: seedBrand.focus,
        description: seedBrand.description,
        affiliateUrl: seedBrand.affiliateUrl,
        isSponsor: seedBrand.isSponsor,
      };
    }
  }

  cache?.set(brandId, brand);
  return brand;
}

// Счётчики кампаний (currentImpressions/currentClicks) обновляет recordAnalyticsEvent
// в lib/db/queries.ts — в одном D1 batch со вставкой события, через гард changes() > 0.
