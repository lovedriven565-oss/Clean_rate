"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useRegion } from "@/components/providers/RegionProvider";
import { PillTabs, Tilt } from "@/components/ui/fx";
import { formatEstimate, pickEstimate, type DiagnosticContext } from "@/lib/solutions/diagnostic";
import { solutionCover } from "@/lib/solutions/covers";
import { buildTaskShelves } from "@/lib/solutions/shelves";
import { pluralize } from "@/lib/format";
import { SURFACE_LABELS } from "@/lib/solutions/meta";
import { scrollBehavior } from "@/lib/utils";
import type { PriceEstimate, Solution } from "@/lib/types";

function SolutionTile({
  solution,
  estimates,
  ctx,
}: {
  solution: Solution;
  estimates: PriceEstimate[];
  ctx: DiagnosticContext;
}) {
  const estimate = pickEstimate(estimates, solution, ctx);
  const view = estimate ? formatEstimate(estimate, ctx) : null;
  return (
    <Tilt className="h-full w-[250px] shrink-0 snap-start sm:w-[270px]">
      <Link
        href={`/solutions/${solution.slug}`}
        className="data-surface group/tile relative flex h-full flex-col rounded-panel transition-shadow hover:shadow-[0_24px_48px_-24px_hsl(var(--brand)/0.5)]"
      >
        <span className="relative block aspect-[16/10] overflow-hidden">
          <Image
            src={solutionCover(solution)}
            alt=""
            fill
            sizes="270px"
            className="object-cover transition-transform duration-500 group-hover/tile:scale-105 group-focus-visible/tile:scale-105"
          />
          <span className="absolute left-2.5 top-2.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            {SURFACE_LABELS[solution.surface]}
          </span>
          <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/90 to-black/60 p-3 text-[12px] leading-snug text-white transition-transform duration-300 group-hover/tile:translate-y-0 group-focus-visible/tile:translate-y-0 motion-reduce:translate-y-0">
            <span className="line-clamp-3">
              <span className="font-semibold text-brand">Не делайте: </span>
              {solution.warnings[0] ?? "Проверьте средство на незаметном участке."}
            </span>
          </span>
        </span>
        <span className="flex flex-1 flex-col gap-2 p-3.5">
          <span className="line-clamp-2 min-h-10 text-balance text-[15px] font-semibold leading-snug text-foreground">{solution.title}</span>
          <span className="mt-auto flex items-center justify-between gap-2 font-data text-xs text-muted-foreground">
            <span>{pluralize(solution.diySteps.length, ["шаг", "шага", "шагов"])}</span>
            <span className="font-semibold text-foreground">{view ? `${view.min}–${view.max}` : "цена по запросу"}</span>
          </span>
        </span>
      </Link>
    </Tilt>
  );
}

/** Полки протоколов: табы-категории с реальными счётчиками + горизонтальная полка карточек. */
export function SolutionShelves({ solutions, estimates }: { solutions: Solution[]; estimates: PriceEstimate[] }) {
  const [tab, setTab] = useState("all");
  const scroller = useRef<HTMLDivElement>(null);
  const { market, city } = useRegion();
  const ctx = useMemo(() => ({ countryCode: market.countryCode, city: city.name }), [market, city]);

  const published = solutions.filter((s) => s.status === "published");
  const shelves = buildTaskShelves(solutions);
  const active = shelves.find((s) => s.id === tab);
  const items = active ? published.filter((s) => active.slugs.includes(s.slug)) : published;
  const scrollBy = (dir: 1 | -1) => scroller.current?.scrollBy({ left: dir * 300, behavior: scrollBehavior() });

  return (
    <section id="shelves" aria-labelledby="shelves-title" className="scroll-mt-24">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="shelves-title" className="text-balance font-display text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl">
            Что нужно почистить
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{active ? active.note : "Все опубликованные протоколы"}</p>
        </div>
        <div className="flex items-center gap-2">
          {active && (
            <Link href={active.href} className="mr-2 hidden items-center gap-1 text-sm font-semibold text-link sm:inline-flex">
              Все {active.count}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          )}
          {([-1, 1] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => scrollBy(dir)}
              aria-label={dir < 0 ? "Полка: назад" : "Полка: вперёд"}
              className="data-surface hidden size-11 place-items-center rounded-full text-foreground transition-colors hover:border-brand/60 md:grid"
            >
              {dir < 0 ? <ChevronLeft className="size-4" aria-hidden /> : <ChevronRight className="size-4" aria-hidden />}
            </button>
          ))}
        </div>
      </div>
      <PillTabs
        label="Категория полки"
        options={[
          { id: "all", label: "Все", meta: String(published.length) },
          ...shelves.map((s) => ({ id: s.id, label: s.title, meta: String(s.count) })),
        ]}
        value={tab}
        onChange={setTab}
        className="mb-4"
      />
      <div
        ref={scroller}
        role="region"
        aria-label="Полка протоколов"
        tabIndex={0}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 pt-1 outline-none focus-visible:ring-2 focus-visible:ring-brand sm:-mx-6 sm:px-6"
      >
        {items.map((solution) => (
          <SolutionTile key={solution.id} solution={solution} estimates={estimates} ctx={ctx} />
        ))}
      </div>
    </section>
  );
}
