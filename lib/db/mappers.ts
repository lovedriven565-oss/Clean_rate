import type { Brand, CategoryId, Company, RatingSource } from "@/lib/types";

export interface CompanyRow {
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

export interface CategoryRow {
  category_id: string;
}

export interface RatingRow {
  source: string;
  source_url: string;
  rating: number;
  review_count: number;
}

export interface BrandRow {
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

export interface EquipmentRow {
  brand_id: string;
}

export function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function parseJsonGeneric<T>(value: string | null, fallback: T): T {
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

export function mapCompanyRow(
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
    coverImage: row.cover_image ?? undefined,
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

export function mapBrandRow(row: BrandRow): Brand {
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
