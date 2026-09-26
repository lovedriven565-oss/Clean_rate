import Link from "next/link";
import { BrandMark } from "@/components/ads/BrandMark";
import type { Brand } from "@/lib/types";

/** Статичный каталог брендов профи: реальные марки, аккуратная сетка, без бесконечной прокрутки. */
export function BrandsStrip({ brands }: { brands: Brand[] }) {
  if (brands.length === 0) return null;

  return (
    <div className="container">
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={`/brands/${brand.slug}`}
            className="group inline-flex items-center gap-2.5 rounded-full border border-border/80 bg-card/75 px-4 py-2 text-sm font-semibold text-muted-foreground transition-all duration-200 hover:border-primary/40 hover:bg-card hover:text-foreground hover:shadow-sm"
          >
            <BrandMark name={brand.name} accent={brand.accent} size="sm" />
            <span className="font-display tracking-tight text-foreground">{brand.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
