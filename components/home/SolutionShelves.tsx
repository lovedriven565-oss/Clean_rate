"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Ban, ChevronLeft, ChevronRight, FlaskConical, ShieldCheck } from "lucide-react";
import { useRegion } from "@/components/providers/RegionProvider";
import { PillTabs, Tilt } from "@/components/ui/fx";
import { formatEstimate, pickEstimate, type DiagnosticContext } from "@/lib/solutions/diagnostic";
import { solutionCover } from "@/lib/solutions/covers";
import { buildTaskShelves } from "@/lib/solutions/shelves";
import { pluralize } from "@/lib/format";
import { PROBLEM_TYPE_LABELS, SURFACE_LABELS } from "@/lib/solutions/meta";
import { scrollBehavior } from "@/lib/utils";
import type { PriceEstimate, Solution } from "@/lib/types";

/**
 * Карточка протокола в формате вертикального постера 3:4 (Epic Games Store):
 * сверху на постере — бейдж поверхности, внизу постера — приборная плашка «КОНТРОЛЬ pH · N ШАГОВ»
 * и всплывающее при наведении предупреждение «Не делайте»;
 * под постером — чистая типографика заголовка и зелёный Steam-бейдж сметы региона.
 */
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
  const stepsLabel = pluralize(solution.diySteps.length, ["шаг", "шага", "шагов"]).toUpperCase();

  return (
    <Tilt className="h-full w-[228px] shrink-0 snap-start sm:w-[248px]">
      <Link
        href={`/solutions/${solution.slug}`}
        className="data-surface group/tile relative flex h-full flex-col overflow-hidden rounded-panel p-2.5 transition-shadow hover:shadow-[0_24px_48px_-24px_hsl(var(--brand)/0.5)]"
      >
        {/* Постер 3:4 в стиле Epic Games Store */}
        <span className="relative block aspect-[3/4] w-full overflow-hidden rounded-control bg-muted">
          <Image
            src={solutionCover(solution)}
            alt=""
            fill
            sizes="248px"
            className="object-cover transition-transform duration-500 group-hover/tile:scale-105 group-focus-visible/tile:scale-105"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10"
          />

          {/* Верхний бейдж поверхности */}
          <span className="absolute left-2.5 top-2.5 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm ring-1 ring-inset ring-white/15">
            {SURFACE_LABELS[solution.surface]}
          </span>

          {/* Нижняя контрастная приборная плашка на постере */}
          <span className="absolute inset-x-2.5 bottom-2.5 flex items-center justify-between gap-1.5 rounded-control bg-black/75 px-2.5 py-1.5 font-data text-[10px] font-semibold uppercase tracking-wider text-white/95 backdrop-blur-sm ring-1 ring-inset ring-white/15 transition-opacity duration-200 group-hover/tile:opacity-0 group-focus-visible/tile:opacity-0">
            <span className="inline-flex items-center gap-1 text-brand">
              <FlaskConical className="size-3 shrink-0" aria-hidden />
              ИНСТРУКЦИЯ
            </span>
            <span>{stepsLabel}</span>
          </span>

          {/* Всплывающее предупреждение «Не делайте» при наведении/фокусе */}
          <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/95 via-black/90 to-black/70 p-3 text-[12px] leading-snug text-white transition-transform duration-300 group-hover/tile:translate-y-0 group-focus-visible/tile:translate-y-0 motion-reduce:translate-y-0">
            <span className="flex items-start gap-1.5 line-clamp-4">
              <Ban className="mt-0.5 size-3.5 shrink-0 text-brand" aria-hidden />
              <span>
                <span className="font-semibold text-brand">Не делайте: </span>
                {solution.warnings[0] ?? "Проверьте средство на незаметном участке."}
              </span>
            </span>
          </span>
        </span>

        {/* Чистая типографика и смета под постером */}
        <span className="flex flex-1 flex-col gap-1.5 px-1 pb-1 pt-3">
          <span className="font-data text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {PROBLEM_TYPE_LABELS[solution.problemType]}
            {solution.material ? ` · ${solution.material}` : ""}
          </span>
          <span className="line-clamp-2 min-h-10 text-balance text-[15px] font-semibold leading-snug text-foreground transition-colors group-hover/tile:text-link">
            {solution.title}
          </span>
          <span className="mt-auto flex items-center justify-between gap-2 pt-2">
            {view ? (
              <span className="inline-flex items-center rounded-[6px] bg-success/15 px-2 py-0.5 font-data text-xs font-bold tabular-nums text-success">
                {view.min}–{view.max}
              </span>
            ) : (
              <span className="font-data text-xs font-semibold text-muted-foreground">DIY-протокол</span>
            )}
            <span className="inline-flex items-center gap-1 font-data text-xs font-semibold text-link">
              Открыть
              <ArrowRight className="size-3.5 transition-transform group-hover/tile:translate-x-0.5" aria-hidden />
            </span>
          </span>
        </span>
      </Link>
    </Tilt>
  );
}

function ShelfPartnerPitchTile({ activeCategoryLabel }: { activeCategoryLabel?: string }) {
  return (
    <Tilt className="h-full w-[228px] shrink-0 snap-start sm:w-[248px]">
      <Link
        href="/for-brands"
        className="data-surface linear-beam group/pitch relative flex h-full flex-col justify-between rounded-panel p-4 transition-shadow hover:shadow-[0_24px_48px_-24px_hsl(var(--brand)/0.45)]"
      >
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-[11px] font-semibold text-foreground">
              <FlaskConical className="size-3.5 text-link" aria-hidden />
              Слот для бренда
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
              <ShieldCheck className="size-3 shrink-0" aria-hidden />
              Safety Gate
            </span>
          </div>
          <p className="mt-4 font-display text-base font-bold leading-snug tracking-tight text-foreground">
            Производите или поставляете проверенную химию?
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Предложите средство для инструкций{activeCategoryLabel ? ` («${activeCategoryLabel}»)` : ""} с проверкой применимости и ссылкой на дилера.
          </p>
        </div>

        <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-link group-hover/pitch:underline">
          Занять слот в протоколах
          <ArrowUpRight className="size-3.5 transition-transform group-hover/pitch:translate-x-0.5 group-hover/pitch:-translate-y-0.5" aria-hidden />
        </span>
      </Link>
    </Tilt>
  );
}

/** Полки постеров 3:4 в стиле Epic Games Store: табы-категории с реальными счётчиками + горизонтальная полка. */
export function SolutionShelves({ solutions, estimates }: { solutions: Solution[]; estimates: PriceEstimate[] }) {
  const [tab, setTab] = useState("all");
  const scroller = useRef<HTMLDivElement>(null);
  const { market, city } = useRegion();
  const ctx = useMemo(() => ({ countryCode: market.countryCode, city: city.name }), [market, city]);

  const published = solutions.filter((s) => s.status === "published");
  const shelves = buildTaskShelves(solutions);
  const active = shelves.find((s) => s.id === tab);
  const items = active ? published.filter((s) => active.slugs.includes(s.slug)) : published;
  const scrollBy = (dir: 1 | -1) => scroller.current?.scrollBy({ left: dir * 280, behavior: scrollBehavior() });

  return (
    <section id="shelves" aria-labelledby="shelves-title" className="scroll-mt-24">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="shelves-title" className="text-balance font-display text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl">
            Что нужно почистить
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{active ? active.note : "Все опубликованные протоколы в формате лаб-постеров"}</p>
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
        <ShelfPartnerPitchTile activeCategoryLabel={active?.title} />
      </div>
    </section>
  );
}
