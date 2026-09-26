"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { ArrowUpRight, Info } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { BRAND_SCORE_WEIGHTS, prosChoiceIds } from "@/lib/brand-score";
import { focusLabels, isLightColor } from "@/lib/brand-utils";
import { pluralize } from "@/lib/format";
import type { BrandFocus, RankedBrand } from "@/lib/types";
import { cn } from "@/lib/utils";

type Filter = BrandFocus | "all";

const filters: Array<{ key: Filter; label: string }> = [
  { key: "all", label: "Все бренды" },
  { key: "himiya", label: focusLabels.himiya },
  { key: "technika", label: focusLabels.technika },
  { key: "inventory", label: focusLabels.inventory },
];

const rankTone: Record<number, string> = {
  1: "bg-sponsor text-sponsor-foreground",
  2: "bg-muted text-foreground border border-border/80",
  3: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
};

/**
 * Публичный лидерборд брендов по «Индексу доверия профи». Плашку «Выбор профессионалов»
 * получает лидер каждого фокуса; цифры анимируются при появлении (уважая prefers-reduced-motion).
 */
export function BrandLeaderboard({ brands }: { brands: RankedBrand[] }) {
  const [active, setActive] = useState<Filter>("all");
  const winners = useMemo(() => prosChoiceIds(brands), [brands]);
  const visible = useMemo(() => (active === "all" ? brands : brands.filter((b) => b.focus === active)), [brands, active]);
  const maxScore = Math.max(1, ...brands.map((b) => b.metrics.score));

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setActive(f.key)}
              aria-pressed={active === f.key}
              className={cn(
                "h-9 rounded-full border px-4 text-sm font-medium transition-colors",
                active === f.key
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <details className="group relative text-xs text-muted-foreground">
          <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 font-medium hover:text-foreground [&::-webkit-details-marker]:hidden">
            <Info className="h-3.5 w-3.5" />
            Как считается индекс
          </summary>
          <div className="glass absolute right-0 z-20 mt-2 w-72 rounded-2xl p-4 leading-5 sm:w-80">
            Каждая верифицированная компания на бренде: {BRAND_SCORE_WEIGHTS.verifiedCompany} балла, протокол с брендом
            в роли «рекомендуем»: {BRAND_SCORE_WEIGHTS.recommended}, «альтернатива»: {BRAND_SCORE_WEIGHTS.alternative},
            переход на сайт бренда: {BRAND_SCORE_WEIGHTS.click}. Индекс нельзя купить: спонсорство помечается отдельно.
          </div>
        </details>
      </div>

      <ol className="mt-6 divide-y divide-border overflow-hidden rounded-[1.75rem] border border-border bg-card">
        {visible.map((brand, index) => (
          <LeaderboardRow
            key={brand.id}
            brand={brand}
            rank={index + 1}
            share={brand.metrics.score / maxScore}
            prosChoice={winners.has(brand.id)}
          />
        ))}
      </ol>

      {visible.length === 0 && (
        <p className="mt-6 text-center text-sm text-muted-foreground">В этой категории брендов пока нет.</p>
      )}
    </div>
  );
}

function LeaderboardRow({ brand, rank, share, prosChoice }: { brand: RankedBrand; rank: number; share: number; prosChoice: boolean }) {
  const { verifiedCompanyCount, recommendedCount, alternativeCount, score } = brand.metrics;
  const solutionCount = recommendedCount + alternativeCount;

  return (
    <li>
      <Link
        href={`/brands/${brand.slug}`}
        className="group grid grid-cols-[2rem_1fr_auto] items-center gap-3 px-4 py-4 transition-colors hover:bg-muted/40 sm:grid-cols-[2.5rem_3rem_1fr_minmax(8rem,14rem)_5rem] sm:gap-5 sm:px-6"
      >
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full font-display text-sm font-bold tabular-nums",
            rankTone[rank] ?? "bg-muted text-muted-foreground"
          )}
        >
          {rank}
        </span>

        <span
          className={cn(
            "hidden h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold shadow-sm sm:flex",
            isLightColor(brand.accent) ? "text-slate-900" : "text-white"
          )}
          style={{ backgroundColor: brand.accent }}
        >
          {brand.name.charAt(0)}
        </span>

        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-2">
            <span className="truncate font-display text-base font-bold text-foreground sm:text-lg">{brand.name}</span>
            {prosChoice && <StatusBadge variant="prosChoice" />}
            {brand.isSponsor && <StatusBadge variant="sponsor" />}
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {focusLabels[brand.focus]} · {pluralize(verifiedCompanyCount, ["компания", "компании", "компаний"])} ·{" "}
            {pluralize(solutionCount, ["протокол", "протокола", "протоколов"])}
          </span>
        </span>

        <span className="hidden sm:block" aria-hidden>
          <ScoreBar share={share} accent={brand.accent} />
        </span>

        <span className="flex items-center justify-end gap-2 text-right">
          <span className="font-display text-xl font-extrabold tabular-nums tracking-[-0.03em] text-foreground">
            <CountUp value={score} />
          </span>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </span>
      </Link>
    </li>
  );
}

function ScoreBar({ share, accent }: { share: number; accent: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  return (
    <span ref={ref} className="block h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <span
        className="block h-full rounded-full"
        style={{
          backgroundColor: accent,
          width: `${Math.max(4, share * 100)}%`,
          transform: inView || reduce ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: "left",
          transition: reduce ? "none" : "transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />
    </span>
  );
}

/**
 * Число, «набегающее» до значения при появлении в вьюпорте. В разметке сразу стоит итоговое
 * значение (SSR/SEO/reduced-motion), анимация пишет в DOM напрямую без setState.
 */
function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!inView || reduce || !node) return;
    const controls = animate(0, value, {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        node.textContent = String(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [inView, reduce, value]);

  return <span ref={ref}>{value}</span>;
}
