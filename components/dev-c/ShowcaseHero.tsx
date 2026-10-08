"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Ban, Search } from "lucide-react";
import {
  buildDiagnosticResult,
  listProblems,
  listSurfaces,
  resolveSelection,
  type DiagnosticSelection,
} from "@/components/dev/diagnostic-model";
import { heroSubmitTarget, searchHeroSolutions } from "@/components/dev/hero-search";
import { pluralize } from "@/lib/format";
import type { PriceEstimate, Solution, SolutionProblemType, SolutionSurface } from "@/lib/types";
import { Aurora, GlowLink, PillTabs, RevealText, SpotlightCard } from "./Fx";
import { coverFor } from "./cover";

interface ShowcaseHeroProps {
  solutions: Solution[];
  estimates: PriceEstimate[];
  chips: string[];
  stats: { label: string; value: number }[];
  selection: DiagnosticSelection;
  onSelectionChange: (next: DiagnosticSelection) => void;
}

function HeroSearchBox({ solutions, chips }: { solutions: Solution[]; chips: string[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [missed, setMissed] = useState(false);
  const items = searchHeroSolutions(query, "b2c", solutions);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const target = heroSubmitTarget(items);
    if (target) router.push(target);
    else setMissed(query.trim().length > 0);
  }

  return (
    <div className="relative">
      <form
        onSubmit={submit}
        role="search"
        className="c-card c-glass flex items-center gap-2 rounded-full p-1.5 pl-5 focus-within:border-[hsl(var(--c-accent))] focus-within:shadow-[0_0_0_4px_hsl(var(--c-accent)/0.18)]"
      >
        <Search className="size-4 shrink-0 c-ink2" aria-hidden />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setMissed(false);
          }}
          aria-label="Опишите задачу"
          placeholder="Опишите задачу: «вино на диване», «запах от матраса»"
          className="h-11 min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-[hsl(var(--c-ink2))]"
        />
        <button
          type="submit"
          className="c-accent-bg inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-5 text-sm font-semibold transition-transform active:scale-[0.98]"
        >
          Найти
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </form>

      {query.trim() && (items.length > 0 || missed) && (
        <ul
          aria-label="Подсказки"
          className="c-card absolute inset-x-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-[14px] p-1.5"
        >
          {items.map((item) => (
            <li key={item.slug}>
              <Link
                href={item.href}
                className="flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-[hsl(var(--c-raise))]"
              >
                {item.title}
                <ArrowRight className="size-4 shrink-0 c-ink2" aria-hidden />
              </Link>
            </li>
          ))}
          {missed && items.length === 0 && (
            <li className="px-3 py-3 text-sm c-ink2">
              Нет подходящего протокола.{" "}
              <Link href="/solutions" className="c-link font-semibold underline underline-offset-4">
                Все решения
              </Link>
            </li>
          )}
        </ul>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs c-ink2">Например:</span>
        {chips.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => {
              setQuery(chip);
              setMissed(false);
            }}
            className="c-line c-surface min-h-9 rounded-full border px-3.5 text-xs font-medium transition-colors hover:border-[hsl(var(--c-accent)/0.6)]"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ShowcaseHero({ solutions, estimates, chips, stats, selection, onSelectionChange }: ShowcaseHeroProps) {
  const reduce = useReducedMotion() ?? false;
  const resolved = resolveSelection(solutions, selection);
  const surfaces = listSurfaces(solutions);
  const problems = resolved.surface ? listProblems(solutions, resolved.surface) : [];
  const result = resolved.solution ? buildDiagnosticResult(resolved.solution, estimates) : null;
  const cover = resolved.solution ? coverFor(resolved.solution) : "/dev/a-tasks/office.jpg";

  return (
    <section className="relative isolate">
      <Aurora />
      <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-14 pt-10 sm:pt-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 lg:pt-20">
        <div className="min-w-0 self-center">
          <RevealText
            className="text-balance text-4xl font-bold leading-[1.05] tracking-[-0.035em] sm:text-5xl lg:text-[3.4rem]"
            parts={[{ text: "Любая задача чистоты" }, { text: "решается за минуту", accent: true }]}
          />
          <p className="mt-5 max-w-md text-[15px] leading-relaxed c-ink2">
            Протоколы с «не делайте» на первом месте, ориентиры цен и мастера города. Справочная информация, не оферта.
          </p>
          <div className="mt-7">
            <HeroSearchBox solutions={solutions} chips={chips} />
          </div>
          <dl className="mt-9 grid max-w-md grid-cols-3 gap-4 border-t c-line pt-5">
            {stats.map((s) => (
              <div key={s.label}>
                <dd className="font-mono text-2xl font-semibold tabular-nums">{s.value}</dd>
                <dt className="mt-0.5 text-xs c-ink2">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>

        <div className="min-w-0">
          <SpotlightCard className="min-h-[380px] sm:min-h-[430px]">
            <AnimatePresence initial={false}>
              <motion.div
                key={cover}
                initial={reduce ? false : { opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.5 }}
                className="absolute inset-0 -z-10"
              >
                <Image
                  src={cover}
                  alt=""
                  fill
                  priority
                  sizes="(min-width: 1024px) 640px, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />
              </motion.div>
            </AnimatePresence>

            <div className="relative flex min-h-[380px] flex-col justify-end gap-4 p-5 text-white sm:min-h-[430px] sm:p-7">
              {result ? (
                <motion.div
                  key={result.slug}
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 24 }}
                  className="space-y-4"
                >
                  <p className="text-xs font-medium uppercase tracking-wider text-white/70">Решение дня</p>
                  <h2 className="max-w-md text-balance text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                    {result.title}
                  </h2>
                  {result.warnings[0] && (
                    <p className="flex max-w-md items-start gap-2 rounded-lg bg-black/45 p-3 text-[13px] leading-snug backdrop-blur-sm">
                      <Ban className="mt-0.5 size-4 shrink-0 text-[hsl(var(--c-accent))]" aria-hidden />
                      <span>
                        <span className="font-semibold">Не делайте: </span>
                        {result.warnings[0]}
                      </span>
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    <GlowLink href={result.href}>
                      Открыть протокол
                      <ArrowRight className="size-4" aria-hidden />
                    </GlowLink>
                    <p className="font-mono text-sm tabular-nums text-white/85">
                      {pluralize(result.totalSteps, ["шаг", "шага", "шагов"])}
                      {result.estimate && ` · ${result.estimate.min}–${result.estimate.max}`}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <p className="text-sm text-white/80">Опубликованных протоколов пока нет.</p>
              )}
            </div>
          </SpotlightCard>

          <div className="mt-4 space-y-2">
            <PillTabs
              label="Поверхность"
              options={surfaces.map((s) => ({ id: s.id, label: s.label, meta: String(s.count) }))}
              value={resolved.surface}
              onChange={(id) => onSelectionChange({ surface: id as SolutionSurface })}
            />
            {problems.length > 1 && (
              <PillTabs
                label="Тип проблемы"
                options={problems.map((p) => ({ id: p.id, label: p.label }))}
                value={resolved.problem}
                onChange={(id) =>
                  onSelectionChange({ surface: resolved.surface ?? undefined, problem: id as SolutionProblemType })
                }
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
