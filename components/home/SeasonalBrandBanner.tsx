"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Star } from "lucide-react";
import { AdBadge } from "@/components/ads/AdBadge";
import { AdCta } from "@/components/ads/AdCta";
import { AdImpression } from "@/components/ads/AdImpression";
import { AdSlotPlaceholder } from "@/components/ads/AdSlotPlaceholder";
import { BrandMark } from "@/components/ads/BrandMark";
import { useRegion } from "@/components/providers/RegionProvider";
import { isAdVisibleInCountry, buildSlotPlaceholder } from "@/lib/ads/presentation";
import { getAdFormat } from "@/lib/ads/media-kit";
import { HOME_ZONES, displayPrice, type ShelfProduct } from "@/lib/products/zone-shelf";
import { formatMarketCurrency } from "@/lib/format";
import type { CountryCode } from "@/lib/markets";
import type { EligibleAd } from "@/lib/types";

const SPRAY_IMAGE = "/lovable/spray.jpg";

function formatEndsAt(ts: number): string {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(new Date(ts));
}

/**
 * «Спецпроект сезона» — единственный коммерческий блок главной.
 * Активная кампания показывается с маркировкой «Реклама»; без кампании —
 * компактная заглушка «место свободно» со ссылкой на `/for-brands?format=editorial-partner`,
 * чтобы бренды видели продаваемый слот.
 */
export function SeasonalBrandBanner({
  ads,
  shelfProducts = [],
}: {
  ads: Partial<Record<CountryCode, EligibleAd | null>>;
  shelfProducts?: ShelfProduct[];
}) {
  const { countryCode, market } = useRegion();
  const ad = ads[countryCode] ?? null;
  const visible = ad && isAdVisibleInCountry(ad, countryCode);

  if (!visible) {
    const meta = buildSlotPlaceholder({
      placement: "home.editorial_partner",
      format: getAdFormat("editorial-partner") ?? null,
      label: "Спецпроект сезона на главной",
    });
    if (!meta) return null;
    return (
      <section id="special" aria-label="Свободный рекламный слот" className="my-4">
        <AdSlotPlaceholder meta={meta} variant="strip" className="w-full" />
      </section>
    );
  }

  const ad_ = ad!;
  const brandName = ad_.brandName;
  const brandSlug = ad_.brandSlug;
  const title = ad_.title;
  const description = ad_.description;
  const priceProduct = shelfProducts.find((p) => p.id === ad_.productId || p.slug === ad_.productSlug);
  const price =
    priceProduct?.price !== undefined ? displayPrice(priceProduct.price, market.currency) : null;

  // Зоны — только реальные зоны товара кампании; без товара — зоны бренда.
  const zoneSource = priceProduct ? [priceProduct] : shelfProducts.filter((p) => p.brandId === ad_.brandId);
  const chips = [
    ...new Set(zoneSource.flatMap((p) => p.zones.map((z) => HOME_ZONES.find((h) => h.id === z)?.label ?? z))),
  ].slice(0, 3);

  const meta: string[] = [];
  if (price) meta.push(`от ${formatMarketCurrency(price.value, market.currency)}`);
  if (ad_.endsAt) meta.push(`до ${formatEndsAt(ad_.endsAt)}`);

  const section = (
        <section
          id="special"
          aria-label={`Реклама: спецпроект сезона ${brandName}`}
          className="relative my-4 overflow-hidden rounded-panel border border-lime/40 bg-card p-6 sm:p-8 lg:p-10"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse 45% 75% at 100% 0%, hsl(var(--lime) / 0.22), transparent 65%)" }}
          />

          <div className="relative grid items-center gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.5fr)_minmax(0,0.9fr)]">
            {/* Левая колонка — карточка флакона */}
            <div className="relative mx-auto w-full max-w-xs overflow-hidden rounded-panel border border-border bg-muted lg:mx-0">
              <div className="relative aspect-[4/3]">
                <Image src={SPRAY_IMAGE} alt={brandName} fill sizes="(min-width: 1024px) 320px, 90vw" className="object-cover" />
              </div>
              <span className="absolute left-3 top-3 rounded-[6px] bg-lime px-2.5 py-1 font-data text-xs font-bold text-ink">
                Спецпроект
              </span>
            </div>

            {/* Центр — оффер */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <AdBadge text={ad_.badgeText} />
                <span className="font-data text-[11px] font-bold uppercase tracking-[0.16em] text-teal">
                  Спецпроект сезона · Партнёр {brandName}
                </span>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <BrandMark name={brandName} accent={ad_.brandAccent} size="md" />
                <span className="font-display text-lg font-bold tracking-[-0.02em] text-foreground">{brandName}</span>
              </div>

              <h2 className="mt-4 text-balance font-display text-2xl font-bold leading-[1.1] tracking-[-0.035em] text-foreground sm:text-4xl">
                {title}
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">{description}</p>

              {meta.length > 0 && (
                <p className="mt-3 flex items-center gap-2 font-data text-sm font-bold text-teal">
                  <Star className="size-3.5 fill-teal" aria-hidden />
                  {meta.join(" · ")}
                </p>
              )}

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <AdCta ad={ad_} variant="primary" size="lg" />
                <Link
                  href={`/brands/${brandSlug}`}
                  className="inline-flex h-12 items-center justify-center gap-1.5 rounded-control bg-lime px-6 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  Смотреть линейку
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
              <p className="mt-4 text-xs leading-5 text-muted-foreground">
                Размещение оплачено брендом и не влияет на рейтинг компаний и подбор средств в протоколах.
              </p>
            </div>

            {/* Правая колонка — быстрые кнопки реальных зон товара */}
            {chips.length > 0 && (
              <div className="flex flex-col gap-2.5">
                <p className="font-data text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  Где применяется
                </p>
                {chips.map((chip) => (
                  <Link
                    key={chip}
                    href={`/brands/${brandSlug}`}
                    className="group flex min-h-11 items-center justify-between gap-2 rounded-control border border-border bg-muted/50 px-4 text-sm font-medium text-foreground transition-colors hover:border-lime/60"
                  >
                    {chip}
                    <ArrowRight className="size-4 text-teal transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
  );

  // Без Reveal-обёртки: блок идёт сразу под hero — до гидрации opacity:0
  // выглядит как пустое поле на первом экране.
  return <AdImpression ad={ad_}>{section}</AdImpression>;
}
