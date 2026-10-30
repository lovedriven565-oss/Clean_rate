"use client";

import { AnimatedGroup } from "@/components/ui/animated-group";
import { AnimatedNumber } from "@/components/ui/animated-number";

export interface LiveStat {
  value: number;
  label: string;
}

/**
 * Живые цифры под hero: один компактный ряд честных счётчиков
 * (только реальные данные — протоколы, города, шаги) с каскадом появления.
 */
export function LiveStats({ stats }: { stats: LiveStat[] }) {
  if (stats.length === 0) return null;
  return (
    <AnimatedGroup
      preset="blur-slide"
      className="flex flex-wrap items-center gap-x-8 gap-y-3 border-y border-border py-4 sm:gap-x-10"
    >
      {stats.map((stat) => (
        <p key={stat.label} className="flex items-baseline gap-2">
          <AnimatedNumber
            value={stat.value}
            className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          />
          <span className="text-xs leading-snug text-muted-foreground">{stat.label}</span>
        </p>
      ))}
    </AnimatedGroup>
  );
}
