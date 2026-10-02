"use client";

import Link from "next/link";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRegion } from "@/components/providers/RegionProvider";
import { categoryLandingHref } from "@/lib/categories";
import type { Category, Company } from "@/lib/types";

/**
 * Категории одной строкой с реальным числом компаний.
 * Ведут на посадочную «услуга × город» текущего региона — там органический
 * список в SSR-HTML, а не клиентская фильтрация /rating.
 */
export function CategoryPills({ categories, companies }: { categories: Category[]; companies: Company[] }) {
  const { city } = useRegion();

  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      {categories.map((category) => {
        const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[category.icon] ?? LucideIcons.Sparkles;
        const count = companies.filter((c) => c.categories.includes(category.id)).length;
        return (
          <Link
            key={category.id}
            href={categoryLandingHref(city.slug, category.id)}
            className="group inline-flex shrink-0 items-center gap-2.5 rounded-full border border-border bg-card py-2 pl-3 pr-4 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="h-3.5 w-3.5" />
            </span>
            {category.name}
            <span className="font-data text-xs text-muted-foreground">{count}</span>
          </Link>
        );
      })}
    </div>
  );
}
