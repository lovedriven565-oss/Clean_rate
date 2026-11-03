"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, FlaskConical, Sparkles, Star, Wrench } from "lucide-react";
import { useRegion } from "@/components/providers/RegionProvider";
import { trackEvent } from "@/lib/analytics";
import { formatMarketCurrency } from "@/lib/format";
import { CLEANING_SERVICES, pickCategoryEstimate } from "@/lib/home/cleaning-services";
import { HOME_ZONES, displayPrice, productsInZone, type HomeZoneId, type ShelfProduct } from "@/lib/products/zone-shelf";
import { cn } from "@/lib/utils";
import type { PriceEstimate } from "@/lib/types";

const SPRAY_IMAGE = "/lovable/spray.jpg";

/**
 * Витрина «Лучшие средства и техника по зонам дома»: табы по пяти зонам спроса,
 * товарные карточки с фото, человеческими тегами безопасности (без цифр pH),
 * рейтингом, ценой в валюте региона и кнопкой покупки (трекинг, rel="sponsored").
 */
export function ProductZoneShelf({ products, estimates }: { products: ShelfProduct[]; estimates: PriceEstimate[] }) {
  const { market, city } = useRegion();
  const [zone, setZone] = useState<HomeZoneId>(HOME_ZONES[0].id);
  const zoneInfo = HOME_ZONES.find((z) => z.id === zone)!;
  const items = useMemo(() => productsInZone(products, zone), [products, zone]);

  const ctx = { countryCode: market.countryCode, city: city.name };
  const rescueEstimate = pickCategoryEstimate(estimates, CLEANING_SERVICES[0].id, ctx);

  return (
    <section id="shelf" aria-labelledby="zone-shelf-title" className="container scroll-mt-24 py-12 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-data text-[11px] font-bold uppercase tracking-[0.16em] text-teal">Выбор лаборатории</p>
          <h2 id="zone-shelf-title" className="mt-2 max-w-xl text-balance font-display text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl">
            Лучшие средства и техника по зонам дома
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Составы и оборудование, подобранные по составу и типу поверхности. Цены — ориентир, точную
            стоимость смотрите у дилера.
          </p>
        </div>
      </div>

      <div role="tablist" aria-label="Зоны дома" className="no-scrollbar -mx-4 mt-7 flex gap-2 overflow-x-auto px-4 pb-1">
        {HOME_ZONES.map((z) => (
          <button
            key={z.id}
            type="button"
            role="tab"
            aria-selected={zone === z.id}
            onClick={() => setZone(z.id)}
            className={cn(
              "min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors",
              zone === z.id
                ? "border-ink bg-ink text-ink-foreground"
                : "border-border bg-card text-muted-foreground hover:border-ink/40 hover:text-foreground",
            )}
          >
            {z.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{zoneInfo.tagline}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <ProductCard key={p.slug} product={p} zone={zone} currency={market.currency} countryCode={market.countryCode} />
        ))}
      </div>

      {/* Мостик к клинерам и ИИ-технологу — как в прототипе Lovable */}
      <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-panel border border-dashed border-ink/25 bg-card p-5 sm:flex-row sm:items-center sm:p-6">
        <p className="text-sm leading-6 text-foreground">
          <b>Пятно уже въелось?</b>{" "}
          <span className="text-muted-foreground">
            Проверенные мастера в {city.nameIn}
            {rescueEstimate ? ` — выезд от ${formatMarketCurrency(rescueEstimate.priceMin, rescueEstimate.currency as "BYN" | "RUB" | "KZT")}` : ""}
          </span>
        </p>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/rating"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-control bg-ink px-5 text-sm font-semibold text-ink-foreground transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
          >
            Выбрать клинера
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
          <Link
            href="/assistant"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-control border border-teal/30 bg-teal/10 px-5 text-sm font-semibold text-teal transition-colors hover:bg-teal/15"
          >
            <Sparkles className="size-4" aria-hidden />
            Спросить ИИ-технолога
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProductCard({
  product: p,
  zone,
  currency,
  countryCode,
}: {
  product: ShelfProduct;
  zone: HomeZoneId;
  currency: "BYN" | "RUB" | "KZT";
  countryCode: string;
}) {
  const price = p.price !== undefined ? displayPrice(p.price, currency) : null;
  const isEquipment = p.zones.length === 1 && p.zones[0] === "equipment";

  return (
    <article className="data-surface flex flex-col overflow-hidden rounded-panel">
      {/* Товарное фото с бейджем и рейтингом — как в прототипе Lovable */}
      <div className="relative aspect-[4/3] bg-muted">
        {isEquipment ? (
          <div className="flex h-full w-full items-center justify-center bg-ink">
            <Wrench className="size-12 text-lime" aria-hidden />
          </div>
        ) : (
          <Image
            src={SPRAY_IMAGE}
            alt={p.name}
            fill
            sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        )}
        {p.rating !== undefined && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-[6px] bg-ink/85 px-2 py-1 font-data text-[11px] font-bold text-white">
            <Star className="size-3 fill-star text-star" aria-hidden />
            {p.rating.toFixed(1)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="truncate font-data text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {p.brandName ?? p.brandId}
        </p>
        <h3 className="mt-1 text-pretty font-display text-base font-bold leading-snug text-foreground">
          {p.name}
        </h3>

        {p.safetyTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {p.safetyTags.map((tag) => (
              <span
                key={tag}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                  tag.startsWith("Не для") || tag.startsWith("Сильн")
                    ? "border-star/30 bg-star/10 text-foreground"
                    : "border-success/25 bg-success/10 text-foreground",
                )}
              >
                <FlaskConical className="size-3 opacity-60" aria-hidden />
                {tag}
              </span>
            ))}
          </div>
        )}

        <ul className="mt-3 space-y-1 text-[13px] leading-snug text-muted-foreground">
          {p.pros.slice(0, 3).map((pro) => (
            <li key={pro} className="flex gap-2">
              <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-full bg-teal" />
              {pro}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <p className="font-data text-xl font-bold text-foreground">
            {price ? `${price.approx ? "≈ " : ""}${formatMarketCurrency(price.value, currency)}` : "Цена у дилера"}
          </p>
          {p.affiliateUrl ? (
            <a
              href={p.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={() =>
                trackEvent({
                  entityType: "product",
                  entityId: p.id,
                  eventType: "website",
                  countryCode,
                  metadata: { placement: "home.zone_shelf", zone },
                })
              }
              className="inline-flex min-h-11 items-center gap-1.5 rounded-control bg-ink px-4 text-sm font-semibold text-ink-foreground transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Купить
              <ArrowUpRight className="size-3.5" aria-hidden />
            </a>
          ) : (
            <Link
              href={`/brands/${p.brandId}`}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-control border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:border-ink/40"
            >
              У бренда
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          )}
        </div>

        {p.solutionSlug && (
          <Link href={`/solutions/${p.solutionSlug}`} className="mt-3 border-t border-border pt-3 text-xs font-semibold text-teal hover:underline">
            В протоколе лаборатории →
          </Link>
        )}
      </div>
    </article>
  );
}
