"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  AppWindow,
  ArrowDown,
  ArrowUpRight,
  Ban,
  BedDouble,
  Building2,
  CookingPot,
  Grid3x3,
  Hand,
  Layers,
  LayoutGrid,
  ShowerHead,
  Sofa,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { pluralize } from "@/lib/format";
import type { PriceEstimate, Solution, SolutionSurface } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  DIAGNOSTIC_RISK_NOTE,
  buildDiagnosticResult,
  listProblems,
  listSurfaces,
  nextRadioIndex,
  resolveSelection,
  type DiagnosticResult,
  type DiagnosticSelection,
} from "./diagnostic-model";
import styles from "./Diagnostic.module.css";
import { EstimateCard } from "./EstimateCard";

const SURFACE_ICONS: Record<SolutionSurface, LucideIcon> = {
  upholstery: Sofa,
  mattress: BedDouble,
  carpet: Layers,
  floor: Grid3x3,
  window: AppWindow,
  facade: Building2,
  kitchen: CookingPot,
  bathroom: ShowerHead,
  other: LayoutGrid,
};

const PROTOCOL_FORMS: [string, string, string] = ["протокол", "протокола", "протоколов"];
const SPRING = { type: "spring", stiffness: 380, damping: 32 } as const;

interface RadioOption {
  id: string;
  label: string;
  meta?: string;
  icon?: LucideIcon;
}

/**
 * Radiogroup с roving tabindex: Tab входит на выбранный элемент, стрелки,
 * Home/End двигают фокус и выбор, Space/Enter выбирают сфокусированный.
 * Выделение переезжает между элементами через layoutId (transform), при
 * reduced-motion переключается мгновенно.
 */
function RadioGroup({
  label,
  kind,
  options,
  value,
  onChange,
  reduce,
  className,
}: {
  label: string;
  kind: "tile" | "chip" | "row";
  options: RadioOption[];
  value: string | null;
  onChange: (id: string) => void;
  reduce: boolean;
  className?: string;
}) {
  const uid = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = options.findIndex((o) => o.id === value);

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    const next = nextRadioIndex(e.key, index, options.length);
    if (next === null) return;
    e.preventDefault();
    refs.current[next]?.focus();
    onChange(options[next].id);
  }

  return (
    <div role="radiogroup" aria-label={label} className={className}>
      {options.map((option, index) => {
        const selected = index === selectedIndex;
        const Icon = option.icon;
        return (
          <button
            key={option.id}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected || (selectedIndex < 0 && index === 0) ? 0 : -1}
            data-option={option.id}
            onClick={() => onChange(option.id)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cn(
              "relative min-w-0 border text-left text-[hsl(var(--v-ink))] transition-colors",
              styles.press,
              kind === "tile" &&
                "flex min-h-[4.75rem] flex-col items-start justify-between gap-1.5 rounded-[var(--v-r-ctl)] border-[hsl(var(--v-line))] bg-[hsl(var(--v-surface))] p-2.5 hover:border-[hsl(var(--v-accent)/0.4)]",
              kind === "chip" &&
                "inline-flex min-h-11 items-center gap-1.5 rounded-full border-[hsl(var(--v-line))] bg-[hsl(var(--v-surface))] px-4 text-sm font-medium whitespace-nowrap hover:border-[hsl(var(--v-accent)/0.4)]",
              kind === "row" &&
                "flex min-h-11 w-full items-center rounded-[var(--v-r-ctl)] border-[hsl(var(--v-line))] bg-[hsl(var(--v-surface))] px-3.5 py-2 text-sm leading-snug hover:border-[hsl(var(--v-accent)/0.4)]",
              selected && "border-transparent",
            )}
          >
            {selected && (
              <motion.span
                layoutId={`${uid}-sel`}
                transition={reduce ? { duration: 0 } : SPRING}
                aria-hidden="true"
                className="absolute inset-0 rounded-[inherit] border border-[hsl(var(--v-accent)/0.75)] bg-[hsl(var(--v-tint))] shadow-[0_10px_22px_-14px_hsl(var(--v-accent)/0.55)]"
              />
            )}
            {kind === "tile" ? (
              <>
                {Icon && (
                  <Icon
                    className={cn("relative size-5", selected ? "text-[hsl(var(--v-accent))]" : "text-[hsl(var(--v-ink2))]")}
                    aria-hidden="true"
                  />
                )}
                <span className="relative block min-w-0">
                  <span className="block text-sm font-semibold leading-tight">{option.label}</span>
                  {option.meta && (
                    <span className="mt-0.5 block text-xs tabular-nums text-[hsl(var(--v-ink2))]">{option.meta}</span>
                  )}
                </span>
              </>
            ) : (
              <span className="relative min-w-0">
                {option.label}
                {option.meta && (
                  <span className="ml-1.5 text-xs tabular-nums text-[hsl(var(--v-ink2))]">{option.meta}</span>
                )}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

type Path = "diy" | "pro";

const PATHS: { id: Path; label: string; icon: LucideIcon }[] = [
  { id: "diy", label: "Сделать самому", icon: Hand },
  { id: "pro", label: "Вызвать мастера", icon: Wrench },
];

function PathTabs({ result, reduce }: { result: DiagnosticResult; reduce: boolean }) {
  const uid = useId();
  const [path, setPath] = useState<Path>("diy");
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    const next = nextRadioIndex(e.key, index, PATHS.length);
    if (next === null) return;
    e.preventDefault();
    refs.current[next]?.focus();
    setPath(PATHS[next].id);
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Путь решения"
        className="grid grid-cols-2 gap-1 rounded-[var(--v-r-ctl)] bg-[hsl(var(--v-tint))] p-1"
      >
        {PATHS.map((item, index) => {
          const selected = item.id === path;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              ref={(el) => {
                refs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`${uid}-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`${uid}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setPath(item.id)}
              onKeyDown={(e) => onKeyDown(e, index)}
              className={cn(
                "relative inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[10px] px-2 text-sm font-semibold whitespace-nowrap transition-colors",
                styles.press,
                selected ? "text-[hsl(var(--v-ink))]" : "text-[hsl(var(--v-ink2))] hover:text-[hsl(var(--v-ink))]",
              )}
            >
              {selected && (
                <motion.span
                  layoutId={`${uid}-tabsel`}
                  transition={reduce ? { duration: 0 } : SPRING}
                  aria-hidden="true"
                  className="absolute inset-0 rounded-[inherit] bg-[hsl(var(--v-surface))] shadow-[0_1px_2px_hsl(222_40%_20%/0.12),inset_0_1px_0_hsl(0_0%_100%/0.6)]"
                />
              )}
              <Icon className="relative size-4" aria-hidden="true" />
              <span className="relative">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`${uid}-panel`} aria-labelledby={`${uid}-tab-${path}`} tabIndex={0} className="mt-3 rounded-[var(--v-r-ctl)]">
        <motion.div
          key={path}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 28 }}
        >
          {path === "diy" ? <DiyTab result={result} reduce={reduce} /> : <ProTab result={result} />}
        </motion.div>
      </div>
    </div>
  );
}

function DiyTab({ result, reduce }: { result: DiagnosticResult; reduce: boolean }) {
  return (
    <div>
      <motion.ol
        initial={reduce ? false : "hidden"}
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.07 } } }}
        className="space-y-2.5"
      >
        {result.steps.map((step) => (
          <motion.li
            key={step.order}
            variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }}
            className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-2.5 text-[13px] leading-snug"
          >
            <span className="mt-px grid size-6 place-items-center rounded-full bg-[hsl(var(--v-accent))] text-xs font-semibold tabular-nums text-[hsl(var(--v-accent-ink))]">
              {step.order}
            </span>
            <span className="line-clamp-3 [overflow-wrap:anywhere]">{step.instruction}</span>
          </motion.li>
        ))}
      </motion.ol>
      {result.hiddenSteps > 0 && (
        <a
          href="#two-paths"
          className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-[hsl(var(--v-accent))] hover:underline"
        >
          Ещё {pluralize(result.hiddenSteps, ["шаг", "шага", "шагов"])} в чеклисте ниже
          <ArrowDown className="size-4" aria-hidden="true" />
        </a>
      )}
    </div>
  );
}

function ProTab({ result }: { result: DiagnosticResult }) {
  return (
    <div className="space-y-3">
      <p className="text-[13px] leading-snug [overflow-wrap:anywhere]">{result.whenToCallPro}</p>
      <EstimateCard estimate={result.estimate} />
      <a
        href="#pro"
        className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-[hsl(var(--v-accent))] hover:underline"
      >
        Компании в Минске ниже
        <ArrowDown className="size-4" aria-hidden="true" />
      </a>
    </div>
  );
}

interface DiagnosticStageProps {
  solutions: Solution[];
  estimates: PriceEstimate[];
  selection: DiagnosticSelection;
  onSelectionChange: (next: DiagnosticSelection) => void;
}

/**
 * Интерактивная диагностика в hero (этап 1.6): поверхность, проблема, результат
 * на месте. Всё считается на клиенте из props (published-решения и сметы),
 * без запросов к сети. «Не делайте» стоит первым блоком результата.
 */
export function DiagnosticStage({ solutions, estimates, selection, onSelectionChange }: DiagnosticStageProps) {
  const reduce = useReducedMotion() ?? false;
  const resolved = resolveSelection(solutions, selection);
  const surfaces = listSurfaces(solutions);
  const problems = resolved.surface ? listProblems(solutions, resolved.surface) : [];
  const result = resolved.solution ? buildDiagnosticResult(resolved.solution, estimates) : null;

  const surfaceOptions: RadioOption[] = surfaces.map((s) => ({
    id: s.id,
    label: s.label,
    meta: pluralize(s.count, PROTOCOL_FORMS),
    icon: SURFACE_ICONS[s.id],
  }));
  const problemOptions: RadioOption[] = problems.map((p) => ({ id: p.id, label: p.label }));
  const variantOptions: RadioOption[] = resolved.protocols.map((p) => ({ id: p.slug, label: p.title }));

  return (
    <div id="diagnostic" className={cn(styles.stage, "scroll-mt-24")}>
      <div className={cn(styles.panel, "p-4")}>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-base font-semibold tracking-tight">Быстрый подбор протокола</h2>
          <p className="shrink-0 text-xs tabular-nums text-[hsl(var(--v-ink2))]">
            {pluralize(solutions.length, PROTOCOL_FORMS)}
          </p>
        </div>

        {surfaces.length === 0 ? (
          <p className="mt-4 text-sm text-[hsl(var(--v-ink2))]">
            Опубликованных протоколов пока нет.{" "}
            <Link href="/solutions" className="font-semibold text-[hsl(var(--v-accent))] hover:underline">
              Все решения
            </Link>
          </p>
        ) : (
          <>
            <p className="mt-3 text-sm font-medium">Где проблема?</p>
            <RadioGroup
              label="Поверхность"
              kind="tile"
              options={surfaceOptions}
              value={resolved.surface}
              onChange={(id) => onSelectionChange({ surface: id as SolutionSurface })}
              reduce={reduce}
              className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 max-sm:[&>:last-child:nth-child(odd)]:col-span-2"
            />

            <p className="mt-3 text-sm font-medium">Что случилось?</p>
            <RadioGroup
              label="Тип проблемы"
              kind="chip"
              options={problemOptions}
              value={resolved.problem}
              onChange={(id) =>
                onSelectionChange({ surface: resolved.surface ?? undefined, problem: id as DiagnosticSelection["problem"] })
              }
              reduce={reduce}
              className="mt-2 flex flex-wrap gap-2"
            />

            {resolved.protocols.length > 1 && (
              <>
                <p className="mt-3 text-sm font-medium">Уточните случай</p>
                <RadioGroup
                  label="Случай"
                  kind="row"
                  options={variantOptions}
                  value={resolved.solution?.slug ?? null}
                  onChange={(id) =>
                    onSelectionChange({
                      surface: resolved.surface ?? undefined,
                      problem: resolved.problem ?? undefined,
                      variant: id,
                    })
                  }
                  reduce={reduce}
                  className="mt-2 grid gap-2"
                />
              </>
            )}

            <div className="mt-3 border-t border-[hsl(var(--v-line))] pt-3" data-diagnostic-result>
              <AnimatePresence mode="wait" initial={false}>
                {result ? (
                  <motion.div
                    key={result.slug}
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -6, transition: { duration: 0.12 } }}
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 26 }}
                  >
                    <p role="status" className="sr-only">
                      Показан протокол: {result.title}
                    </p>
                    <h3 className="text-balance text-base font-semibold leading-snug tracking-tight">{result.title}</h3>

                    <div className={cn(styles.warn, "mt-3 p-3")} role="group" aria-label="Не делайте" data-diagnostic-warnings>
                      <p className="flex items-center gap-2 text-sm font-semibold">
                        <Ban className="size-4 shrink-0 text-[hsl(var(--v-ad))]" aria-hidden="true" />
                        Не делайте
                      </p>
                      <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[13px] leading-snug [overflow-wrap:anywhere]">
                        {result.warnings.map((warning) => (
                          <li key={warning}>{warning}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-3">
                      <PathTabs result={result} reduce={reduce} />
                    </div>

                    <Link
                      href={result.href}
                      className="mt-1 inline-flex min-h-11 items-center gap-1 text-sm font-semibold whitespace-nowrap text-[hsl(var(--v-accent))] hover:underline"
                    >
                      Полный протокол
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </Link>
                    <p className="text-xs leading-snug text-[hsl(var(--v-ink2))]">{DIAGNOSTIC_RISK_NOTE}</p>
                  </motion.div>
                ) : (
                  <motion.p key="empty" className="text-sm text-[hsl(var(--v-ink2))]">
                    Для этого сочетания протокола пока нет.{" "}
                    <Link href="/solutions" className="font-semibold text-[hsl(var(--v-accent))] hover:underline">
                      Все решения
                    </Link>
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
