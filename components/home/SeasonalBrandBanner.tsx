"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AdBadge } from "@/components/ads/AdBadge";
import { AdCta } from "@/components/ads/AdCta";
import { AdImpression } from "@/components/ads/AdImpression";
import { BrandMark } from "@/components/ads/BrandMark";
import { Reveal } from "@/components/home/Reveal";
import { useRegion } from "@/components/providers/RegionProvider";
import { isAdVisibleInCountry } from "@/lib/ads/presentation";
import { HOME_ZONES, type ShelfProduct } from "@/lib/products/zone-shelf";
import type { CountryCode } from "@/lib/markets";
import type { EligibleAd } from "@/lib/types";

/**
 * «Спецпроект сезона»: тёмный партнёрский блок главной в стиле ink/lime.
 * Быстрые чипы применения выводятся из зон витрины, где есть продукты бренда —
 * они ведут на страницу бренда, а не притворяются органическими рекомендациями.
 * Показы и клики трекаются через AdImpression и AdCta как у любого креатива.
 */
export function SeasonalBrandBanner({
  ads,
  shelfProducts = [],
}: {
  ads: Partial<Record<CountryCode, EligibleAd | null>>;
  shelfProducts?: ShelfProduct[];
}) {
  const { countryCode } = useRegion();
  const ad = ads[countryCode] ?? null;
  if (!ad || !isAdVisibleInCountry(ad, countryCode)) return null;

  const chips = [
    ...new Set(
      shelfProducts.filter((p) => p.brandId === ad.brandId).flatMap((p) => p.zones.map((z) => HOME_ZONES.find((h) => h.id === z)?.label ?? z)),
    ),
  ].slice(0, 3);

  return (
    <Reveal>
      <AdImpression ad={ad}>
        <section
          aria-label={`Реклама: спецпроект сезона ${ad.brandName}`}
          className="relative overflow-hidden rounded-panel border border-lime/25 bg-ink p-7 text-ink-foreground sm:p-10 lg:p-12"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse 45% 75% at 100% 0%, hsl(var(--lime) / 0.16), transparent 65%)" }}
          />

          <div className="relative max-w-2xl">
            <div className="flex flex-wrap items-center gap-3">
              <AdBadge text={ad.badgeText} />
              <span className="font-data text-[11px] font-bold uppercase tracking-[0.16em] text-lime">
                Спецпроект сезона · Партнёр {ad.brandName}
              </span>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <BrandMark name={ad.brandName} accent={ad.brandAccent} size="md" />
              <span className="font-display text-lg font-bold tracking-[-0.02em]">{ad.brandName}</span>
            </div>

            <h2 className="mt-4 font-display text-2xl font-bold leading-[1.1] tracking-[-0.035em] sm:text-4xl">
              {ad.title}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-ink-foreground/70">{ad.description}</p>

            {chips.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {chips.map((chip) => (
                  <span key={chip} className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-ink-foreground/85">
                    {chip}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <AdCta ad={ad} variant="onDark" size="lg" />
              <Link
                href={`/brands/${ad.brandSlug}`}
                className="inline-flex h-12 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-semibold text-lime transition-colors hover:underline"
              >
                Линейка бренда
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="mt-4 text-xs leading-5 text-ink-foreground/50">
              Размещение оплачено брендом и не влияет на рейтинг компаний и подбор средств в протоколах.
            </p>
          </div>
        </section>
      </AdImpression>
    </Reveal>
  );
}
