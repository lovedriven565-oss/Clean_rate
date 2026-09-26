"use client";

import { MapPin } from "lucide-react";
import { useRegion } from "@/components/providers/RegionProvider";

/** Бейдж текущего рынка в hero: читает cookie-регион, обновляется без перезагрузки при смене в Navbar. */
export function MarketBadge() {
  const { city, market } = useRegion();

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card/75 px-3.5 py-1.5 text-xs font-semibold text-primary shadow-sm backdrop-blur">
      <MapPin className="h-3.5 w-3.5" />
      {city.name} / {market.name}
    </span>
  );
}
