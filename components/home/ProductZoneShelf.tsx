"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { useRegion } from "@/components/providers/RegionProvider";
import { formatMarketCurrency } from "@/lib/format";
import { CLEANING_SERVICES, pickCategoryEstimate } from "@/lib/home/cleaning-services";
import { HOME_ZONES, productsInZone, type HomeZoneId, type ShelfProduct } from "@/lib/products/zone-shelf";
import { cn } from "@/lib/utils";
import type { PriceEstimate } from "@/lib/types";

/**
 * Витрина «Лучшие средства и техника по зонам дома»: табы по пяти зонам спроса
 * и единые товарные карточки ProductCard. На мобильном — горизонтальная
 * лента со snap, карточки ≈75% ширины; со смолы — сетка.
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

      <div className="no-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
        {items.map((p) => (
          <div key={p.slug} className="w-[75%] shrink-0 snap-start sm:w-auto sm:shrink">
            <ProductCard product={p} currency={market.currency} countryCode={market.countryCode} placement="home.zone_shelf" />
          </div>
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
