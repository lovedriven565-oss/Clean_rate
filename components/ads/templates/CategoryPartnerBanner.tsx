import { AdBadge } from "@/components/ads/AdBadge";
import { AdCta } from "@/components/ads/AdCta";
import { BrandMark } from "@/components/ads/BrandMark";
import type { EligibleAd } from "@/lib/types";

/**
 * `rating.category_partner` — компактный разделитель генерального партнёра категории между
 * фильтрами и списком компаний. Не получает ранг, не вставляется в список как №1.
 */
export function CategoryPartnerBanner({ ad }: { ad: EligibleAd }) {
  const accent = ad.brandAccent ?? "hsl(var(--primary))";

  return (
    <aside
      aria-label={`Реклама: партнёр категории ${ad.brandName}`}
      className="relative overflow-hidden rounded-[1.5rem] border border-border bg-card"
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1"
        style={{ background: `linear-gradient(180deg, ${accent}, ${accent} 55%, transparent)` }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-10 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full opacity-[0.1] blur-3xl"
        style={{ backgroundColor: accent }}
      />

      <div className="relative flex flex-col gap-4 p-4 pl-5 sm:flex-row sm:items-center sm:gap-5 sm:p-5 sm:pl-6">
        <BrandMark name={ad.brandName} accent={ad.brandAccent} className="hidden sm:flex" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <BrandMark name={ad.brandName} accent={ad.brandAccent} size="sm" className="sm:hidden" />
            <AdBadge text={ad.badgeText} />
            <span className="text-[11px] font-medium text-muted-foreground">Не участвует в рейтинге</span>
          </div>
          <p className="mt-2 font-display text-[15px] font-bold leading-snug tracking-[-0.02em] text-foreground sm:text-lg">
            {ad.title}
          </p>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{ad.description}</p>
        </div>

        <AdCta ad={ad} variant="secondary" className="w-full sm:w-auto sm:shrink-0" />
      </div>
    </aside>
  );
}
