"use client";

import { motion, useReducedMotion } from "motion/react";
import { PH_MAX, phPosition, phZoneLabel, riskZonesForSurface, surfaceLabel } from "@/lib/ph";
import { cn } from "@/lib/utils";

const TICKS = [0, 3, 6, 7, 8, 11, 14];

/**
 * Фирменная шкала pH 0–14. Маркер доезжает пружиной до значения (показывает проверку),
 * опасные для поверхности участки заштрихованы по порогам фильтра безопасности.
 */
export function PhScale({
  ph,
  surface,
  caption,
  compact = false,
  className,
}: {
  ph: number;
  /** Поверхность, для которой подсвечиваются зоны риска */
  surface?: string;
  /** Подпись справа от значения, например название средства */
  caption?: string;
  compact?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const position = phPosition(ph);
  const riskZones = surface ? riskZonesForSurface(surface) : [];

  return (
    <figure className={cn("w-full", className)} aria-label={`pH ${ph}: ${phZoneLabel(ph)}`}>
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="flex items-baseline gap-2">
          <span className={cn("font-data font-medium text-foreground", compact ? "text-sm" : "text-lg")}>pH {ph.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">{phZoneLabel(ph)}</span>
        </span>
        {caption && <span className="truncate text-xs text-muted-foreground">{caption}</span>}
      </figcaption>

      <div className={cn("relative", compact ? "mt-2" : "mt-3")}>
        <div className={cn("ph-gradient relative overflow-hidden rounded-full", compact ? "h-1.5" : "h-2")}>
          {riskZones.map((zone) => (
            <span
              key={`${zone.from}-${zone.to}`}
              className="absolute inset-y-0 bg-[repeating-linear-gradient(135deg,hsl(var(--background)/0.85)_0_2px,transparent_2px_5px)]"
              style={{ left: `${(zone.from / PH_MAX) * 100}%`, width: `${((zone.to - zone.from) / PH_MAX) * 100}%` }}
            />
          ))}
        </div>

        {/* Слой во всю ширину шкалы: translateX(N%) от его ширины = N% шкалы, анимируется только transform. */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-full"
          initial={reduce ? false : { x: "50%" }}
          animate={{ x: `${position}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        >
          <span className="absolute left-0 top-1/2 -ml-[7px] h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-background bg-foreground shadow-[0_2px_6px_hsl(var(--shadow-tint)/0.35)]" />
        </motion.span>
      </div>

      {!compact && (
        <div className="relative mt-2 h-4">
          {TICKS.map((tick) => (
            <span
              key={tick}
              className="font-data absolute -translate-x-1/2 text-[10px] text-muted-foreground"
              style={{ left: `${(tick / PH_MAX) * 100}%` }}
            >
              {tick}
            </span>
          ))}
        </div>
      )}

      {surface && riskZones.length > 0 && !compact && (
        <p className="mt-2 text-xs text-muted-foreground">
          Штриховка: опасные значения для поверхности «{surfaceLabel(surface)}»
        </p>
      )}
    </figure>
  );
}
