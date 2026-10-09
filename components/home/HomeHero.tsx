"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Ban } from "lucide-react";
import { MarketBadge } from "@/components/MarketBadge";
import { SmartSearch } from "@/components/SmartSearch";
import { useRegion } from "@/components/providers/RegionProvider";
import { Aurora, GlowLink, PillTabs, RevealText, SpotlightCard } from "@/components/ui/fx";
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
  stats: { label: string; value: number }[];
}

/**
 * Hero главной в языке C: Aurora-фон, каскадный заголовок, прод-SmartSearch
 * и карточка «Решение дня» с реальным выбором протокола по поверхности/проблеме.
 */
export function HomeHero({ solutions, estimates, stats }: HomeHeroProps) {
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
            Протоколы с «не делайте» на первом месте, ориентиры цен и проверенные компании города — без посредников и
            скрытых комиссий.
          </p>
          <div className="mt-7">
            <SmartSearch />
          </div>
          <dl className="mt-9 grid max-w-md grid-cols-3 gap-4 border-t border-border pt-5">
            {stats.map((s) => (
              <div key={s.label}>
                <dd className="font-data text-2xl font-semibold text-foreground">{s.value}</dd>
                <dt className="mt-0.5 text-xs text-muted-foreground">{s.label}</dt>
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
                    <GlowLink href={result.href}>
                      Открыть протокол
                      <ArrowRight className="size-4" aria-hidden />
                    </GlowLink>
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

          <div className="mt-4 space-y-2">
            <PillTabs
              label="Поверхность"
              options={surfaces.map((s) => ({ id: s.id, label: s.label, meta: String(s.count) }))}
              value={resolved.surface}
              onChange={(id) => setSelection({ surface: id as SolutionSurface })}
            />
            {problems.length > 1 && (
              <PillTabs
                label="Тип проблемы"
                options={problems.map((p) => ({ id: p.id, label: p.label }))}
                value={resolved.problem}
                onChange={(id) =>
                  setSelection({ surface: resolved.surface ?? undefined, problem: id as SolutionProblemType })
                }
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
