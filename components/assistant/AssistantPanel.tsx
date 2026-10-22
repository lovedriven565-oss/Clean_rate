"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Check,
  Clock,
  FlaskConical,
  Hand,
  HelpCircle,
  Loader2,
  MessageCircle,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Wallet,
} from "lucide-react";
import { CompanyAvatar } from "@/components/CompanyAvatar";
import { PhoneButton } from "@/components/PhoneButton";
import { useRegion } from "@/components/providers/RegionProvider";
import { PriceRange } from "@/components/solution/PriceRange";
import { Panel } from "@/components/ui/Panel";
import { PhScale } from "@/components/ui/PhScale";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Input } from "@/components/ui/primitives";
import { trackClick } from "@/lib/analytics";
import type {
  AssistantAnswer,
  AssistantContext,
  AssistantTiming,
} from "@/lib/assistant/engine";
import { categoryLandingHref } from "@/lib/categories";
import { formatRating } from "@/lib/format";
import { buildHumanSafetyBadge, findSeedProduct } from "@/lib/ph";
import { buildProCompanies } from "@/lib/solutions/diagnostic";
import { SURFACE_LABELS, SURFACE_RISK_LABELS } from "@/lib/solutions/meta";
import type { Brand, Company, PriceEstimate, Solution, SolutionSurface } from "@/lib/types";
import { cn, scrollBehavior } from "@/lib/utils";

const QUICK_SCENARIOS = [
  "Как помыть окна без разводов",
  "Красное вино или сок на велюровом диване",
  "Запах в холодильнике — чем помыть внутри",
  "Запах кошачьей мочи на ковре",
  "Белый налёт на чёрном матовом смесителе",
  "Как отмыть духовку от жира и нагара",
];

const TIMING_OPTIONS: { value: AssistantTiming; label: string; hint: string }[] = [
  { value: "fresh", label: "Свежее (только что)", hint: "До 1–2 часов" },
  { value: "dried", label: "Уже высохло", hint: "Старше суток" },
  { value: "washed", label: "Уже замывали мылом / Ванишем", hint: "Остался развод или запах" },
];

export interface AssistantPanelProps {
  companies?: Company[];
  brands?: Brand[];
  estimates?: PriceEstimate[];
  solutions?: Solution[];
}

/** Панель ИИ-технолога ChistoLab: точечный диагноз + полный ответ «Два пути» на одном экране. */
export function AssistantPanel({
  companies = [],
  brands = [],
  estimates = [],
  solutions = [],
}: AssistantPanelProps) {
  const params = useSearchParams();
  const { market, city, countryCode } = useRegion();
  const initialQuery = params.get("q")?.trim() ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [timing, setTiming] = useState<AssistantTiming | undefined>(undefined);
  const [material, setMaterial] = useState<string | undefined>(undefined);
  const [selectedSlug, setSelectedSlug] = useState<string | undefined>(undefined);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [answer, setAnswer] = useState<AssistantAnswer | null>(null);
  const [loading, setLoading] = useState(false);
  const answerRef = useRef<HTMLDivElement>(null);
  const autoSubmittedRef = useRef<string | null>(null);

  const runConsultation = useCallback(
    async (
      targetQuery: string,
      nextContext?: {
        timing?: AssistantTiming;
        material?: string;
        solutionSlug?: string;
      }
    ) => {
      const message = targetQuery.trim();
      if (message.length < 2) return;
      setLoading(true);
      try {
        const contextPayload: AssistantContext = {
          timing: nextContext?.timing,
          material: nextContext?.material,
          solutionSlug: nextContext?.solutionSlug,
          countryCode,
        };
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, context: contextPayload }),
        });
        if (!res.ok) throw new Error("assistant failed");
        const data: AssistantAnswer = await res.json();
        setAnswer(data);
        setCheckedSteps({});
      } catch {
        setAnswer({
          mode: "empty",
          text: "Не удалось получить ответ. Проверьте соединение и попробуйте ещё раз.",
          verdict: {
            recommendation: "caution",
            badge: "Временная ошибка связи",
            summary: "Попробуйте отправить запрос повторно или выберите один из готовых сценариев ниже.",
          },
          steps: [],
          products: [],
          warnings: [],
          alternatives: [],
          materialOptions: [],
          followUpQuestions: QUICK_SCENARIOS.slice(0, 3),
          confidence: 0,
        });
      } finally {
        setLoading(false);
      }
    },
    [countryCode]
  );

  // Авто-запуск при переходе из умного поиска (/assistant?q=...)
  useEffect(() => {
    if (initialQuery && autoSubmittedRef.current !== initialQuery) {
      autoSubmittedRef.current = initialQuery;
      setQuery(initialQuery);
      void runConsultation(initialQuery, { timing, material, solutionSlug: selectedSlug });
    }
  }, [initialQuery, material, runConsultation, selectedSlug, timing]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim() || loading) return;
    setSelectedSlug(undefined);
    void runConsultation(query, { timing, material, solutionSlug: undefined });
  }

  function handleScenarioSelect(scenario: string) {
    setQuery(scenario);
    setSelectedSlug(undefined);
    setMaterial(undefined);
    void runConsultation(scenario, { timing, material: undefined, solutionSlug: undefined });
  }

  function handleTimingToggle(nextTiming: AssistantTiming) {
    const resolved = timing === nextTiming ? undefined : nextTiming;
    setTiming(resolved);
    if (query.trim().length >= 2) {
      void runConsultation(query, { timing: resolved, material, solutionSlug: selectedSlug });
    }
  }

  function handleMaterialToggle(nextMaterial: string) {
    const resolved = material === nextMaterial ? undefined : nextMaterial;
    setMaterial(resolved);
    if (query.trim().length >= 2) {
      void runConsultation(query, { timing, material: resolved, solutionSlug: selectedSlug });
    }
  }

  function handleAlternativeSwitch(slug: string, title: string) {
    setSelectedSlug(slug);
    setMaterial(undefined);
    const activeQuery = query.trim().length >= 2 ? query : title;
    setQuery(activeQuery);
    void runConsultation(activeQuery, { timing, material: undefined, solutionSlug: slug });
  }

  function handleFollowUpClick(question: string) {
    setQuery(question);
    void runConsultation(question, {
      timing,
      material,
      solutionSlug: answer?.solution?.slug ?? selectedSlug,
    });
    answerRef.current?.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
  }

  function toggleStep(order: number) {
    setCheckedSteps((prev) => ({ ...prev, [order]: !prev[order] }));
  }

  // Полный объект решения из базы (для совместимости с компонентами смет и компаний)
  const fullSolution = useMemo<Solution | null>(() => {
    if (!answer?.solution) return null;
    const fromProp = solutions.find((s) => s.slug === answer.solution!.slug);
    if (fromProp) return fromProp;
    return {
      id: answer.solution.id,
      slug: answer.solution.slug,
      title: answer.solution.title,
      problemType: answer.solution.problemType,
      surface: answer.solution.surface,
      material: answer.solution.material,
      severity: answer.solution.severity,
      audience: "both",
      diySteps: answer.steps,
      warnings: answer.warnings,
      whenToCallPro: answer.solution.whenToCallPro,
      diyCostNote: answer.solution.diyCostNote,
      proTimeNote: answer.solution.proTimeNote,
      searchKeywords: [],
      relatedCategory: answer.solution.relatedCategory,
      status: "published",
    };
  }, [answer, solutions]);

  const solutionEstimates = useMemo(() => {
    if (!answer?.solution) return [];
    const byId = estimates.filter((e) => e.solutionId === answer.solution!.id);
    if (byId.length > 0) return byId;
    const bySlug = estimates.filter((e) => e.solutionId === answer.solution!.slug);
    if (bySlug.length > 0) return bySlug;
    if (answer.solution.relatedCategory) {
      return estimates.filter((e) => e.categoryId === answer.solution!.relatedCategory);
    }
    return [];
  }, [answer, estimates]);

  const proCompanies = useMemo(() => {
    if (!fullSolution || companies.length === 0) return { sponsor: null, organic: [] };
    return buildProCompanies(companies, fullSolution, {
      cities: market.cities.map((c) => c.name),
      limit: 3,
    });
  }, [companies, fullSolution, market.cities]);

  const pickedCompanies = proCompanies.sponsor
    ? [proCompanies.sponsor, ...proCompanies.organic]
    : proCompanies.organic;

  const brandBySlugOrId = useCallback(
    (id?: string) => brands.find((b) => b.id === id || b.slug === id),
    [brands]
  );

  const ratingHref = answer?.solution?.relatedCategory
    ? categoryLandingHref(city.slug, answer.solution.relatedCategory)
    : "/rating";

  return (
    <div className="mt-8">
      {/* Панель ввода и первичного триажа */}
      <Panel variant="glass" className="p-4 sm:p-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Sparkles className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Опишите задачу: «пролил гранатовый сок на велюр», «запах мочи на матрасе»…"
                aria-label="Вопрос технологу по чистке"
                className="h-12 border-border/80 bg-card/80 pl-11 pr-4 text-[15px] shadow-none focus:border-primary"
              />
            </div>
            <button
              type="submit"
              disabled={loading || query.trim().length < 2}
              className={cn(
                "inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-brand-foreground transition",
                "hover:opacity-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Разобрать задачу
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>

          {/* Триаж состояния пятна: работает и до, и после отправки */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="mr-1 text-xs font-semibold text-muted-foreground">
              Состояние:
            </span>
            {TIMING_OPTIONS.map((opt) => {
              const active = timing === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleTimingToggle(opt.value)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/80 bg-card/70 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Быстрые сценарии для старта в 1 клик */}
          <div className="flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-3">
            <span className="mr-1 text-xs font-medium text-muted-foreground">
              Частые задачи:
            </span>
            {QUICK_SCENARIOS.map((scenario) => (
              <button
                key={scenario}
                type="button"
                onClick={() => handleScenarioSelect(scenario)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  query === scenario
                    ? "border-primary/40 bg-primary/10 font-semibold text-primary"
                    : "border-border/70 bg-card/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                )}
              >
                {scenario}
              </button>
            ))}
          </div>
        </form>
      </Panel>

      {/* Полный ответ «Два пути» */}
      {answer && (
        <div ref={answerRef} className="mt-6 space-y-6 scroll-mt-24">
          {/* Карточка заключения технолога + уточнение материала */}
          <Panel variant="card" className="p-5 sm:p-7">
            {/* Верхняя строка: найденный протокол и переключатель альтернатив */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {answer.solution ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {answer.solution.isCustom
                      ? "Индивидуальный разбор ИИ-технолога · Контроль pH"
                      : "Проверенный протокол ChistoLab"}
                  </span>
                  <span className="rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
                    {SURFACE_LABELS[answer.solution.surface as SolutionSurface] ?? answer.solution.surface}
                    {material ? ` · ${material}` : answer.solution.material ? ` · ${answer.solution.material}` : ""}
                  </span>
                </div>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                  <HelpCircle className="h-3.5 w-3.5" />
                  Уточнение задачи
                </span>
              )}

              {answer.solution && !answer.solution.isCustom && !answer.solution.isGuide && (
                <Link
                  href={`/solutions/${answer.solution.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  Страница протокола
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            {answer.solution && (
              <h2 className="mt-3 font-display text-xl font-bold tracking-[-0.02em] text-foreground sm:text-2xl">
                {answer.solution.title}
              </h2>
            )}

            {/* Уточнение материала поверхности в 1 клик */}
            {answer.materialOptions.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-xs font-semibold text-muted-foreground">
                  Уточните покрытие:
                </span>
                {answer.materialOptions.map((mat) => {
                  const active = material === mat;
                  return (
                    <button
                      key={mat}
                      type="button"
                      onClick={() => handleMaterialToggle(mat)}
                      aria-pressed={active}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-muted/40 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                      )}
                    >
                      {mat}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Светофор-вердикт: Сделать самому / Осторожно / Нужен мастер */}
            <div
              className={cn(
                "mt-5 rounded-control border p-4",
                answer.verdict.recommendation === "diy"
                  ? "border-success/30 bg-success/10"
                  : answer.verdict.recommendation === "pro"
                    ? "border-danger/30 bg-danger/10"
                    : "border-star/35 bg-star/15"
              )}
            >
              <p
                className={cn(
                  "flex items-center gap-2 text-xs font-bold uppercase tracking-wide",
                  answer.verdict.recommendation === "diy"
                    ? "text-success"
                    : answer.verdict.recommendation === "pro"
                      ? "text-danger"
                      : "text-star"
                )}
              >
                {answer.verdict.recommendation === "diy" ? (
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                )}
                {answer.verdict.badge}
              </p>
              <p className="mt-1.5 text-xs leading-5 text-foreground/90 sm:text-sm">
                {answer.verdict.summary}
              </p>
            </div>

            {/* Персональный разбор технолога (LLM или детерминированный протокол) */}
            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Заключение технолога
              </p>
              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-foreground sm:text-[15px]">
                {answer.text}
              </p>
            </div>

            {/* Блок «Осторожно / Чего делать нельзя» */}
            {answer.warnings.length > 0 && (
              <div className="mt-5 rounded-control border border-danger/30 bg-danger/5 p-4">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-danger">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Чего категорически нельзя делать
                </p>
                <ul className="mt-2.5 space-y-1.5 text-xs leading-5 text-foreground/90 sm:text-sm">
                  {answer.warnings.map((w) => (
                    <li key={w} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Переключение на альтернативные протоколы, если запрос подходил к нескольким */}
            {answer.alternatives.length > 0 && (
              <div className="mt-5 border-t border-border/70 pt-4">
                <p className="text-xs font-semibold text-muted-foreground">
                  {answer.solution
                    ? "Имели в виду другую задачу? Переключить протокол в 1 клик:"
                    : "Выберите ближайший проверенный протокол:"}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {answer.alternatives.map((alt) => (
                    <button
                      key={alt.id}
                      type="button"
                      onClick={() => handleAlternativeSwitch(alt.id, alt.title)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      <Sparkles className="h-3 w-3 text-primary" />
                      {alt.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Panel>

          {/* ДВА ПУТИ: Путь 1 (Сделать самому + Химия) и Путь 2 (Вызвать мастера + Смета + Компании) */}
          {answer.solution && (
            <div className="grid gap-6 lg:grid-cols-12">
              {/* ПУТЬ 1: Сделать самому */}
              <section
                id="assistant-diy"
                aria-labelledby="assistant-diy-title"
                className="data-surface flex min-w-0 flex-col rounded-panel p-5 sm:p-6 lg:col-span-7"
              >
                <header className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                      <Hand className="h-3.5 w-3.5" />
                      Путь 1 · Сделать самому
                    </span>
                    <h3
                      id="assistant-diy-title"
                      className="mt-1 font-display text-xl font-bold tracking-[-0.02em] text-foreground"
                    >
                      Пошаговый протокол и средства
                    </h3>
                  </div>
                  {answer.solution.diyCostNote && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
                      <Wallet className="h-3.5 w-3.5 text-primary" />
                      {answer.solution.diyCostNote}
                    </span>
                  )}
                </header>

                {/* Интерактивный чек-лист шагов с подсказками tip */}
                {answer.steps.length > 0 && (
                  <ol className="mt-5 space-y-2.5">
                    {answer.steps.map((step) => {
                      const done = Boolean(checkedSteps[step.order]);
                      return (
                        <li
                          key={step.order}
                          className={cn(
                            "rounded-control border p-3.5 transition-colors",
                            done
                              ? "border-success/30 bg-success/5"
                              : "border-border/80 bg-card/80 hover:border-primary/30"
                          )}
                        >
                          <label className="flex cursor-pointer items-start gap-3">
                            <input
                              type="checkbox"
                              checked={done}
                              onChange={() => toggleStep(step.order)}
                              className="sr-only"
                            />
                            <span
                              aria-hidden
                              className={cn(
                                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-data text-xs font-bold transition-colors",
                                done
                                  ? "border-success bg-success text-white"
                                  : "border-primary/35 bg-primary/10 text-primary"
                              )}
                            >
                              {done ? <Check className="h-3.5 w-3.5" /> : step.order}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span
                                className={cn(
                                  "block text-sm leading-6 text-foreground",
                                  done && "line-through opacity-70"
                                )}
                              >
                                {step.instruction}
                              </span>
                              {step.tip && (
                                <span className="mt-1.5 block rounded-control border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs leading-5 text-foreground/90">
                                  <strong className="font-semibold text-primary">Нюанс технолога:</strong>{" "}
                                  {step.tip}
                                </span>
                              )}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ol>
                )}

                {/* Проверенные средства со светофором безопасности pH и кнопками покупки */}
                {answer.products.length > 0 && (
                  <div className="mt-6 border-t border-border/70 pt-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="font-display text-base font-bold text-foreground">
                          Безопасные средства из протокола
                        </h4>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Составы подобраны так, чтобы не повредить{" "}
                          {SURFACE_RISK_LABELS[answer.solution.surface] ?? "поверхность"}.
                        </p>
                      </div>
                    </div>

                    <ul className="mt-3.5 space-y-2.5">
                      {answer.products.map((p) => {
                        const brand = brandBySlugOrId(p.brandId);
                        const seedProduct = findSeedProduct({
                          productId: p.productId,
                          brandId: p.brandId,
                          productName: p.productName,
                          note: p.note,
                        });
                        const safetyBadge = buildHumanSafetyBadge({
                          product: seedProduct,
                          surface: answer.solution?.surface,
                          solution: fullSolution,
                          note: p.note,
                        });
                        const label =
                          p.note ??
                          p.productName ??
                          seedProduct?.name ??
                          brand?.name ??
                          "Профессиональное средство";
                        const buyUrl = brand && brand.affiliateUrl !== "#" ? brand.affiliateUrl : null;
                        const isPrimary = p.role === "recommended";

                        return (
                          <li
                            key={p.id ?? label}
                            className="rounded-control border border-border/80 bg-card p-3.5"
                          >
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span
                                className={
                                  isPrimary
                                    ? "inline-flex items-center rounded-full bg-primary/12 px-2.5 py-0.5 text-[11px] font-semibold text-primary"
                                    : "inline-flex items-center rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                                }
                              >
                                {isPrimary ? "Основной состав" : "Альтернатива"}
                              </span>
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                                  safetyBadge.className
                                )}
                              >
                                {safetyBadge.light === "red" ? (
                                  <AlertTriangle className="h-3 w-3 shrink-0" />
                                ) : safetyBadge.light === "yellow" ? (
                                  <FlaskConical className="h-3 w-3 shrink-0" />
                                ) : (
                                  <ShieldCheck className="h-3 w-3 shrink-0" />
                                )}
                                {safetyBadge.label}
                              </span>
                              {(p.ph !== undefined || safetyBadge.proPhLabel) && (
                                <span className="inline-flex items-center rounded-full border border-border bg-muted/40 px-2 py-0.5 font-data text-[11px] font-medium text-muted-foreground">
                                  {safetyBadge.proPhLabel ?? `pH ${p.ph}`}
                                </span>
                              )}
                            </div>

                            <div className="mt-2.5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground">{label}</p>
                                {safetyBadge.prohibitedLabels.length > 0 && (
                                  <p className="mt-1 text-[11px] text-muted-foreground">
                                    Не применять на:{" "}
                                    <span className="font-medium text-danger">
                                      {safetyBadge.prohibitedLabels.join(", ")}
                                    </span>
                                  </p>
                                )}
                              </div>
                              <div className="flex shrink-0 items-center gap-2">
                                {brand && (
                                  <Link
                                    href={`/brands/${brand.slug}`}
                                    className="inline-flex h-8 items-center gap-1 rounded-full border border-border bg-muted/50 px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                                  >
                                    О бренде
                                  </Link>
                                )}
                                {buyUrl && (
                                  <a
                                    href={buyUrl}
                                    target="_blank"
                                    rel="sponsored nofollow noopener"
                                    className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                                  >
                                    <ShoppingCart className="h-3.5 w-3.5" />
                                    Купить
                                  </a>
                                )}
                              </div>
                            </div>

                            {p.ph !== undefined && (
                              <PhScale compact className="mt-2.5" ph={p.ph} />
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </section>

              {/* ПУТЬ 2: Вызвать мастера + Региональная смета + Компании города */}
              <section
                id="assistant-pro"
                aria-labelledby="assistant-pro-title"
                className="data-surface flex min-w-0 flex-col rounded-panel p-5 sm:p-6 lg:col-span-5"
              >
                <header className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                      <Sparkles className="h-3.5 w-3.5" />
                      Путь 2 · Вызвать мастера
                    </span>
                    <h3
                      id="assistant-pro-title"
                      className="mt-1 font-display text-xl font-bold tracking-[-0.02em] text-foreground"
                    >
                      Когда нужна спецтехника
                    </h3>
                  </div>
                  {answer.solution.proTimeNote && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      {answer.solution.proTimeNote}
                    </span>
                  )}
                </header>

                <p className="mt-4 text-sm leading-6 text-foreground/90">
                  {answer.solution.whenToCallPro}
                </p>

                {/* Смета в валюте выбранного города */}
                {solutionEstimates.length > 0 && (
                  <PriceRange estimates={solutionEstimates} className="mt-5" />
                )}

                {/* Компании города пользователя */}
                <div className="mt-6 flex items-baseline justify-between gap-2">
                  <h4 className="text-sm font-bold text-foreground">
                    Мастера · {city.name}
                  </h4>
                  <Link
                    href={ratingHref}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    Весь рейтинг
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {pickedCompanies.length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {pickedCompanies.map((company) => {
                      const isSponsor = company.id === proCompanies.sponsor?.id;
                      const hasRating =
                        company.reviewCount > 0 &&
                        (company.ratingSource === "google" || company.ratingSource === "yandex");
                      const categoryId = company.categories[0];

                      return (
                        <li
                          key={company.id}
                          className="flex flex-col gap-2.5 rounded-control border border-border/80 bg-card p-3.5 transition-colors hover:border-primary/30 sm:flex-row sm:items-center"
                        >
                          <Link
                            href={`/companies/${company.slug}`}
                            className="flex min-w-0 flex-1 items-center gap-2.5"
                          >
                            <CompanyAvatar
                              id={company.id}
                              name={company.name}
                              size="sm"
                              className="shrink-0"
                            />
                            <span className="min-w-0">
                              <span className="flex flex-wrap items-center gap-1.5">
                                <span className="truncate text-sm font-semibold text-foreground">
                                  {company.name}
                                </span>
                                {company.verified && (
                                  <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
                                )}
                                {isSponsor && <StatusBadge variant="sponsor" />}
                              </span>
                              <span className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                                {hasRating ? (
                                  <span className="inline-flex items-center gap-1 text-ad">
                                    <Star className="h-3 w-3 fill-star text-star" />
                                    {formatRating(company.baseRating)} · {company.reviewCount}
                                  </span>
                                ) : (
                                  <span>Профиль в каталоге</span>
                                )}
                              </span>
                            </span>
                          </Link>

                          <div className="flex shrink-0 items-center gap-1.5">
                            {company.phone && (
                              <PhoneButton
                                phone={company.phone}
                                companyId={company.id}
                                categoryId={categoryId}
                                compact
                              />
                            )}
                            {company.telegramUrl && (
                              <a
                                href={company.telegramUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Telegram ${company.name}`}
                                onClick={() =>
                                  trackClick({
                                    companyId: company.id,
                                    categoryId,
                                    clickType: "telegram",
                                  })
                                }
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                              >
                                <MessageCircle className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="mt-3 rounded-control border border-dashed border-border bg-card/60 p-4 text-xs leading-5 text-muted-foreground">
                    В {city.nameIn} компании ещё подключаются к платформе.{" "}
                    <Link href="/for-partners" className="font-semibold text-primary">
                      Подключить компанию
                    </Link>
                  </div>
                )}

                <Link
                  href={answer.solution.isCustom ? "/solutions" : `/solutions/${answer.solution.slug}`}
                  className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
                >
                  {answer.solution.isCustom
                    ? "Смотреть все проверенные протоколы"
                    : `Открыть полную карту протокола «${answer.solution.title}»`}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </section>
            </div>
          )}

          {/* Быстрые уточняющие вопросы в 1 клик для продолжения диалога */}
          {answer.followUpQuestions.length > 0 && (
            <Panel variant="card" className="p-4 sm:p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Уточнить нюансы у технолога в 1 клик
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {answer.followUpQuestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleFollowUpClick(q)}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-2 text-left text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                  >
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span>{q}</span>
                  </button>
                ))}
              </div>
            </Panel>
          )}
        </div>
      )}
    </div>
  );
}
