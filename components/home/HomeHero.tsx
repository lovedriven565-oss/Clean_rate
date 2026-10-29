"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { ArrowRight, Ban, FlaskConical, Pause, PhoneCall, Play, Sparkles, Star, type LucideIcon } from "lucide-react";
import { MarketBadge } from "@/components/MarketBadge";
import { SmartSearch } from "@/components/SmartSearch";
import { useRegion } from "@/components/providers/RegionProvider";
import { Aurora, PillTabs, RevealText, SpotlightCard } from "@/components/ui/fx";
import {
  buildDiagnosticResult,
  listSurfaces,
  resolveSelection,
  type DiagnosticSelection,
} from "@/lib/solutions/diagnostic";
import { solutionCover } from "@/lib/solutions/covers";
import { SURFACE_LABELS } from "@/lib/solutions/meta";
import { pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PriceEstimate, Solution, SolutionSurface } from "@/lib/types";

interface HomeHeroProps {
  solutions: Solution[];
  estimates: PriceEstimate[];
}

const CAPSULE_INTERVAL_MS = 7000;
const CAPSULE_THUMB_COUNT = 4;

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
 * Собирает 4 протокола для капсулы переключения (Epic Games / Steam Featured Capsule):
 * сначала протоколы выбранной поверхности, затем добирает популярные с других поверхностей.
 */
function pickCapsuleDeck(solutions: Solution[], activeSurface: SolutionSurface | null): Solution[] {
  const published = solutions.filter((s) => s.status === "published");
  if (published.length === 0) return [];
  const primary = activeSurface ? published.filter((s) => s.surface === activeSurface) : [];
  const rest = published.filter((s) => s.surface !== activeSurface);
  return [...primary, ...rest].slice(0, CAPSULE_THUMB_COUNT);
}

/**
 * Hero главной в стиле Epic Games + Steam Featured Capsule:
 * слева — заголовок, SmartSearch с экспресс-триажем ИИ-технолога и 3 принципа платформы;
 * справа — интерактивная капсула протоколов с HUD-индикатором поверхности, честной сметой выезда
 * и 4 карточками-переключателями протоколов с 7-секундным авто-таймером прогресса.
 */
export function HomeHero({ solutions, estimates }: HomeHeroProps) {
  const reduce = usePrefersReducedMotion();
  const { market, city } = useRegion();
  const [selection, setSelection] = useState<DiagnosticSelection>({});
  const [paused, setPaused] = useState(false);
  const [tickKey, setTickKey] = useState(0);

  const ctx = useMemo(() => ({ countryCode: market.countryCode, city: city.name }), [market, city]);
  const resolved = resolveSelection(solutions, selection);
  const surfaces = listSurfaces(solutions);

  const deck = useMemo(
    () => pickCapsuleDeck(solutions, resolved.surface),
    [solutions, resolved.surface]
  );

  const activeSolution = useMemo(() => {
    if (selection.variant) {
      const explicit = deck.find((s) => s.slug === selection.variant) ?? solutions.find((s) => s.slug === selection.variant);
      if (explicit) return explicit;
    }
    return resolved.solution ?? deck[0] ?? null;
  }, [deck, resolved.solution, selection.variant, solutions]);

  const activeDeckIndex = useMemo(() => {
    if (!activeSolution || deck.length === 0) return 0;
    const idx = deck.findIndex((s) => s.slug === activeSolution.slug);
    return idx >= 0 ? idx : 0;
  }, [activeSolution, deck]);

  // Авто-таймер переключения капсулы каждые 7 секунд (пауза при hover/focus и при reduced-motion)
  useEffect(() => {
    if (reduce || paused || deck.length <= 1) return;
    const timer = window.setTimeout(() => {
      const next = deck[(activeDeckIndex + 1) % deck.length];
      if (next) {
        setSelection((prev) => ({
          ...prev,
          variant: next.slug,
        }));
        setTickKey((k) => k + 1);
      }
    }, CAPSULE_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [activeDeckIndex, deck, paused, reduce, tickKey]);

  const result = activeSolution ? buildDiagnosticResult(activeSolution, estimates, 2, ctx) : null;
  const cover = activeSolution ? solutionCover(activeSolution) : "/covers/uborka-ofisa-posle-korporativa.jpg";

  function handleSelectCapsuleItem(item: Solution) {
    setSelection((prev) => ({
      ...prev,
      variant: item.slug,
    }));
    setTickKey((k) => k + 1);
  }

  function handleSurfaceChange(surfaceId: SolutionSurface) {
    setSelection({ surface: surfaceId });
    setTickKey((k) => k + 1);
  }

  return (
    <section className="relative isolate overflow-hidden">
      <Aurora />
      <div className="container grid gap-10 pb-14 pt-10 sm:pt-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12 lg:pt-16">
        <div className="min-w-0 self-center">
          <MarketBadge />
          <RevealText
            className="mt-6 text-balance font-display text-4xl font-bold leading-[1.05] tracking-[-0.035em] text-foreground sm:text-5xl lg:text-[3.4rem]"
            parts={[{ text: "Найдите подходящий способ" }, { text: "решить задачу чистоты", accent: true }]}
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

        {/* Правая капсула в стиле Epic Games / Steam Featured Showcase */}
        <div
          className="min-w-0"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <SpotlightCard className="min-h-[390px] sm:min-h-[440px]">
            <AnimatePresence initial={false}>
              <motion.div
                key={cover}
                initial={reduce ? false : { opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.45 }}
                className="absolute inset-0 -z-10"
              >
                {/* Одна тематическая обложка протокола — иллюстрация, не «доказательство результата» */}
                <Image
                  src={cover}
                  alt=""
                  fill
                  priority
                  sizes="(min-width: 1024px) 640px, 100vw"
                  className="object-cover"
                />
                <div aria-hidden className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-t from-black/92 via-black/50 to-black/15" />
              </motion.div>
            </AnimatePresence>

            <div className="pointer-events-none relative flex min-h-[390px] flex-col justify-between gap-4 p-5 text-white sm:min-h-[440px] sm:p-6">
              {/* Верхний HUD-индикатор химии + кнопка паузы авто-ротации */}
              {activeSolution && result ? (
                <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/65 px-3 py-1 font-data text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm ring-1 ring-inset ring-white/15">
                      <FlaskConical className="size-3.5 text-brand" aria-hidden />
                      {SURFACE_LABELS[activeSolution.surface]}
                    </span>
                    <span className="rounded-full bg-black/65 px-2.5 py-1 font-data text-[11px] font-semibold uppercase tracking-wider text-white/90 backdrop-blur-sm ring-1 ring-inset ring-white/15">
                      ИНСТРУКЦИЯ · {pluralize(result.totalSteps, ["шаг", "шага", "шагов"])}
                    </span>
                  </div>

                  {/* Честный ориентир сметы мастера по региону — без неверифицированной «экономии» */}
                  <div className="flex items-center gap-1.5">
                    {result.estimate && (
                      <span className="inline-flex items-center gap-1.5 rounded-control bg-success px-2.5 py-1 font-data text-xs font-bold tabular-nums text-white shadow-sm">
                        Выезд мастера: {result.estimate.min}–{result.estimate.max}
                        {result.estimate.unit ? ` ${result.estimate.unit}` : ""}
                      </span>
                    )}
                    {!reduce && deck.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setPaused((p) => !p)}
                        aria-label={paused ? "Возобновить авто-показ протоколов" : "Поставить авто-показ на паузу"}
                        className="inline-flex size-8 items-center justify-center rounded-full bg-black/60 text-white/80 backdrop-blur-sm ring-1 ring-inset ring-white/15 transition-colors hover:bg-black/80 hover:text-white"
                      >
                        {paused ? <Play className="size-3.5" aria-hidden /> : <Pause className="size-3.5" aria-hidden />}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <span />
              )}

              {/* Нижний контент капсулы */}
              {result && activeSolution ? (
                <motion.div
                  key={result.slug}
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 220, damping: 24 }}
                  className="pointer-events-auto space-y-3.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-data text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
                      Протокол #{String(activeDeckIndex + 1).padStart(2, "0")}
                    </span>
                    {activeSolution.material && (
                      <span className="text-xs text-white/70">· {activeSolution.material}</span>
                    )}
                  </div>
                  <h2 className="max-w-lg text-balance font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                    {result.title}
                  </h2>
                  {result.warnings[0] && (
                    <p className="flex max-w-lg items-start gap-2 rounded-control bg-black/55 p-3 text-[13px] leading-snug backdrop-blur-sm ring-1 ring-inset ring-white/10">
                      <Ban className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                      <span>
                        <span className="font-semibold text-brand">Не делайте: </span>
                        {result.warnings[0]}
                      </span>
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 pt-0.5">
                    <Link
                      href={result.href}
                      className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-brand-foreground shadow-sm shadow-brand/30 transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
                    >
                      Открыть протокол
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                    <Link
                      href={`/assistant?q=${encodeURIComponent(result.title)}`}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-black/55 px-4 text-xs font-semibold text-white backdrop-blur-sm ring-1 ring-inset ring-white/20 transition-colors hover:bg-black/75"
                    >
                      <Sparkles className="size-3.5 text-brand" aria-hidden />
                      Спросить ИИ-технолога
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <p className="text-sm text-white/80">Опубликованных протоколов пока нет.</p>
              )}
            </div>
          </SpotlightCard>

          {/* 4 мини-превью протоколов с авто-таймером прогресса в стиле Epic Games Store / Steam */}
          {deck.length > 1 && (
            <div
              role="tablist"
              aria-label="Быстрое переключение протоколов витрины"
              className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4"
            >
              {deck.map((item, idx) => {
                const isActive = activeSolution?.slug === item.slug;
                return (
                  <button
                    key={item.slug}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleSelectCapsuleItem(item)}
                    className={cn(
                      "data-surface group relative flex items-center gap-2.5 overflow-hidden rounded-control p-2 text-left transition-colors",
                      isActive
                        ? "border-primary/50 bg-card shadow-sm"
                        : "bg-card/65 opacity-80 hover:opacity-100 hover:border-primary/30"
                    )}
                  >
                    <span className="relative size-11 shrink-0 overflow-hidden rounded-[8px] bg-muted">
                      <Image
                        src={solutionCover(item)}
                        alt=""
                        fill
                        sizes="44px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-data text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {SURFACE_LABELS[item.surface]}
                      </span>
                      <span className="mt-0.5 line-clamp-2 text-xs font-semibold leading-tight text-foreground">
                        {item.title}
                      </span>
                    </span>

                    {/* Полоска авто-таймера 7 секунд (как в Epic Games / Steam) */}
                    {isActive && !reduce && (
                      <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-border/60">
                        <motion.span
                          key={`${item.slug}-${tickKey}-${paused ? "paused" : "run"}`}
                          initial={{ width: "0%" }}
                          animate={{ width: paused ? "0%" : "100%" }}
                          transition={{
                            duration: paused ? 0 : CAPSULE_INTERVAL_MS / 1000,
                            ease: "linear",
                          }}
                          className="block h-full bg-brand"
                        />
                      </span>
                    )}
                    {isActive && reduce && (
                      <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-brand" />
                    )}
                    <span className="sr-only">Протокол {idx + 1}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-3">
            <PillTabs
              label="Поверхность"
              options={surfaces.map((s) => ({ id: s.id, label: s.label, meta: String(s.count) }))}
              value={resolved.surface}
              onChange={(id) => handleSurfaceChange(id as SolutionSurface)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
