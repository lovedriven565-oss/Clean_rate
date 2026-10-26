"use client";

import Link from "next/link";
import { Hand } from "lucide-react";
import { useRegion } from "@/components/providers/RegionProvider";
import { Marquee } from "@/components/home/Marquee";
import { formatMarketCurrency, pluralize } from "@/lib/format";
import type { PriceEstimate, Solution } from "@/lib/types";

/** Лента реальных задач с ценой «от» по рынку региона. */
export function TaskTicker({ solutions, estimates }: { solutions: Solution[]; estimates: PriceEstimate[] }) {
  const { market } = useRegion();
  if (solutions.length === 0) return null;

  return (
    <div className="flex items-center border-y border-border bg-card/60">
      <p className="hidden shrink-0 items-center gap-2 border-r border-border px-5 font-data text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:flex">
        <span className="relative flex size-2" aria-hidden>
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60 motion-reduce:animate-none" />
          <span className="relative inline-flex size-2 rounded-full bg-success" />
        </span>
        {market.name} · {pluralize(solutions.length, ["протокол", "протокола", "протоколов"])}
      </p>
      <Marquee duration={Math.max(36, solutions.length * 7)} className="fx-mask-x min-w-0 flex-1 py-3">
        {solutions.map((solution) => {
          const estimate = estimates.find((e) => e.solutionId === solution.id && e.countryCode === market.countryCode);
          return (
            <Link
              key={solution.slug}
              href={`/solutions/${solution.slug}`}
              className="inline-flex shrink-0 items-center gap-2.5 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <span className="font-medium">{solution.title}</span>
              <span className="inline-flex items-center gap-1 font-data text-xs text-muted-foreground">
                <Hand className="h-3 w-3" />
                {pluralize(solution.diySteps.length, ["шаг", "шага", "шагов"])}
              </span>
              {estimate && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 font-data text-xs font-semibold tabular-nums text-primary">
                  от {formatMarketCurrency(estimate.priceMin, market)}
                </span>
              )}
            </Link>
          );
        })}
      </Marquee>
    </div>
  );
}
