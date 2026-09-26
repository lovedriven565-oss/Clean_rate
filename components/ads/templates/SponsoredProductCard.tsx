import Link from "next/link";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { AdBadge } from "@/components/ads/AdBadge";
import { AdCta } from "@/components/ads/AdCta";
import { BrandMark } from "@/components/ads/BrandMark";
import { adCtaMeta, buildAdReasons } from "@/lib/ads/presentation";
import type { EligibleAd } from "@/lib/types";

/**
 * `solution.sponsored_product` — карточка спонсорского состава ПОСЛЕ независимого протокола.
 * Показывается только если продукт прошёл Safety + Relevance Gate; блок «Почему подходит»
 * собран из тех же проверяемых фактов (pH, допуски производителя, соответствие протоколу).
 */
export function SponsoredProductCard({ ad, surface }: { ad: EligibleAd; surface?: string }) {
  const reasons = buildAdReasons(ad, surface);
  const cta = adCtaMeta(ad);

  return (
    <article
      aria-label={`Реклама: ${ad.title}`}
      className="relative overflow-hidden rounded-panel border border-border bg-card"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full opacity-[0.16] blur-3xl"
        style={{ backgroundColor: ad.brandAccent ?? "hsl(var(--primary))" }}
      />

      <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <AdBadge text={ad.badgeText} />
            <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-success/10 px-2.5 text-[11px] font-semibold text-success">
              <ShieldCheck className="h-3.5 w-3.5" />
              Прошёл проверку безопасности
            </span>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <BrandMark name={ad.brandName} accent={ad.brandAccent} />
            <div className="min-w-0">
              <span className="block text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{ad.brandName}</span>
              {ad.productName && <span className="block truncate text-sm font-medium text-foreground">{ad.productName}</span>}
            </div>
          </div>

          <h3 className="mt-5 font-display text-xl font-bold leading-snug tracking-[-0.03em] text-foreground sm:text-2xl">
            {ad.title}
          </h3>
          <p className="mt-3 text-[15px] leading-7 text-muted-foreground">{ad.description}</p>

          <div className="mt-auto pt-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <AdCta ad={ad} />
              <Link
                href={`/brands/${ad.brandSlug}`}
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-semibold text-foreground transition-colors hover:text-primary"
              >
                О бренде
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">{cta.hint}</p>
          </div>
        </div>

        <aside className="rounded-panel border border-border/70 bg-muted/40 p-5 sm:p-6">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-foreground">Почему подходит</span>
          <ul className="mt-4 space-y-3">
            {reasons.map((reason) => (
              <li key={reason} className="flex gap-3 text-sm leading-6 text-foreground">
                <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {reason}
              </li>
            ))}
          </ul>
          <p className="mt-5 border-t border-border/70 pt-4 text-xs leading-5 text-muted-foreground">
            Допуск выдан автоматически по паспорту продукта и протоколу задачи. Платное размещение не меняет
            рекомендации в протоколе выше и не влияет на рейтинг.
          </p>
        </aside>
      </div>
    </article>
  );
}
