"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, FlaskConical, Star, Wrench } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { formatMarketCurrency } from "@/lib/format";
import { displayPrice, type ShelfProduct } from "@/lib/products/zone-shelf";
import { cn } from "@/lib/utils";

const SPRAY_IMAGE = "/lovable/spray.jpg";

type Currency = "BYN" | "RUB" | "KZT";

/**
 * Единая карточка товара витрины: фото, бренд, название, 1–2 тега безопасности,
 * ★ если есть, ориентир цены и «Где купить» (трекинг, rel="sponsored").
 * variant="compact" — горизонтальная строка для колонки «Спасателя пятен».
 */
export function ProductCard({
  product: p,
  currency,
  countryCode,
  placement,
  variant = "full",
}: {
  product: ShelfProduct;
  currency: Currency;
  countryCode: string;
  /** Аналитический плейсмент показа (home.zone_shelf, home.rescue …) */
  placement: string;
  variant?: "full" | "compact";
}) {
  const price = p.price !== undefined ? displayPrice(p.price, currency) : null;
  const isEquipment = p.zones.length === 1 && p.zones[0] === "equipment";

  function trackBuy() {
    trackEvent({
      entityType: "product",
      entityId: p.id,
      eventType: "website",
      countryCode,
      metadata: { placement, zones: p.zones[0] },
    });
  }

  const buy = p.affiliateUrl ? (
    <a
      href={p.affiliateUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={trackBuy}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-control bg-ink px-4 text-sm font-semibold text-ink-foreground transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
    >
      Где купить
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
  );

  if (variant === "compact") {
    return (
      <article className="flex items-center gap-3 rounded-panel border border-border bg-card p-3">
        <span className="relative size-14 shrink-0 overflow-hidden rounded-control bg-muted">
          {isEquipment ? (
            <span className="flex h-full w-full items-center justify-center bg-ink">
              <Wrench className="size-5 text-lime" aria-hidden />
            </span>
          ) : (
            <Image src={SPRAY_IMAGE} alt={p.name} fill sizes="56px" className="object-cover" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold leading-snug text-foreground">{p.name}</p>
          <p className="truncate text-[11px] text-muted-foreground">{p.brandName ?? p.brandId}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            {p.safetyTags.slice(0, 1).map((tag) => (
              <span key={tag} className="rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {tag}
              </span>
            ))}
            {p.rating !== undefined && (
              <span className="inline-flex items-center gap-0.5 font-data text-[11px] font-bold text-foreground">
                <Star className="size-3 fill-star text-star" aria-hidden />
                {p.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <p className="font-data text-sm font-bold text-teal">
            {price ? `${price.approx ? "≈ " : ""}${formatMarketCurrency(price.value, currency)}` : "—"}
          </p>
          {buy}
        </div>
      </article>
    );
  }

  return (
    <article className="data-surface flex w-full flex-col overflow-hidden rounded-panel">
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
            sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 75vw"
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
            {p.safetyTags.slice(0, 2).map((tag) => (
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
          {buy}
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
