"use client";

import { Building2, FlaskConical, MapPinned, Sparkles } from "lucide-react";
import { useRegion } from "@/components/providers/RegionProvider";
import { formatMarketCurrency, pluralize } from "@/lib/format";
import { ENABLED_MARKETS, type CurrencyCode } from "@/lib/markets";

export interface HeroStatsData {
  protocolCount: number;
  productCount: number;
  /** Число компаний по имени города («Минск» → N) */
  companiesByCity: Record<string, number>;
  /** Минимальная смета категорий по стране — «выезд от X» */
  minPriceByCountry: Record<string, { value: number; currency: CurrencyCode } | null>;
}

/** Четыре реальные цифры под hero — клиентский островок, выбирает цифры по региону. */
export function HeroStats({ stats }: { stats: HeroStatsData }) {
  const { market, city, resolved } = useRegion();
  const cityCompanies = stats.companiesByCity[city.name] ?? 0;
  const minPrice = stats.minPriceByCountry[market.countryCode];
  const totalCompanies = Object.values(stats.companiesByCity).reduce((sum, n) => sum + n, 0);
  // Нейтральный SSR: минимумы по всем открытым рынкам через «/» вместо одного города.
  const neutralPrices = ENABLED_MARKETS.map((m) => stats.minPriceByCountry[m.countryCode])
    .filter((p): p is { value: number; currency: CurrencyCode } => p !== null && p !== undefined)
    .map((p) => `от ${formatMarketCurrency(p.value, p.currency)}`);

  const items = [
    {
      icon: FlaskConical,
      value: String(stats.protocolCount),
      label: pluralize(stats.protocolCount, ["протокол", "протокола", "протоколов"]),
    },
    {
      icon: Sparkles,
      value: String(stats.productCount),
      label: pluralize(stats.productCount, ["средство", "средства", "средств"]) + " и техника",
    },
    resolved
      ? {
          icon: Building2,
          value: String(cityCompanies),
          label: `${pluralize(cityCompanies, ["компания", "компании", "компаний"])} · ${city.name}`,
        }
      : {
          icon: Building2,
          value: String(totalCompanies),
          label: pluralize(totalCompanies, ["компания", "компании", "компаний"]) + " в каталоге",
        },
    {
      icon: MapPinned,
      value: resolved
        ? minPrice
          ? `от ${formatMarketCurrency(minPrice.value, minPrice.currency)}`
          : "—"
        : neutralPrices.length > 0
          ? neutralPrices.join(" / ")
          : "—",
      label: "выезд мастера",
    },
  ];

  return (
    <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
      {items.map((m) => (
        <div key={m.label} className="flex items-start gap-3">
          <m.icon className="mt-1 size-5 shrink-0 text-teal" aria-hidden />
          <div className="min-w-0">
            <dt className="sr-only">{m.label}</dt>
            <dd>
              <span className="font-data text-2xl font-bold text-foreground">{m.value}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{m.label}</span>
            </dd>
          </div>
        </div>
      ))}
    </dl>
  );
}
