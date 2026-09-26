"use client";

import { Select as BaseSelect } from "@base-ui/react/select";
import { Check, ChevronDown, MapPin } from "lucide-react";
import { useRegion } from "@/components/providers/RegionProvider";
import { ENABLED_MARKETS, isEnabledCountry, type CountryCode } from "@/lib/markets";
import { cn } from "@/lib/utils";

type RegionValue = `${CountryCode}:${string}`;

const items = ENABLED_MARKETS.flatMap((market) =>
  market.cities.map((city) => ({ value: `${market.countryCode}:${city.slug}` as RegionValue, label: city.name }))
);

/**
 * Выбор страны и города. Значение хранится в RegionProvider (cookie ch_region),
 * поэтому смена региона мгновенно меняет валюту смет и список компаний без перезагрузки.
 */
export function RegionSelector({ className, variant = "pill" }: { className?: string; variant?: "pill" | "block" }) {
  const { countryCode, citySlug, city, market, setRegion } = useRegion();
  const value: RegionValue = `${countryCode}:${citySlug}`;

  function handleChange(next: string | null) {
    if (!next) return;
    const [country, slug] = next.split(":");
    if (isEnabledCountry(country)) setRegion(country, slug);
  }

  return (
    <BaseSelect.Root items={items} value={value} onValueChange={handleChange}>
      <BaseSelect.Trigger
        aria-label="Выбрать регион"
        className={cn(
          "group inline-flex items-center gap-2 border border-border/80 text-sm font-medium text-foreground outline-none transition-colors hover:border-primary/35 focus-visible:ring-2 focus-visible:ring-primary/15",
          variant === "pill" ? "h-10 rounded-full bg-card/65 px-3.5" : "h-12 w-full rounded-control bg-card px-4",
          className
        )}
      >
        <MapPin className="h-4 w-4 shrink-0 text-primary" />
        <span className="min-w-0 flex-1 truncate text-left">
          {city.name}
          <span className="hidden text-muted-foreground sm:inline"> · {market.countryCode}</span>
        </span>
        <BaseSelect.Icon className="text-muted-foreground transition-transform group-data-[popup-open]:rotate-180">
          <ChevronDown className="h-4 w-4" />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>

      <BaseSelect.Portal>
        <BaseSelect.Positioner sideOffset={8} align="end" alignItemWithTrigger={false} className="z-50 outline-none">
          <BaseSelect.Popup className="min-w-56 origin-[var(--transform-origin)] rounded-control border border-border bg-card p-1.5 text-foreground shadow-2xl shadow-tint/10 outline-none transition-[transform,opacity] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
            <BaseSelect.List className="max-h-80 overflow-y-auto outline-none">
              {ENABLED_MARKETS.map((m) => (
                <BaseSelect.Group key={m.countryCode} className="mb-1 last:mb-0">
                  <BaseSelect.GroupLabel className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/80">
                    {m.name} · {m.currency}
                  </BaseSelect.GroupLabel>
                  {m.cities.map((c) => (
                    <BaseSelect.Item
                      key={c.slug}
                      value={`${m.countryCode}:${c.slug}`}
                      className="grid cursor-default grid-cols-[1fr_auto] items-center gap-3 rounded-control px-3.5 py-2.5 text-sm outline-none data-[highlighted]:bg-muted data-[highlighted]:text-foreground"
                    >
                      <BaseSelect.ItemText>{c.name}</BaseSelect.ItemText>
                      <BaseSelect.ItemIndicator className="text-primary">
                        <Check className="h-4 w-4" />
                      </BaseSelect.ItemIndicator>
                    </BaseSelect.Item>
                  ))}
                </BaseSelect.Group>
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}
