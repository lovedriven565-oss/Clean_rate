"use client";

import { AdCreative } from "@/components/ads/AdCreative";
import { Reveal } from "@/components/home/Reveal";
import { useRegion } from "@/components/providers/RegionProvider";
import { isAdVisibleInCountry } from "@/lib/ads/presentation";
import type { CountryCode } from "@/lib/markets";
import type { EligibleAd } from "@/lib/types";

/**
 * Главная — SSG: сервер не знает страну посетителя, поэтому одобренные кампании
 * выбираются для каждого открытого рынка, а клиент показывает ту, что таргетирует
 * регион пользователя. Без подходящей кампании рендерится ничего — ни отступа,
 * ни пустой рамки.
 */
export function HomeEditorialAd({ ads }: { ads: Partial<Record<CountryCode, EligibleAd | null>> }) {
  const { countryCode } = useRegion();
  const ad = ads[countryCode] ?? null;
  if (!ad || !isAdVisibleInCountry(ad, countryCode)) return null;
  return (
    <Reveal>
      <AdCreative ad={ad} />
    </Reveal>
  );
}
