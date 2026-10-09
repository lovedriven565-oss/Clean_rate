"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { formatEstimate, pickEstimate } from "@/components/dev/diagnostic-model";
import { buildTaskShelves } from "@/components/dev/task-shelves";
import { pluralize } from "@/lib/format";
import { SURFACE_LABELS } from "@/lib/solutions/meta";
import type { PriceEstimate, Solution } from "@/lib/types";
import { PillTabs, Tilt } from "@/components/ui/fx";
import { coverFor } from "./cover";

function SolutionTile({ solution, estimates }: { solution: Solution; estimates: PriceEstimate[] }) {
  const estimate = pickEstimate(estimates, solution);
  const view = estimate ? formatEstimate(estimate) : null;
  return (
    <Tilt className="h-full w-[250px] shrink-0 snap-start sm:w-[270px]">
      <Link
        href={`/solutions/${solution.slug}`}
        className="c-card group/tile relative flex h-full flex-col overflow-hidden rounded-[14px] transition-shadow hover:shadow-[0_24px_48px_-24px_hsl(var(--c-accent)/0.5)]"
      >
        <span className="relative block aspect-[16/10] overflow-hidden">
          <Image
            src={coverFor(solution)}
            alt=""
            fill
            sizes="270px"
            className="object-cover transition-transform duration-500 group-hover/tile:scale-105 group-focus-visible/tile:scale-105"
          />
          <span className="absolute left-2.5 top-2.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            {SURFACE_LABELS[solution.surface]}
          </span>
          <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/90 to-black/60 p-3 text-[12px] leading-snug text-white transition-transform duration-300 group-hover/tile:translate-y-0 group-focus-visible/tile:translate-y-0">
            <span className="line-clamp-3">
              <span className="font-semibold text-[hsl(var(--c-accent))]">Не делайте: </span>
              {solution.warnings[0] ?? "Проверьте средство на незаметном участке."}
            </span>
          </span>
        </span>
        <span className="flex flex-1 flex-col gap-2 p-3.5">
          <span className="text-balance text-[15px] font-semibold leading-snug">{solution.title}</span>
          <span className="mt-auto flex items-center justify-between gap-2 font-mono text-xs tabular-nums c-ink2">
            <span>{pluralize(solution.diySteps.length, ["шаг", "шага", "шагов"])}</span>
            <span className="font-semibold text-[hsl(var(--c-ink))]">
              {view ? `${view.min}–${view.max}` : "цена по запросу"}
            </span>
          </span>
        </span>
      </Link>
    </Tilt>
  );
}

export function ShowcaseShelves({ solutions, estimates }: { solutions: Solution[]; estimates: PriceEstimate[] }) {
  const [tab, setTab] = useState('all');
  const scroller = useRef<HTMLDivElement>(null);
  const published = solutions.filter((s) => s.status === 'published');
  const shelves = buildTaskShelves(solutions);
  const active = shelves.find((s) => s.id === tab);
  const items = active ? published.filter((s) => active.slugs.includes(s.slug)) : published;
  const scrollBy = (dir: 1 | -1) => scroller.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });

  return (
    <section id="shelves" aria-labelledby="shelves-title" className="scroll-mt-24">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="shelves-title" className="text-balance text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
            Что нужно почистить
          </h2>
          <p className="mt-2 text-sm c-ink2">{active ? active.note : 'Все опубликованные протоколы'}</p>
        </div>
        <div className="flex items-center gap-2">
          {active && (
            <Link href={active.href} className="c-link mr-2 hidden items-center gap-1 text-sm font-semibold sm:inline-flex">
              Все {active.count}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          )}
          {([-1, 1] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => scrollBy(dir)}
              aria-label={dir < 0 ? 'Полка: назад' : 'Полка: вперёд'}
              className="c-card c-line hidden size-11 place-items-center rounded-full transition-colors hover:border-[hsl(var(--c-accent))] md:grid"
            >
              {dir < 0 ? <ChevronLeft className="size-4" aria-hidden /> : <ChevronRight className="size-4" aria-hidden />}
            </button>
          ))}
        </div>
      </div>
      <PillTabs
        label="Категория полки"
        options={[{ id: 'all', label: 'Все', meta: String(published.length) }, ...shelves.map((s) => ({ id: s.id, label: s.title, meta: String(s.count) }))]}
        value={tab}
        onChange={setTab}
        className="mb-4"
      />
      <div
        ref={scroller}
        role="region"
        aria-label="Полка протоколов"
        tabIndex={0}
        className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 pt-1 outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--c-accent))]"
      >
        {items.map((solution) => (
          <SolutionTile key={solution.id} solution={solution} estimates={estimates} />
        ))}
      </div>
    </section>
  );
}
