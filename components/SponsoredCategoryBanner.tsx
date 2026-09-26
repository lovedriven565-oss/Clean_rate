import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Brand } from "@/lib/types";
import { AdBadge } from "@/components/ads/AdBadge";
import { BrandMark } from "@/components/ads/BrandMark";

/**
 * Компактная подпись «При поддержке» для карточек категорий. Маркировка — видимым текстом
 * («Реклама»), в общей модели с components/ads, а не скрытым title.
 */
export function SponsoredCategoryBanner({ brand }: { brand: Brand }) {
  return (
    <Link
      href={`/brands/${brand.slug}`}
      className="group flex min-h-11 items-center justify-between gap-2 rounded-xl border border-border/60 bg-gradient-to-r from-muted/60 to-transparent px-3 py-2 transition-colors hover:border-primary/40 hover:bg-muted"
    >
      <span className="flex min-w-0 items-center gap-2">
        <BrandMark name={brand.name} accent={brand.accent} size="sm" className="h-6 w-6 rounded-full text-[10px]" />
        <span className="truncate text-xs text-muted-foreground">
          При поддержке{" "}
          <span className="font-semibold" style={{ color: brand.accent }}>
            {brand.name}
          </span>
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1">
        <AdBadge text="Реклама" className="h-6 px-2 text-[10px]" />
        <ArrowUpRight className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </span>
    </Link>
  );
}
