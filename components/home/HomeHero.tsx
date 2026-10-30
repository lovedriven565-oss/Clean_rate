"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AppWindow,
  ArrowRight,
  Ban,
  BedDouble,
  Boxes,
  Building,
  CookingPot,
  Droplets,
  Grip,
  Layers,
  PaintRoller,
  ShowerHead,
  Sofa,
  Sparkles,
  Wind,
  Wine,
  type LucideIcon,
} from "lucide-react";
import { MarketBadge } from "@/components/MarketBadge";
import { SmartSearch } from "@/components/SmartSearch";
import { TextEffect } from "@/components/ui/text-effect";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { RadioCards } from "@/components/arc/radio-cards/radio-cards";
import arcButton from "@/components/arc/button/button.module.css";
import { useRegion } from "@/components/providers/RegionProvider";
import {
  buildDiagnosticResult,
  listAllProblems,
  listSurfaces,
  resolveSelection,
  type DiagnosticSelection,
} from "@/lib/solutions/diagnostic";
import { pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  PriceEstimate,
  Solution,
  SolutionProblemType,
  SolutionSurface,
} from "@/lib/types";

interface HomeHeroProps {
  solutions: Solution[];
  estimates: PriceEstimate[];
}

const PROBLEM_ICONS: Record<SolutionProblemType, LucideIcon> = {
  stain: Wine,
  odor: Wind,
  scale: Droplets,
  postrenovation: PaintRoller,
  general: Sparkles,
};

const SURFACE_ICONS: Record<SolutionSurface, LucideIcon> = {
  upholstery: Sofa,
  mattress: BedDouble,
  carpet: Grip,
  floor: Layers,
  window: AppWindow,
  facade: Building,
  kitchen: CookingPot,
  bathroom: ShowerHead,
  other: Boxes,
};

/**
 * Hero главной: тёплая витрина без картинки — фраза (TextEffect) и диагностика
 * в три тапа на всю ширину: «Что случилось» → «На чём» → карточка протокола.
 * Выбор — на Arc radio-cards, результат — чистая логика lib/solutions/diagnostic.
 */
export function HomeHero({ solutions, estimates }: HomeHeroProps) {
  const { market, city } = useRegion();
  const [selection, setSelection] = useState<DiagnosticSelection>({});

  const ctx = useMemo(() => ({ countryCode: market.countryCode, city: city.name }), [market, city]);
  const resolved = resolveSelection(solutions, selection);
  const problems = useMemo(() => listAllProblems(solutions), [solutions]);
  const surfaces = useMemo(() => listSurfaces(solutions), [solutions]);

  const result = resolved.solution
    ? buildDiagnosticResult(resolved.solution, estimates, 2, ctx)
    : null;
  const active = resolved.solution;

  return (
    <section className="relative isolate">
      <div className="container pb-14 pt-10 sm:pb-16 sm:pt-14">
        <MarketBadge />
        <TextEffect
          as="h1"
          per="word"
          preset="fade-in-blur"
          delay={0.08}
          className="mt-6 max-w-3xl text-balance font-display text-4xl font-bold leading-[1.05] tracking-[-0.035em] text-foreground sm:text-5xl lg:text-[3.4rem]"
        >
          Найдите решение любой задачи чистоты
        </TextEffect>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          Три шага до протокола: что случилось и на какой поверхности — и готовая инструкция
          с блоком «Не делайте» и честной сметой мастера.
        </p>

        <AnimatedGroup preset="blur-slide" className="mt-8 space-y-6">
          {problems.length > 0 && surfaces.length > 0 && (
            <div className="data-surface rounded-panel p-4 sm:p-6">
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="min-w-0">
                  <p className="font-data text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    1 · Что случилось
                  </p>
                  <RadioCards
                    className="mt-2.5"
                    layout="grid"
                    minColumnWidth={132}
                    aria-label="Тип проблемы"
                    options={problems.map((option) => {
                      const Icon = PROBLEM_ICONS[option.id];
                      return {
                        value: option.id,
                        label: option.label,
                        meta: String(option.count),
                        icon: <Icon aria-hidden />,
                      };
                    })}
                    value={resolved.problem}
                    onValueChange={(value) =>
                      setSelection((prev) => ({
                        ...prev,
                        problem: value as SolutionProblemType,
                        variant: undefined,
                      }))
                    }
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-data text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    2 · На чём
                  </p>
                  <RadioCards
                    className="mt-2.5"
                    layout="grid"
                    minColumnWidth={126}
                    aria-label="Поверхность"
                    options={surfaces.map((option) => {
                      const Icon = SURFACE_ICONS[option.id];
                      return {
                        value: option.id,
                        label: option.label,
                        meta: String(option.count),
                        icon: <Icon aria-hidden />,
                      };
                    })}
                    value={resolved.surface}
                    onValueChange={(value) =>
                      setSelection((prev) => ({
                        ...prev,
                        surface: value as SolutionSurface,
                        variant: undefined,
                      }))
                    }
                  />
                </div>
              </div>

              {result && active && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-panel border border-border bg-muted/40 p-4 sm:p-5">
                  <div className="min-w-0 max-w-2xl">
                    <p className="flex flex-wrap items-center gap-1.5 font-data text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      <span className="rounded-full bg-card px-2.5 py-1 text-foreground/80 ring-1 ring-inset ring-border">
                        3 · Ваш протокол
                      </span>
                      <span className="rounded-full bg-card px-2.5 py-1 ring-1 ring-inset ring-border">
                        {pluralize(result.totalSteps, ["шаг", "шага", "шагов"])}
                      </span>
                      {result.estimate && (
                        <span className="rounded-full bg-success/15 px-2.5 py-1 font-bold normal-case tracking-normal text-success">
                          Выезд мастера: {result.estimate.min}–{result.estimate.max}
                          {result.estimate.unit ? ` ${result.estimate.unit}` : ""}
                        </span>
                      )}
                    </p>
                    <h2 className="mt-2.5 text-balance font-display text-xl font-bold leading-tight tracking-tight text-foreground sm:text-2xl">
                      {result.title}
                    </h2>
                    {result.warnings[0] && (
                      <p className="mt-3 flex items-start gap-2 rounded-control bg-danger/10 p-3 text-[13px] leading-snug text-foreground ring-1 ring-inset ring-danger/25">
                        <Ban className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
                        <span>
                          <span className="font-semibold text-danger">Не делайте: </span>
                          {result.warnings[0]}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-3">
                    <Link
                      href={result.href}
                      className={cn(arcButton.button, arcButton.primary, arcButton.lg)}
                    >
                      Открыть протокол
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                    <Link
                      href={`/assistant?q=${encodeURIComponent(result.title)}`}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-link"
                    >
                      <Sparkles className="size-3.5 text-link" aria-hidden />
                      Спросить ИИ-технолога
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <p className="mb-2.5 text-xs font-medium text-muted-foreground">
              Или опишите задачу словами
            </p>
            <SmartSearch />
          </div>
        </AnimatedGroup>
      </div>
    </section>
  );
}
