"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatEstimate, pickEstimate, type DiagnosticSelection } from "@/components/dev/diagnostic-model";
import { SURFACE_LABELS } from "@/lib/solutions/meta";
import type { PriceEstimate, Solution } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PillTabs } from "./Fx";

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

/** Таблица ориентиров цен в духе gg.deals: моно-цифры, полоса диапазона на общей шкале, сортировка. */
export function ShowcasePrices({
  solutions,
  estimates,
  activeSlug,
  onSelect,
}: {
  solutions: Solution[];
  estimates: PriceEstimate[];
  activeSlug: string | null;
  onSelect: (next: DiagnosticSelection) => void;
}) {
  const [sort, setSort] = useState<SortKey>("price");

  const { rows, scaleMax } = useMemo(() => {
    const list: Row[] = solutions
      .filter((s) => s.status === "published")
      .flatMap((solution) => {
        const estimate = pickEstimate(estimates, solution);
        if (!estimate) return [];
        const view = formatEstimate(estimate);
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
  }, [solutions, estimates, sort]);

  const cheapest = rows.length ? Math.min(...rows.map((r) => r.min)) : null;

  return (
    <section aria-labelledby="prices-title" className="scroll-mt-24">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="prices-title" className="text-balance text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
            Сколько стоит позвать мастера
          </h2>
          <p className="mt-2 max-w-xl text-sm c-ink2">
            Ориентиры по Минску для сравнения задач. Не оферта: итог назначает компания после осмотра.
          </p>
        </div>
        <PillTabs label="Сортировка" options={SORTS} value={sort} onChange={(id) => setSort(id as SortKey)} />
      </div>

      {rows.length === 0 ? (
        <p className="c-card rounded-[14px] p-6 text-sm c-ink2">Смет по опубликованным решениям пока нет.</p>
      ) : (
        <ul className="c-card divide-y divide-[hsl(var(--c-line))] overflow-hidden rounded-[14px]">
          {rows.map(({ solution, min, max, label }) => {
            const active = solution.slug === activeSlug;
            return (
              <li key={solution.id}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    onSelect({ surface: solution.surface, problem: solution.problemType, variant: solution.slug })
                  }
                  className={cn(
                    "grid w-full min-h-16 grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 px-4 py-3 text-left transition-colors hover:bg-[hsl(var(--c-raise))] sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto]",
                    active && "bg-[hsl(var(--c-accent)/0.1)] shadow-[inset_3px_0_0_hsl(var(--c-accent))]",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] font-semibold">{solution.title}</span>
                    <span className="block text-xs c-ink2">{SURFACE_LABELS[solution.surface]}</span>
                  </span>
                  <span className="order-3 col-span-2 sm:order-none sm:col-span-1" aria-hidden>
                    <span className="relative block h-1.5 overflow-hidden rounded-full bg-[hsl(var(--c-raise))]">
                      <span
                        className="absolute inset-y-0 rounded-full bg-[hsl(var(--c-accent))]"
                        style={{ left: `${(min / scaleMax) * 100}%`, width: `${Math.max(3, ((max - min) / scaleMax) * 100)}%` }}
                      />
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block font-mono text-sm font-semibold tabular-nums">{label}</span>
                    {cheapest === min && <span className="c-link text-[11px] font-semibold">минимум в списке</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <Link href="/solutions" className="c-link mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-semibold">
        Все решения
        <ArrowUpRight className="size-4" aria-hidden />
      </Link>
    </section>
  );
}
