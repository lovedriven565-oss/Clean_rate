"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock,
  Flame,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { HeroAnswerClose, HeroAnswerSkeleton, useHeroAssistant, type HeroAskContext } from "@/components/home/HeroAssistant";
import { buildAssistantHref, type AssistantTiming } from "@/lib/assistant/engine";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const TIMING_CHIPS: { value: AssistantTiming; label: string }[] = [
  { value: "fresh", label: "Свежее" },
  { value: "dried", label: "Высохло" },
  { value: "washed", label: "Замывали" },
];

const MAX_STEPS = 3;
const MAX_MATERIALS = 4;
const MAX_FOLLOW_UPS = 3;

function trackCta(destination: string) {
  trackEvent({
    entityType: "page",
    entityId: "home.hero_assistant",
    eventType: "share",
    metadata: { placement: "home.assistant", destination },
  });
}

/**
 * Компактный ответ ИИ-технолога в hero: вердикт, заключение, первые шаги и два пути.
 * Полный разбор (смета, компании, товары) — на /assistant по ссылке «Полный разбор».
 */
export default function HeroAnswerCard() {
  const { query, context, setTiming, setMaterial, ask, loading, answer } = useHeroAssistant();

  if (loading && !answer) return <HeroAnswerSkeleton />;
  if (!answer) return null;

  const { verdict, solution, steps, warnings, materialOptions, followUpQuestions } = answer;
  const isCustom = Boolean(solution?.isCustom);
  const fullHref = buildAssistantHref(query, context.timing, { material: context.material });
  const protocolHref = solution && !isCustom ? `/solutions/${solution.slug}` : "/solutions";

  function askWith(patch: HeroAskContext) {
    const next: HeroAskContext = { ...context, ...patch };
    if (patch.timing !== undefined) setTiming(patch.timing);
    if (patch.material !== undefined) setMaterial(patch.material);
    ask(query, next);
  }

  /** Чип «Состояние»: переключение снимает выбор, повторный клик по активному — тоже. */
  function toggleTiming(value: AssistantTiming) {
    askWith({ timing: context.timing === value ? undefined : value });
  }

  function toggleMaterial(value: string) {
    askWith({ material: context.material === value ? undefined : value });
  }

  return (
    <div className="glass flex max-h-full flex-col overflow-hidden rounded-panel">
      <div className="flex items-start justify-between gap-3 border-b border-border/70 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-teal">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            ИИ-технолог · ответ по протоколам
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-foreground">«{query}»</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-teal" aria-label="Обновляю ответ" />}
          <HeroAnswerClose />
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
        {/* Светофор-вердикт */}
        <div
          className={cn(
            "rounded-control border p-3.5",
            verdict.recommendation === "diy"
              ? "border-success/30 bg-success/10"
              : verdict.recommendation === "pro"
                ? "border-danger/30 bg-danger/10"
                : "border-star/35 bg-star/15"
          )}
        >
          <p
            className={cn(
              "flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide",
              verdict.recommendation === "diy"
                ? "text-success"
                : verdict.recommendation === "pro"
                  ? "text-danger"
                  : "text-star"
            )}
          >
            {verdict.recommendation === "diy" ? (
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
            )}
            {verdict.badge}
          </p>
          <p className="mt-1.5 text-xs leading-5 text-foreground/90 sm:text-sm">{verdict.summary}</p>
        </div>

        {solution && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {solution.title}
          </p>
        )}
        <p className="whitespace-pre-line text-sm leading-6 text-foreground">{answer.text}</p>

        {/* Запреты — до инструкций */}
        {warnings.length > 0 && (
          <div className="rounded-control border border-danger/30 bg-danger/5 p-3">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-danger">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Чего делать нельзя
            </p>
            <ul className="mt-2 space-y-1 text-xs leading-5 text-foreground/90">
              {warnings.slice(0, 3).map((w) => (
                <li key={w} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Первые шаги протокола */}
        {steps.length > 0 && (
          <ol className="space-y-2">
            {steps.slice(0, MAX_STEPS).map((step, index) => (
              <li key={step.order} className="flex gap-2.5 text-sm leading-6 text-foreground">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-teal/35 bg-teal/10 font-data text-xs font-bold text-teal">
                  {index + 1}
                </span>
                <span className="min-w-0">
                  {step.instruction}
                  {step.tip && (
                    <span className="mt-1 block rounded-control border border-teal/20 bg-teal/5 px-2.5 py-1 text-xs leading-5 text-foreground/90">
                      <strong className="font-semibold text-teal">Нюанс:</strong> {step.tip}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        )}
        {steps.length > MAX_STEPS && (
          <p className="text-xs text-muted-foreground">
            Всего {steps.length} шага — полный чек-лист на странице протокола.
          </p>
        )}

        {/* Уточнение состояния пятна и материала — перезапрашивает ответ */}
        <div className="space-y-2 border-t border-border/70 pt-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
              <Clock className="h-3 w-3" aria-hidden /> Состояние:
            </span>
            {TIMING_CHIPS.map((chip) => {
              const active = context.timing === chip.value;
              return (
                <button
                  key={chip.value}
                  type="button"
                  onClick={() => toggleTiming(chip.value)}
                  aria-pressed={active}
                  className={cn(
                    "h-7 rounded-full border px-2.5 text-xs font-medium transition-colors",
                    active
                      ? "border-teal bg-teal text-teal-foreground"
                      : "border-border bg-card/70 text-muted-foreground hover:border-teal/40 hover:text-foreground"
                  )}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
          {materialOptions.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-[11px] font-semibold text-muted-foreground">Покрытие:</span>
              {materialOptions.slice(0, MAX_MATERIALS).map((mat) => {
                const active = context.material === mat;
                return (
                  <button
                    key={mat}
                    type="button"
                    onClick={() => toggleMaterial(mat)}
                    aria-pressed={active}
                    className={cn(
                      "h-7 rounded-full border px-2.5 text-xs font-medium transition-colors",
                      active
                        ? "border-teal bg-teal text-teal-foreground"
                        : "border-border bg-card/70 text-muted-foreground hover:border-teal/40 hover:text-foreground"
                    )}
                  >
                    {mat}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Два пути */}
        <div className="grid gap-2 sm:grid-cols-2">
          <Link
            href={protocolHref}
            onClick={() => trackCta("protocol")}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-lime px-4 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <Check className="h-4 w-4" aria-hidden />
            {isCustom ? "Все протоколы" : "Сделать самому"}
          </Link>
          <Link
            href="/rating"
            onClick={() => trackCta("rating")}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:border-ink/40"
          >
            <Flame className="h-4 w-4" aria-hidden />
            Вызвать мастера
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            href={fullHref}
            onClick={() => trackCta("full")}
            className="inline-flex items-center gap-1 text-xs font-semibold text-teal hover:underline"
          >
            Полный разбор: смета и мастера вашего города
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          <Link
            href="/assistant"
            onClick={() => trackCta("assistant_page")}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Открыть ИИ-технолога
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>

        {/* Уточняющие вопросы */}
        {followUpQuestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 border-t border-border/70 pt-3">
            {followUpQuestions.slice(0, MAX_FOLLOW_UPS).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => {
                  trackCta("follow_up");
                  ask(q);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-left text-xs font-medium text-foreground transition-colors hover:border-teal/40 hover:bg-teal/5 hover:text-teal"
              >
                <Sparkles className="h-3 w-3 shrink-0 text-teal" aria-hidden />
                {q}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
