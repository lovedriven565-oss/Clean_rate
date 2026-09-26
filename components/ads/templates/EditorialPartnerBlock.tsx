import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AdBadge } from "@/components/ads/AdBadge";
import { AdCta } from "@/components/ads/AdCta";
import { BrandMark } from "@/components/ads/BrandMark";
import { adCtaMeta } from "@/lib/ads/presentation";
import { isLightColor } from "@/lib/brand-utils";
import type { EligibleAd } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * `home.editorial_partner` — единственный партнёрский блок главной, ниже полезного контента.
 * Премиальный, спокойный: фирменный цвет бренда только как свет на фоне и в метке.
 */
export function EditorialPartnerBlock({ ad }: { ad: EligibleAd }) {
  const accent = ad.brandAccent ?? "hsl(var(--primary))";
  const cta = adCtaMeta(ad);

  return (
    <section
      aria-label={`Реклама: партнёр сезона ${ad.brandName}`}
      className="relative overflow-hidden rounded-panel border border-border bg-card"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(ellipse 55% 80% at 100% 0%, ${accent}2b, transparent 68%)` }}
      />

      <div className="relative grid gap-10 p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-16 lg:p-14">
        <div className="max-w-2xl">
          <AdBadge text={ad.badgeText} />

          <div className="mt-6 flex items-center gap-3">
            <BrandMark name={ad.brandName} accent={ad.brandAccent} size="lg" className="lg:hidden" />
            <span className="font-display text-lg font-bold tracking-[-0.02em] text-foreground">{ad.brandName}</span>
          </div>

          <h2 className="mt-4 font-display text-2xl font-bold leading-[1.1] tracking-[-0.035em] text-foreground sm:text-4xl">
            {ad.title}
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">{ad.description}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <AdCta ad={ad} size="lg" />
            <Link
              href={`/brands/${ad.brandSlug}`}
              className="inline-flex h-12 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-semibold text-foreground transition-colors hover:text-primary"
            >
              Профиль бренда
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            {cta.hint}. Размещение оплачено брендом и не влияет на рейтинг компаний и подбор средств в протоколах.
          </p>
        </div>

        <div className="hidden lg:flex lg:items-center lg:justify-center">
          <div
            aria-hidden
            className={cn(
              "relative flex h-52 w-52 items-center justify-center rounded-panel font-display text-8xl font-bold shadow-[0_40px_80px_-30px_hsl(var(--shadow-tint)/0.5)]",
              isLightColor(accent) ? "text-slate-900" : "text-white"
            )}
            style={{ background: `linear-gradient(140deg, ${accent}, ${accent}b3)` }}
          >
            <span className="absolute inset-0 rounded-panel ring-1 ring-inset ring-white/25" />
            <span className="absolute -inset-3 rounded-panel border border-border/70" />
            {ad.brandName.charAt(0)}
          </div>
        </div>
      </div>
    </section>
  );
}
