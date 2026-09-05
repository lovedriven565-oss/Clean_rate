/**
 * Data access layer: чтение компаний, брендов и категорий из D1.
 *
 * В production (Cloudflare Workers) — запросы к D1 через drizzle-orm.
 * В next dev (нет D1 binding) — fallback на seed-data.ts.
 *
 * Все функции возвращают типы из lib/types.ts, чтобы UI-компоненты
 * работали одинаково в обоих режимах.
 */

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import {
  brands,
  cleaningCompanies,
  companyBrands,
  companyCategories,
  intentKeywords,
  priceEstimates,
  ratingSources,
  solutionProducts,
  solutions,
} from "@/db/schema";
import type {
  Brand,
  Category,
  CategoryId,
  Company,
  IntentKeyword,
  PriceEstimate,
  RatingSource,
  Solution,
  SolutionProduct,
} from "@/lib/types";
import { getDb } from "./client";
import {
  seedBrands,
  seedCategories,
  seedCompanies,
  seedIntentKeywords,
  seedPriceEstimates,
  seedSolutionProducts,
  seedSolutions,
} from "@/db/seed-data";

// --- Fallback: маппинг seed-data в типы UI ---

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

function getFallbackCompanies(): Company[] {
  return seedCompanies.map(seedCompanyToCompany);
}

function getFallbackBrands(): Brand[] {
  return seedBrands.map(seedBrandToBrand);
}

function getFallbackCategories(): Category[] {
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

function getFallbackSolutions(): Solution[] {
  return seedSolutions.filter((s) => s.status === "published").map(seedSolutionToSolution);
}

function getFallbackIntentKeywords(): IntentKeyword[] {
  return seedIntentKeywords.map((k) => ({
    id: k.id,
    keyword: k.keyword,
    intent: k.intent,
    weight: k.weight,
    targetKind: k.targetKind,
    targetSlug: k.targetSlug,
  }));
}

function getFallbackPriceEstimates(filter?: {
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

// --- D1: маппинг строк в типы UI ---

interface CompanyRow {
  id: string;
  slug: string;
  name: string;
  legal_name: string | null;
  city: string;
  address: string | null;
  description: string;
  website_url: string | null;
  phone: string | null;
  email: string | null;
  telegram_url: string | null;
  price_from: number | null;
  price_unit: string | null;
  experience_years: number | null;
  cover_image: string | null;
  tags: string | null;
  guarantees: string | null;
  verified: number;
  promoted: number;
}

interface CategoryRow {
  category_id: string;
}

interface RatingRow {
  source: string;
  source_url: string;
  rating: number;
  review_count: number;
}

interface BrandRow {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string;
  focus: string;
  website_url: string | null;
  affiliate_url: string | null;
  accent: string | null;
  is_sponsor: number;
}

interface EquipmentRow {
  brand_id: string;
}

function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseJsonGeneric<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function mapRatingSource(source: string | null): RatingSource {
  if (source === "google") return "google";
  if (source === "yandex") return "yandex";
  return "unverified";
}

function mapCompanyRow(
  row: CompanyRow,
  categories: CategoryRow[],
  ratings: RatingRow[],
  equipment: EquipmentRow[]
): Company {
  const hasRating = ratings.length > 0;
  const primaryRating = ratings[0];
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    categories: categories.map((c) => c.category_id as CategoryId),
    city: row.city,
    address: row.address ?? undefined,
    verified: row.verified === 1,
    promoted: row.promoted === 1,
    equipment: equipment.map((e) => e.brand_id),
    baseRating: hasRating ? primaryRating.rating : 0,
    reviewCount: hasRating ? primaryRating.review_count : 0,
    ratingSource: hasRating ? mapRatingSource(primaryRating.source) : "unverified",
    priceFrom: row.price_from ?? undefined,
    priceUnit: row.price_unit ?? undefined,
    coverImage: row.cover_image ?? `https://picsum.photos/seed/${row.id}/800/600`,
    description: row.description,
    tags: parseJsonArray(row.tags),
    guarantees: parseJsonArray(row.guarantees),
    websiteUrl: row.website_url ?? undefined,
    phone: row.phone ?? undefined,
    telegramUrl: row.telegram_url ?? undefined,
    email: row.email ?? undefined,
    experienceYears: row.experience_years ?? undefined,
  };
}

function mapBrandRow(row: BrandRow): Brand {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline ?? "",
    accent: row.accent ?? "#0EA5E9",
    focus: row.focus as Brand["focus"],
    description: row.description,
    affiliateUrl: row.affiliate_url ?? row.website_url ?? "#",
    isSponsor: row.is_sponsor === 1,
  };
}

// --- Публичные функции ---

export async function getAllCompanies(): Promise<Company[]> {
  const db = getDb();
  if (!db) return getFallbackCompanies();

  const drizzleDb = drizzle(db);

  const companyRows = await drizzleDb
    .select()
    .from(cleaningCompanies)
    .where(eq(cleaningCompanies.status, "published"));

  if (companyRows.length === 0) return getFallbackCompanies();

  const companyIds = companyRows.map((c) => c.id);

  // Категории
  const categoryRows = await drizzleDb.select().from(companyCategories);
  // Рейтинги
  const ratingRows = await drizzleDb.select().from(ratingSources);
  // Техника
  const equipmentRows = await drizzleDb.select().from(companyBrands);

  return companyRows.map((row) => {
    const cats = categoryRows.filter((c) => c.companyId === row.id).map((c) => ({ category_id: c.categoryId }));
    const ratings = ratingRows
      .filter((r) => r.companyId === row.id)
      .map((r) => ({ source: r.source, source_url: r.sourceUrl, rating: r.rating, review_count: r.reviewCount }));
    const equip = equipmentRows.filter((e) => e.companyId === row.id).map((e) => ({ brand_id: e.brandId }));
    return mapCompanyRow(row as unknown as CompanyRow, cats, ratings, equip);
  });
}

export async function getCompanyBySlug(slug: string): Promise<Company | null> {
  const db = getDb();
  if (!db) {
    const fallback = getFallbackCompanies();
    return fallback.find((c) => c.slug === slug) ?? null;
  }

  const drizzleDb = drizzle(db);
  const rows = await drizzleDb.select().from(cleaningCompanies).where(eq(cleaningCompanies.slug, slug)).limit(1);
  if (rows.length === 0) return null;

  const row = rows[0];
  const cats = await drizzleDb.select().from(companyCategories).where(eq(companyCategories.companyId, row.id));
  const ratings = await drizzleDb.select().from(ratingSources).where(eq(ratingSources.companyId, row.id));
  const equip = await drizzleDb.select().from(companyBrands).where(eq(companyBrands.companyId, row.id));

  return mapCompanyRow(
    row as unknown as CompanyRow,
    cats.map((c) => ({ category_id: c.categoryId })),
    ratings.map((r) => ({ source: r.source, source_url: r.sourceUrl, rating: r.rating, review_count: r.reviewCount })),
    equip.map((e) => ({ brand_id: e.brandId }))
  );
}

export async function getAllBrands(): Promise<Brand[]> {
  const db = getDb();
  if (!db) return getFallbackBrands();

  const drizzleDb = drizzle(db);
  const rows = await drizzleDb.select().from(brands).where(eq(brands.status, "published"));
  if (rows.length === 0) return getFallbackBrands();
  return rows.map((row) =>
    mapBrandRow({
      id: row.id,
      slug: row.slug,
      name: row.name,
      tagline: row.tagline,
      description: row.description,
      focus: row.focus,
      website_url: row.websiteUrl,
      affiliate_url: row.affiliateUrl,
      accent: row.accent,
      is_sponsor: row.isSponsor ? 1 : 0,
    })
  );
}

export async function getAllCategories(): Promise<Category[]> {
  return getFallbackCategories();
}

export async function getCompanySlugs(): Promise<string[]> {
  const db = getDb();
  if (!db) return getFallbackCompanies().map((c) => c.slug);

  const drizzleDb = drizzle(db);
  const rows = await drizzleDb.select({ slug: cleaningCompanies.slug }).from(cleaningCompanies);
  return rows.map((r) => r.slug);
}

export async function getAllSolutions(): Promise<Solution[]> {
  const db = getDb();
  if (!db) return getFallbackSolutions();

  const drizzleDb = drizzle(db);
  const rows = await drizzleDb.select().from(solutions).where(eq(solutions.status, "published"));
  if (rows.length === 0) return getFallbackSolutions();

  const brandRows = await drizzleDb.select().from(brands);
  const brandMap = new Map(brandRows.map((b) => [b.id, b.name]));
  const spRows = await drizzleDb.select().from(solutionProducts);

  return rows.map((row) => {
    const products: SolutionProduct[] = spRows
      .filter((sp) => sp.solutionId === row.id)
      .map((sp) => ({
        id: sp.id,
        solutionId: sp.solutionId,
        brandId: sp.brandId ?? undefined,
        productId: sp.productId ?? undefined,
        brandName: sp.brandId ? brandMap.get(sp.brandId) : undefined,
        role: sp.role as "recommended" | "alternative",
        note: sp.note ?? undefined,
      }));

    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      problemType: row.problemType as Solution["problemType"],
      surface: row.surface as Solution["surface"],
      material: row.material ?? undefined,
      severity: row.severity as Solution["severity"],
      audience: row.audience as Solution["audience"],
      diySteps: parseJsonGeneric(row.diySteps, []),
      warnings: parseJsonArray(row.warnings),
      whenToCallPro: row.whenToCallPro,
      diyCostNote: row.diyCostNote ?? undefined,
      proTimeNote: row.proTimeNote ?? undefined,
      searchKeywords: parseJsonArray(row.searchKeywords),
      relatedCategory: (row.relatedCategory as CategoryId) ?? undefined,
      status: row.status as Solution["status"],
      recommendedProducts: products,
    };
  });
}

export async function getSolutionBySlug(slug: string): Promise<Solution | null> {
  const db = getDb();
  if (!db) {
    const fallback = getFallbackSolutions();
    return fallback.find((s) => s.slug === slug) ?? null;
  }

  const drizzleDb = drizzle(db);
  const rows = await drizzleDb.select().from(solutions).where(eq(solutions.slug, slug)).limit(1);
  if (rows.length === 0) {
    const fallback = getFallbackSolutions();
    return fallback.find((s) => s.slug === slug) ?? null;
  }

  const row = rows[0];
  const brandRows = await drizzleDb.select().from(brands);
  const brandMap = new Map(brandRows.map((b) => [b.id, b.name]));
  const spRows = await drizzleDb.select().from(solutionProducts).where(eq(solutionProducts.solutionId, row.id));

  const products: SolutionProduct[] = spRows.map((sp) => ({
    id: sp.id,
    solutionId: sp.solutionId,
    brandId: sp.brandId ?? undefined,
    productId: sp.productId ?? undefined,
    brandName: sp.brandId ? brandMap.get(sp.brandId) : undefined,
    role: sp.role as "recommended" | "alternative",
    note: sp.note ?? undefined,
  }));

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    problemType: row.problemType as Solution["problemType"],
    surface: row.surface as Solution["surface"],
    material: row.material ?? undefined,
    severity: row.severity as Solution["severity"],
    audience: row.audience as Solution["audience"],
    diySteps: parseJsonGeneric(row.diySteps, []),
    warnings: parseJsonArray(row.warnings),
    whenToCallPro: row.whenToCallPro,
    diyCostNote: row.diyCostNote ?? undefined,
    proTimeNote: row.proTimeNote ?? undefined,
    searchKeywords: parseJsonArray(row.searchKeywords),
    relatedCategory: (row.relatedCategory as CategoryId) ?? undefined,
    status: row.status as Solution["status"],
    recommendedProducts: products,
  };
}

export async function getSolutionSlugs(): Promise<string[]> {
  const db = getDb();
  if (!db) return getFallbackSolutions().map((s) => s.slug);

  const drizzleDb = drizzle(db);
  const rows = await drizzleDb
    .select({ slug: solutions.slug })
    .from(solutions)
    .where(eq(solutions.status, "published"));
  if (rows.length === 0) return getFallbackSolutions().map((s) => s.slug);
  return rows.map((r) => r.slug);
}

export async function getSolutionsByCategory(category: CategoryId): Promise<Solution[]> {
  const all = await getAllSolutions();
  return all.filter((s) => s.relatedCategory === category);
}

export async function getPriceEstimates(filter?: {
  solutionId?: string;
  categoryId?: CategoryId;
  countryCode?: string;
}): Promise<PriceEstimate[]> {
  const db = getDb();
  if (!db) return getFallbackPriceEstimates(filter);

  const drizzleDb = drizzle(db);
  const rows = await drizzleDb.select().from(priceEstimates);
  if (rows.length === 0) return getFallbackPriceEstimates(filter);

  return rows
    .filter((row) => {
      if (filter?.solutionId && row.solutionId !== filter.solutionId) return false;
      if (filter?.categoryId && row.categoryId !== filter.categoryId) return false;
      if (filter?.countryCode && row.countryCode !== filter.countryCode) return false;
      return true;
    })
    .map((row) => ({
      id: row.id,
      solutionId: row.solutionId ?? undefined,
      categoryId: (row.categoryId as CategoryId) ?? undefined,
      countryCode: row.countryCode,
      city: row.city ?? undefined,
      currency: row.currency,
      priceMin: row.priceMin,
      priceMax: row.priceMax,
      unit: row.unit ?? undefined,
      note: row.note ?? undefined,
    }));
}

export async function getIntentKeywords(): Promise<IntentKeyword[]> {
  const db = getDb();
  if (!db) return getFallbackIntentKeywords();

  const drizzleDb = drizzle(db);
  const rows = await drizzleDb.select().from(intentKeywords);
  if (rows.length === 0) return getFallbackIntentKeywords();

  return rows.map((row) => ({
    id: row.id,
    keyword: row.keyword,
    intent: row.intent as IntentKeyword["intent"],
    weight: row.weight,
    targetKind: row.targetKind as IntentKeyword["targetKind"],
    targetSlug: row.targetSlug,
  }));
}
