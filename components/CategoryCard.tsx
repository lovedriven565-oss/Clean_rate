import Link from "next/link";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Brand, Category } from "@/lib/types";
import { Card } from "@/components/ui/primitives";
import { SponsoredCategoryBanner } from "@/components/SponsoredCategoryBanner";

export function CategoryCard({
  category,
  brand,
}: {
  category: Category;
  brand?: Brand;
  index?: number;
}) {
  const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[category.icon] ?? LucideIcons.Sparkles;

  return (
    <Card className="group flex h-full flex-col gap-4 p-5 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl">
      <Link href={`/rating?category=${category.id}`} className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="font-semibold leading-tight text-foreground">{category.name}</h3>
      </Link>
      {brand && <SponsoredCategoryBanner brand={brand} />}
    </Card>
  );
}
