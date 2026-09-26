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
