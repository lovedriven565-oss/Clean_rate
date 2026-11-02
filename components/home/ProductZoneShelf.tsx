"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, FlaskConical, Star } from "lucide-react";
import { useRegion } from "@/components/providers/RegionProvider";
import { trackEvent } from "@/lib/analytics";
import { formatMarketCurrency } from "@/lib/format";
import { HOME_ZONES, displayPrice, productsInZone, type HomeZoneId, type ShelfProduct } from "@/lib/products/zone-shelf";
import { cn } from "@/lib/utils";

/**
 * Витрина «Лучшие средства и техника по зонам дома»: табы по пяти зонам спроса,
 * карточки проверенных средств с человеческими тегами безопасности (без цифр pH)
 * и прямой кнопкой покупки у дилера (трекинг клика, rel="sponsored").
 */
export function ProductZoneShelf({ products }: { products: ShelfProduct[] }) {
  const { market } = useRegion();
  const [zone, setZone] = useState<HomeZoneId>(HOME_ZONES[0].id);
  const zoneInfo = HOME_ZONES.find((z) => z.id === zone)!;
  const items = useMemo(() => productsInZone(products, zone), [products, zone]);

  return (
    <section aria-labelledby="zone-shelf-title" className="container py-12 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-data text-[11px] font-bold uppercase tracking-[0.16em] text-teal">Выбор лаборатории</p>
          <h2 id="zone-shelf-title" className="mt-2 max-w-xl text-balance font-display text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl">
            Лучшие средства и техника по зонам дома
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Только составы и оборудование, проверенные в краш-тестах и протоколах. Цены — ориентир, точную
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
        {items.map((p) => {
          const price = p.price !== undefined ? displayPrice(p.price, market.currency) : null;
          return (
            <article key={p.slug} className="data-surface flex flex-col rounded-panel p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-data text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {p.brandName ?? p.brandId}
                  </p>
                  <h3 className="mt-1 text-pretty font-display text-base font-bold leading-snug text-foreground">
                    {p.name}
                  </h3>
                </div>
                {p.badge && (
                  <span className="shrink-0 rounded-full bg-sponsor/20 px-2.5 py-1 text-[11px] font-bold text-sponsor-foreground">
                    {p.badge}
                  </span>
                )}
              </div>

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
                <div>
                  {p.rating !== undefined && (
                    <p className="flex items-center gap-1 font-data text-sm font-bold text-foreground">
                      <Star className="size-3.5 fill-star text-star" aria-hidden />
                      {p.rating.toFixed(1)}
                    </p>
                  )}
                  <p className="mt-0.5 font-data text-lg font-bold text-foreground">
                    {price ? `${price.approx ? "≈ " : ""}${formatMarketCurrency(price.value, market.currency)}` : "Цена у дилера"}
                  </p>
                </div>
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
                        countryCode: market.countryCode,
                        metadata: { placement: "home.zone_shelf", zone },
                      })
                    }
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-semibold text-ink-foreground transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    Где купить
                    <ArrowUpRight className="size-3.5" aria-hidden />
                  </a>
                ) : (
                  <Link
                    href={`/brands/${p.brandId}`}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:border-ink/40"
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
            </article>
          );
        })}
      </div>
    </section>
  );
}
