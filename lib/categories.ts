import { seedCategories } from "@/db/seed-data";
import type { Category, CategoryId } from "@/lib/types";

export const CATEGORIES: Category[] = seedCategories as Category[];

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.name])
);

export function getCategoryName(id: string): string {
  return CATEGORY_LABELS[id] ?? id;
}

export function isCategoryId(value: string | null | undefined): value is CategoryId {
  return Boolean(value && value in CATEGORY_LABELS);
}

/**
 * Читаемые slug'и категорий для посадочных страниц /[city]/[category]
 * («/minsk/himchistka-mebeli» вместо «/minsk/upholstery»).
 */
export const CATEGORY_SLUGS: Record<CategoryId, string> = {
  apartments: "uborka-kvartir",
  offices: "uborka-ofisov",
  upholstery: "himchistka-mebeli",
  windows: "myte-okon",
  "post-renovation": "uborka-posle-remonta",
  "deep-cleaning": "generalnaya-uborka",
};

const CATEGORY_BY_SLUG: Record<string, CategoryId> = Object.fromEntries(
  Object.entries(CATEGORY_SLUGS).map(([id, slug]) => [slug, id as CategoryId])
);

export function getCategorySlug(id: CategoryId): string {
  return CATEGORY_SLUGS[id] ?? id;
}

export function getCategoryBySlug(slug: string): CategoryId | undefined {
  return CATEGORY_BY_SLUG[slug];
}

/** URL посадочной «услуга × город»: /minsk/himchistka-mebeli */
export function categoryLandingHref(citySlug: string, categoryId: CategoryId): string {
  return `/${citySlug}/${getCategorySlug(categoryId)}`;
}
