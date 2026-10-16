"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Ban, PhoneCall, Star, type LucideIcon } from "lucide-react";
import { MarketBadge } from "@/components/MarketBadge";
import { SmartSearch } from "@/components/SmartSearch";
import { useRegion } from "@/components/providers/RegionProvider";
import Link from "next/link";
import { Aurora, PillTabs, RevealText, SpotlightCard } from "@/components/ui/fx";
import { BeforeAfter } from "@/components/ui/BeforeAfter";
import {
  buildDiagnosticResult,
  listProblems,
  listSurfaces,
  resolveSelection,
  type DiagnosticSelection,
} from "@/lib/solutions/diagnostic";
import { solutionCover } from "@/lib/solutions/covers";
import { pluralize } from "@/lib/format";
import type { PriceEstimate, Solution, SolutionProblemType, SolutionSurface } from "@/lib/types";

interface HomeHeroProps {
  solutions: Solution[];
  estimates: PriceEstimate[];
}

/**
 * Знаки качества вместо счётчиков каталога: маленькие числа на старте говорят «сайт пустой»,
 * а принципы работы проверяемы с первого визита.
 */
const QUALITY_MARKS: { icon: LucideIcon; text: string }[] = [
  { icon: PhoneCall, text: "Прямые телефоны без комиссии и посредников" },
  { icon: Star, text: "Оценка по открытым отзывам Google и Яндекса" },
  { icon: Ban, text: "Пошаговые протоколы с предупреждениями «Не делайте»" },
];

/**
 * Hero главной в языке C: Aurora-фон, каскадный заголовок, прод-SmartSearch
 * и карточка «Решение дня» с реальным выбором протокола по поверхности/проблеме.
 */
export function HomeHero({ solutions, estimates }: HomeHeroProps) {
  const reduce = useReducedMotion() ?? false;
  const { market, city } = useRegion();
  const [selection, setSelection] = useState<DiagnosticSelection>({});

  const ctx = useMemo(() => ({ countryCode: market.countryCode, city: city.name }), [market, city]);
  const resolved = resolveSelection(solutions, selection);
  const surfaces = listSurfaces(solutions);
  const problems = resolved.surface ? listProblems(solutions, resolved.surface) : [];
  const result = resolved.solution ? buildDiagnosticResult(resolved.solution, estimates, 2, ctx) : null;
  const cover = resolved.solution ? solutionCover(resolved.solution) : "/covers/uborka-ofisa-posle-korporativa.jpg";

  return (
    <section className="relative isolate overflow-hidden">
      <Aurora />
      <div className="container grid gap-10 pb-14 pt-10 sm:pt-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 lg:pt-16">
        <div className="min-w-0 self-center">
          <MarketBadge />
          <RevealText
            className="mt-6 text-balance font-display text-4xl font-bold leading-[1.05] tracking-[-0.035em] text-foreground sm:text-5xl lg:text-[3.4rem]"
            parts={[{ text: "Любая задача чистоты" }, { text: "решается за минуту", accent: true }]}
          />
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            Пошаговые протоколы с блоком «Не делайте», ориентиры цен и проверенные компании города. Прямые контакты без
            посредников и комиссий.
          </p>
          <div className="mt-7">
            <SmartSearch />
          </div>
          <ul aria-label="Принципы платформы" className="mt-9 grid max-w-xl gap-3 border-t border-border pt-5 sm:grid-cols-3 sm:gap-4">
            {QUALITY_MARKS.map(({ icon: Icon, text }, index) => (
              <motion.li
                key={text}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 160, damping: 22, delay: reduce ? 0 : 0.35 + index * 0.08 }}
                className="flex items-start gap-2.5 sm:flex-col sm:gap-2"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-control bg-primary/10 text-link ring-1 ring-inset ring-primary/15">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="text-pretty pt-1.5 text-[13px] font-medium leading-snug text-foreground/80 sm:pt-0">{text}</span>
              </motion.li>
            ))}
          </ul>
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
                <BeforeAfter
                  src={cover}
                  priority
                  sizes="(min-width: 1024px) 640px, 100vw"
                />
                <div aria-hidden className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-t from-black/90 via-black/45 to-black/10" />
              </motion.div>
            </AnimatePresence>

            <div className="pointer-events-none relative flex min-h-[380px] flex-col justify-end gap-4 p-5 text-white sm:min-h-[430px] sm:p-7">
              {result ? (
                <motion.div
                  key={result.slug}
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 24 }}
                  className="pointer-events-auto space-y-4"
                >
                  <p className="text-xs font-medium uppercase tracking-wider text-white/70">Решение дня</p>
                  <h2 className="max-w-md text-balance font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                    {result.title}
                  </h2>
                  {result.warnings[0] && (
                    <p className="flex max-w-md items-start gap-2 rounded-control bg-black/45 p-3 text-[13px] leading-snug backdrop-blur-sm">
                      <Ban className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                      <span>
                        <span className="font-semibold">Не делайте: </span>
                        {result.warnings[0]}
                      </span>
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    <Link
                      href={result.href}
                      className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-brand-foreground shadow-sm shadow-brand/30 transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
                    >
                      Открыть протокол
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                    <p className="font-data text-sm text-white/85">
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

          <div className="mt-4 space-y-2.5">
            <div className="space-y-1">
              <span className="block px-1 text-xs font-semibold text-muted-foreground">
                <span className="font-data">01</span> Поверхность
              </span>
              <PillTabs
                label="Поверхность"
                options={surfaces.map((s) => ({ id: s.id, label: s.label, meta: String(s.count) }))}
                value={resolved.surface}
                onChange={(id) => setSelection({ surface: id as SolutionSurface })}
              />
            </div>
            {problems.length > 1 && (
              <div className="space-y-1">
                <span className="block px-1 text-xs font-semibold text-muted-foreground">
                  <span className="font-data">02</span> Тип задачи
                </span>
                <PillTabs
                  label="Тип проблемы"
                  options={problems.map((p) => ({ id: p.id, label: p.label, meta: String(p.count) }))}
                  value={resolved.problem}
                  onChange={(id) =>
                    setSelection({ surface: resolved.surface ?? undefined, problem: id as SolutionProblemType })
                  }
                />
              </div>
            )}
            {resolved.protocols.length > 1 && (
              <div className="space-y-1">
                <span className="block px-1 text-xs font-semibold text-muted-foreground">
                  <span className="font-data">{problems.length > 1 ? "03" : "02"}</span> Ситуация
                </span>
                <PillTabs
                  label="Конкретный случай"
                  options={resolved.protocols.map((protocol) => ({ id: protocol.slug, label: protocol.title }))}
                  value={resolved.solution?.slug ?? null}
                  onChange={(slug) =>
                    setSelection({
                      surface: resolved.surface ?? undefined,
                      problem: resolved.problem ?? undefined,
                      variant: slug,
                    })
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
