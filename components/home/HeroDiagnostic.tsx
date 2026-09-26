"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Hand, ShieldAlert, Sparkles } from "lucide-react";
import { PriceRange } from "@/components/solution/PriceRange";
import { PROBLEM_TYPE_LABELS, SURFACE_LABELS } from "@/lib/solutions/meta";
import type { PriceEstimate, Solution, SolutionProblemType, SolutionSurface } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Интерактивный подбор решения прямо в hero: поверхность → тип проблемы → протокол и смета.
 * Показывает только те фасеты, для которых в графе решений реально есть данные.
 */
export function HeroDiagnostic({ solutions, estimates }: { solutions: Solution[]; estimates: PriceEstimate[] }) {
  const surfaces = useMemo(() => {
    const seen = new Set<SolutionSurface>();
    return solutions.map((s) => s.surface).filter((s) => (seen.has(s) ? false : (seen.add(s), true)));
  }, [solutions]);

  const [surface, setSurface] = useState<SolutionSurface>(surfaces[0]);

  const problems = useMemo(() => {
    const seen = new Set<SolutionProblemType>();
    return solutions
      .filter((s) => s.surface === surface)
      .map((s) => s.problemType)
      .filter((p) => (seen.has(p) ? false : (seen.add(p), true)));
  }, [solutions, surface]);

  const [problem, setProblem] = useState<SolutionProblemType | null>(null);
  const activeProblem = problem && problems.includes(problem) ? problem : problems[0];

  const solution = solutions.find((s) => s.surface === surface && s.problemType === activeProblem);
  const solutionEstimates = solution ? estimates.filter((e) => e.solutionId === solution.id) : [];

  return (
    <div className="data-surface relative rounded-panel border border-border p-5 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary">
          Быстрый подбор решения
        </span>
        <span className="font-data text-xs text-muted-foreground">{solutions.length} протоколов</span>
      </div>

      <StepLabel index={1} label="Где проблема?" className="mt-6" />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {surfaces.map((item) => (
          <Chip key={item} active={item === surface} onClick={() => { setSurface(item); setProblem(null); }}>
            {SURFACE_LABELS[item]}
          </Chip>
        ))}
      </div>

      <StepLabel index={2} label="Что случилось?" className="mt-5" />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {problems.map((item) => (
          <Chip key={item} active={item === activeProblem} onClick={() => setProblem(item)}>
            {PROBLEM_TYPE_LABELS[item]}
          </Chip>
        ))}
      </div>

      <div className="mt-6 border-t border-border pt-5">
        <AnimatePresence mode="wait" initial={false}>
          {solution ? (
            <motion.div
              key={solution.slug}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <Link href={`/solutions/${solution.slug}`} className="group block">
                <h3 className="font-display text-lg font-bold leading-snug tracking-[-0.02em] text-foreground transition-colors group-hover:text-primary sm:text-xl">
                  {solution.title}
                </h3>
              </Link>

              <ol className="mt-4 space-y-2.5">
                {solution.diySteps.slice(0, 2).map((step) => (
                  <li key={step.order} className="grid grid-cols-[1.75rem_1fr] gap-3 text-sm leading-6 text-muted-foreground">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground font-data text-xs font-medium text-background">
                      {step.order}
                    </span>
                    <span className="line-clamp-2 pt-0.5">{step.instruction}</span>
                  </li>
                ))}
                {solution.diySteps.length > 2 && (
                  <li className="pl-10 text-xs font-medium text-muted-foreground">
                    + ещё {solution.diySteps.length - 2} шага в полном протоколе
                  </li>
                )}
              </ol>

              <div className="mt-4 flex items-start gap-2 rounded-control bg-muted/60 p-3 text-xs leading-5 text-muted-foreground">
                <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-star" />
                <span className="line-clamp-2">{solution.whenToCallPro}</span>
              </div>

              <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2 text-sm">
                <span className="text-muted-foreground">Мастер в вашем городе</span>
                <PriceRange estimates={solutionEstimates} compact />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <Link
                  href={`/solutions/${solution.slug}#diy`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-card text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Hand className="h-4 w-4" />
                  Сделать самому
                </Link>
                <Link
                  href={`/solutions/${solution.slug}#pro`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
                >
                  <Sparkles className="h-4 w-4" />
                  Вызвать мастера
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-muted-foreground">
              Протокол для этой комбинации готовится.{" "}
              <Link href="/rating" className="inline-flex items-center gap-1 font-semibold text-primary">
                Смотреть компании
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StepLabel({ index, label, className }: { index: number; label: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-xs font-semibold text-muted-foreground", className)}>
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{index}</span>
      {label}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-9 rounded-full border px-3.5 text-sm font-medium transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
