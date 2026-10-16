"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useRegion } from "@/components/providers/RegionProvider";
import { PillTabs } from "@/components/ui/fx";
import { formatEstimate, pickEstimate } from "@/lib/solutions/diagnostic";
import { SURFACE_LABELS } from "@/lib/solutions/meta";
import { cn } from "@/lib/utils";
import type { PriceEstimate, Solution } from "@/lib/types";

type SortKey = "price" | "name" | "steps";

interface Row {
  solution: Solution;
  min: number;
  max: number;
  label: string;
}

const SORTS = [
  { id: "price", label: "Сначала дешевле" },
  { id: "steps", label: "Меньше шагов" },
  { id: "name", label: "По названию" },
];

/**
 * Таблица ориентиров цен в духе gg.deals: моно-цифры, полоса диапазона на общей
 * шкале, сортировка. Сметы — только по региону посетителя (RegionProvider).
 */
const COLLAPSED_ROWS = 5;

export function PriceTable({ solutions, estimates }: { solutions: Solution[]; estimates: PriceEstimate[] }) {
  const [sort, setSort] = useState<SortKey>("price");
  const [expanded, setExpanded] = useState(false);
  const { market, city } = useRegion();

  const { rows, scaleMax } = useMemo(() => {
    const ctx = { countryCode: market.countryCode, city: city.name };
    const list: Row[] = solutions
      .filter((s) => s.status === "published")
      .flatMap((solution) => {
        const estimate = pickEstimate(estimates, solution, ctx);
        if (!estimate) return [];
        const view = formatEstimate(estimate, ctx);
        return [{ solution, min: estimate.priceMin, max: estimate.priceMax, label: `${view.min}–${view.max}` }];
      });
    const sorted = [...list].sort((a, b) =>
      sort === "price"
        ? a.min - b.min
        : sort === "steps"
          ? a.solution.diySteps.length - b.solution.diySteps.length
          : a.solution.title.localeCompare(b.solution.title, "ru"),
    );
    return { rows: sorted, scaleMax: Math.max(1, ...list.map((r) => r.max)) };
  }, [solutions, estimates, sort, market, city]);

  const cheapest = rows.length ? Math.min(...rows.map((r) => r.min)) : null;
  const visible = expanded ? rows : rows.slice(0, COLLAPSED_ROWS);
  const hiddenCount = rows.length - visible.length;

  return (
    <section aria-labelledby="prices-title" className="scroll-mt-24">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="prices-title" className="text-balance font-display text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl">
            Сколько стоит позвать мастера
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Ориентиры по региону {market.name} для сравнения задач. Не оферта: итог назначает компания после осмотра.
          </p>
        </div>
        <PillTabs label="Сортировка" options={SORTS} value={sort} onChange={(id) => setSort(id as SortKey)} />
      </div>

      {rows.length === 0 ? (
        <p className="data-surface rounded-panel p-6 text-sm text-muted-foreground">
          Смет по опубликованным решениям для вашего региона пока нет.
        </p>
      ) : (
        <>
          <ul className="data-surface divide-y divide-border overflow-hidden rounded-panel">
            {visible.map(({ solution, min, max, label }) => (
              <li key={solution.id}>
                <Link
                  href={`/solutions/${solution.slug}`}
                  className={cn(
                    "grid min-h-16 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-4 py-3 text-left transition-colors hover:bg-muted/50 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto]",
                  )}
                >
                  <span className="min-w-0">
                    <span className="line-clamp-2 block text-[15px] font-semibold text-foreground sm:truncate">{solution.title}</span>
                    <span className="block text-xs text-muted-foreground">{SURFACE_LABELS[solution.surface]}</span>
                  </span>
                  <span className="hidden sm:block" aria-hidden>
                    <span className="relative block h-1.5 overflow-hidden rounded-full bg-muted">
                      <span
                        className="absolute inset-y-0 rounded-full bg-brand"
                        style={{
                          left: `${(min / scaleMax) * 100}%`,
                          width: `${Math.max(3, ((max - min) / scaleMax) * 100)}%`,
                        }}
                      />
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block font-data text-sm font-semibold text-foreground">{label}</span>
                    {cheapest === min && <span className="text-[11px] font-semibold text-link">минимум в списке</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:border-brand/60"
            >
              Показать ещё {hiddenCount}
            </button>
          )}
          {expanded && rows.length > COLLAPSED_ROWS && (
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-sm font-semibold text-muted-foreground transition-colors hover:border-brand/60 hover:text-foreground"
            >
              Свернуть
            </button>
          )}
        </>
      )}
      <Link href="/solutions" className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-link">
        Все решения
        <ArrowUpRight className="size-4" aria-hidden />
      </Link>
    </section>
  );
}
