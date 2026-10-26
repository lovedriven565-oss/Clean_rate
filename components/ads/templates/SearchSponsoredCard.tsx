import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { AdBadge } from "@/components/ads/AdBadge";
import { AdCta } from "@/components/ads/AdCta";
import { BrandMark } from "@/components/ads/BrandMark";
import type { EligibleAd } from "@/lib/types";

/**
 * `search.sponsored_result` — компактная нативная карточка спонсорского ответа
 * в поисковой выдаче или быстрой диагностике. Без лишнего шума: марка бренда,
 * pH-допуск (если есть), короткий ответ и прямое действие.
 */
export function SearchSponsoredCard({ ad }: { ad: EligibleAd }) {
  return (
    <aside
      aria-label={`Реклама в поиске: ${ad.title}`}
      className="data-surface linear-beam relative overflow-hidden rounded-panel p-4 sm:p-5"
    >
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <AdBadge text={ad.badgeText} />
            {ad.productPh !== undefined && (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 font-data text-[11px] font-semibold text-success">
                <ShieldCheck className="h-3 w-3 shrink-0" aria-hidden />
                pH {ad.productPh} · проверено
              </span>
            )}
          </div>

          <div className="mt-2.5 flex items-center gap-2.5">
            <BrandMark name={ad.brandName} accent={ad.brandAccent} size="sm" />
            <div className="min-w-0">
              <Link
                href={`/brands/${ad.brandSlug}`}
                className="font-display text-base font-bold leading-snug text-foreground hover:text-link"
              >
                {ad.title}
              </Link>
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{ad.description}</p>
            </div>
          </div>
        </div>

        <AdCta ad={ad} variant="secondary" className="w-full sm:w-auto sm:shrink-0" />
      </div>
    </aside>
  );
}
