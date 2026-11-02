"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, FlaskConical, Star } from "lucide-react";
import { AdBadge } from "@/components/ads/AdBadge";
import { AdCta } from "@/components/ads/AdCta";
import { AdImpression } from "@/components/ads/AdImpression";
import { BrandMark } from "@/components/ads/BrandMark";
import { Reveal } from "@/components/home/Reveal";
import { useRegion } from "@/components/providers/RegionProvider";
import { isAdVisibleInCountry } from "@/lib/ads/presentation";
import { HOME_ZONES, displayPrice, type ShelfProduct } from "@/lib/products/zone-shelf";
import { formatMarketCurrency } from "@/lib/format";
import type { CountryCode } from "@/lib/markets";
import type { EligibleAd } from "@/lib/types";

const SPRAY_IMAGE = "/lovable/spray.jpg";

/**
 * «Спецпроект сезона»: тёмный контрастный блок главной в стиле Lovable —
 * фото флакона слева, оффер по центру, быстрые кнопки задач справа.
 * Активная кампания показывается с маркировкой «Реклама» и трекингом
 * (AdImpression/AdCta). Без кампании блок показывает редакционный выбор
 * лаборатории — средство, реально протестированное в протоколах, без
 * пометок «партнёр» и «реклама».
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

  // Редакционный выбор: бренд активной кампании, иначе — протестированный товар
  // витрины (приоритет — товару с бейджем и привязкой к протоколу).
  const fallback = [...shelfProducts]
    .sort((a, b) => Number(Boolean(b.badge && b.solutionSlug)) - Number(Boolean(a.badge && a.solutionSlug)) || (b.rating ?? 0) - (a.rating ?? 0))
    .find((p) => Boolean(visible ? p.brandId === ad!.brandId : p.affiliateUrl || p.solutionSlug));

  if (!visible && !fallback) return null;

  const brandName = visible ? ad!.brandName : fallback!.brandName ?? fallback!.brandId;
  const brandSlug = visible ? ad!.brandSlug : fallback!.brandId;
  const title = visible ? ad!.title : `${fallback!.name} — выбор лаборатории сезона`;
  const description = visible
    ? ad!.description
    : fallback!.pros[0] ?? "Состав прошёл наши краш-тесты и используется в пошаговых протоколах ChistoLab.";
  const price =
    !visible && fallback!.price !== undefined
      ? displayPrice(fallback!.price, market.currency)
      : null;

  const chips = [
    ...new Set(
      shelfProducts
        .filter((p) => p.brandId === (visible ? ad!.brandId : fallback!.brandId))
        .flatMap((p) => p.zones.map((z) => HOME_ZONES.find((h) => h.id === z)?.label ?? z)),
    ),
  ].slice(0, 3);

  const section = (
        <section
          aria-label={visible ? `Реклама: спецпроект сезона ${brandName}` : `Выбор лаборатории: ${brandName}`}
          className="relative my-4 overflow-hidden rounded-panel border border-lime/25 bg-ink p-6 text-ink-foreground sm:p-8 lg:p-10"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse 45% 75% at 100% 0%, hsl(var(--lime) / 0.16), transparent 65%)" }}
          />

          <div className="relative grid items-center gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.5fr)_minmax(0,0.9fr)]">
            {/* Левая колонка — карточка флакона */}
            <div className="relative mx-auto w-full max-w-xs overflow-hidden rounded-panel border border-white/10 bg-white/5 lg:mx-0">
              <div className="relative aspect-[4/3]">
                <Image src={SPRAY_IMAGE} alt={brandName} fill sizes="(min-width: 1024px) 320px, 90vw" className="object-cover" />
              </div>
              <span className="absolute left-3 top-3 rounded-[6px] bg-lime px-2.5 py-1 font-data text-xs font-bold text-ink">
                {visible ? "Спецпроект" : "Тест месяца"}
              </span>
            </div>

            {/* Центр — оффер */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                {visible && <AdBadge text={ad!.badgeText} />}
                <span className="font-data text-[11px] font-bold uppercase tracking-[0.16em] text-lime">
                  {visible ? `Спецпроект сезона · Партнёр ${brandName}` : "Выбор лаборатории"}
                </span>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <BrandMark name={brandName} accent={visible ? ad!.brandAccent : undefined} size="md" />
                <span className="font-display text-lg font-bold tracking-[-0.02em]">{brandName}</span>
              </div>

              <h2 className="mt-4 text-balance font-display text-2xl font-bold leading-[1.1] tracking-[-0.035em] sm:text-4xl">
                {title}
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-ink-foreground/70">{description}</p>

              {price && (
                <p className="mt-3 flex items-center gap-2 font-data text-sm font-bold text-lime">
                  <Star className="size-3.5 fill-lime" aria-hidden />
                  {`≈ ${formatMarketCurrency(price.value, market.currency)} · проверен в протоколах ChistoLab`}
                </p>
              )}

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                {visible ? (
                  <AdCta ad={ad!} variant="onDark" size="lg" />
                ) : null}
                <Link
                  href={`/brands/${brandSlug}`}
                  className="inline-flex h-12 items-center justify-center gap-1.5 rounded-control bg-lime px-6 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  {visible ? "Смотреть линейку" : "Вся линейка бренда"}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
              <p className="mt-4 text-xs leading-5 text-ink-foreground/50">
                {visible
                  ? "Размещение оплачено брендом и не влияет на рейтинг компаний и подбор средств в протоколах."
                  : "Редакционный выбор: средство реально фигурирует в протоколах лаборатории. Оплата на подбор не влияет."}
              </p>
            </div>

            {/* Правая колонка — быстрые кнопки задач/зон */}
            {chips.length > 0 && (
              <div className="flex flex-col gap-2.5">
                <p className="font-data text-[10px] font-bold uppercase tracking-[0.16em] text-ink-foreground/50">
                  Где применяется
                </p>
                {chips.map((chip) => (
                  <Link
                    key={chip}
                    href={`/brands/${brandSlug}`}
                    className="group flex min-h-11 items-center justify-between gap-2 rounded-control border border-white/15 bg-white/5 px-4 text-sm font-medium text-ink-foreground/90 transition-colors hover:border-lime/50 hover:text-ink-foreground"
                  >
                    {chip}
                    <ArrowRight className="size-4 text-lime transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
  );

  return <Reveal>{visible ? <AdImpression ad={ad!}>{section}</AdImpression> : section}</Reveal>;
}
