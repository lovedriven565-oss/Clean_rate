import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { AdBadge } from "@/components/ads/AdBadge";
import { AdCta } from "@/components/ads/AdCta";
import { BrandMark } from "@/components/ads/BrandMark";
import { describePh } from "@/lib/ads/presentation";
import type { EligibleAd } from "@/lib/types";

/**
 * `products.sponsored_slot` — нативная карточка рекомендуемого состава/оборудования
 * в товарных полках и каталоге средств.
 */
export function ProductSponsoredSlotCard({ ad }: { ad: EligibleAd }) {
  return (
    <article
      aria-label={`Реклама: ${ad.title}`}
      className="data-surface linear-beam relative flex flex-col justify-between gap-4 rounded-panel p-5 sm:p-6"
    >
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <AdBadge text={ad.badgeText} />
          {ad.productPh !== undefined && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 font-data text-[11px] font-semibold text-success">
              <ShieldCheck className="h-3 w-3 shrink-0" aria-hidden />
              {describePh(ad.productPh)}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <BrandMark name={ad.brandName} accent={ad.brandAccent} size="sm" />
          <Link
            href={`/brands/${ad.brandSlug}`}
            className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
          >
            {ad.brandName}
          </Link>
        </div>

        <h3 className="mt-3 font-display text-lg font-bold leading-snug tracking-[-0.02em] text-foreground">
          {ad.title}
        </h3>
        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{ad.description}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
        <AdCta ad={ad} />
        <Link href={`/brands/${ad.brandSlug}`} className="text-xs font-semibold text-link hover:underline">
          Паспорт бренда
        </Link>
      </div>
    </article>
  );
}
