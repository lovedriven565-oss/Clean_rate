"use client";

import { useRegion } from "@/components/providers/RegionProvider";
import { formatMarketCurrency } from "@/lib/format";
import type { PriceEstimate } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Смета в валюте текущего рынка. Данные по всем рынкам приходят с сервера (SSG),
 * выбор нужной строки — по cookie-региону на клиенте, без запроса.
 */
export function PriceRange({
  estimates,
  className,
  compact = false,
}: {
  estimates: PriceEstimate[];
  className?: string;
  compact?: boolean;
}) {
  const { market, city } = useRegion();

  const forMarket = estimates.filter((estimate) => estimate.countryCode === market.countryCode);
  const estimate = forMarket.find((item) => item.city === city.name) ?? forMarket[0];

  if (!estimate) {
    return (
      <div className={cn("rounded-panel border border-dashed border-border p-5 text-sm text-muted-foreground", className)}>
        Смета для рынка «{market.name}» пока формируется. Цена уточняется у компании.
      </div>
    );
  }

  const min = formatMarketCurrency(estimate.priceMin, market);
  const max = formatMarketCurrency(estimate.priceMax, market);

  if (compact) {
    return (
      <span className={cn("font-data font-semibold text-foreground", className)}>
        {min} – {max}
        {estimate.unit && <span className="font-normal text-muted-foreground"> / {estimate.unit}</span>}
      </span>
    );
  }

  return (
    <div className={cn("rounded-panel border border-border bg-card p-5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Ориентир цены · {estimate.city ?? market.name}
        </span>
        {estimate.unit && <span className="text-xs text-muted-foreground">за {estimate.unit}</span>}
      </div>
      <p className="mt-2 font-data text-2xl font-medium text-foreground sm:text-3xl">
        {min} <span className="text-muted-foreground/60">–</span> {max}
      </p>
      {estimate.note && <p className="mt-2 text-sm leading-6 text-muted-foreground">{estimate.note}</p>}
    </div>
  );
}
