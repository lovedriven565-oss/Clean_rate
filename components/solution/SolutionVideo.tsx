"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import {
  ArrowUpRight,
  Ban,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Pause,
  Play,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { SURFACE_LABELS } from "@/lib/solutions/meta";
import { parseVideoSource } from "@/lib/solutions/video";
import type { Brand, Solution } from "@/lib/types";
import { cn } from "@/lib/utils";

type StorySlide =
  | {
      id: string;
      kind: "warning";
      label: string;
      warning: string;
      extraCount: number;
    }
  | {
      id: string;
      kind: "step";
      label: string;
      order: number;
      totalSteps: number;
      instruction: string;
      tip?: string;
    }
  | {
      id: string;
      kind: "products";
      label: string;
      surfaceLabel: string;
      material?: string;
      items: {
        key: string;
        name: string;
        roleLabel: string;
        brandName?: string;
        brandSlug?: string;
      }[];
    };

const SLIDE_DURATION_MS = 8000;

/**
 * Видеоразбор протокола в «Пути 1»:
 * - если заполнен `solution.videoUrl`, рендерится встроенный плеер (YouTube Shorts / VK / Rutube / MP4);
 * - если внешнего ролика нет, работает интерактивный Сторис-разбор протокола на motion/react
 *   (Кадр 1: «Стоп-ошибка» → Кадры шагов с советом → Финал: безопасные средства и бренды).
 */
export function SolutionVideo({
  solution,
  brands = [],
  videoUrl,
  title,
}: {
  solution?: Solution;
  brands?: Brand[];
  videoUrl?: string;
  title?: string;
}) {
  const effectiveUrl = videoUrl ?? solution?.videoUrl;
  const effectiveTitle = title ?? solution?.title ?? "Протокол чистоты";
  const source = parseVideoSource(effectiveUrl);

  if (source) {
    return (
      <figure className="mt-6">
        <figcaption className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Play className="h-3.5 w-3.5 text-primary" />
          Видеоразбор протокола
        </figcaption>
        <div
          className={cn(
            "data-surface relative overflow-hidden rounded-panel",
            source.kind === "iframe" && source.vertical
              ? "mx-auto aspect-[9/16] w-full max-w-[320px]"
              : "aspect-video w-full"
          )}
        >
          {source.kind === "iframe" ? (
            <iframe
              src={source.embedUrl}
              title={`Видеоразбор: ${effectiveTitle}`}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          ) : (
            <video
              src={source.url}
              controls
              preload="metadata"
              className="absolute inset-0 h-full w-full object-cover"
            >
              Ваш браузер не поддерживает воспроизведение видео.
            </video>
          )}
        </div>
      </figure>
    );
  }

  if (!solution) return null;

  return <ProtocolStoryPlayer solution={solution} brands={brands} />;
}

function ProtocolStoryPlayer({ solution, brands }: { solution: Solution; brands: Brand[] }) {
  const reduce = usePrefersReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const slides = useMemo<StorySlide[]>(() => {
    const list: StorySlide[] = [];

    if (solution.warnings.length > 0) {
      list.push({
        id: "warning",
        kind: "warning",
        label: "Стоп-ошибка",
        warning: solution.warnings[0],
        extraCount: Math.max(0, solution.warnings.length - 1),
      });
    }

    for (const step of solution.diySteps) {
      list.push({
        id: `step-${step.order}`,
        kind: "step",
        label: `Шаг ${step.order} из ${solution.diySteps.length}`,
        order: step.order,
        totalSteps: solution.diySteps.length,
        instruction: step.instruction,
        tip: step.tip,
      });
    }

    const products = solution.recommendedProducts ?? [];
    if (products.length > 0) {
      const brandBySlugOrId = (id?: string) => brands.find((b) => b.id === id || b.slug === id);
      list.push({
        id: "products",
        kind: "products",
        label: "Средства из инструкции",
        surfaceLabel: SURFACE_LABELS[solution.surface],
        material: solution.material,
        items: products.slice(0, 3).map((p, idx) => {
          const brand = brandBySlugOrId(p.brandId);
          return {
            key: p.id ?? `${p.brandId ?? "item"}-${idx}`,
            name: p.note ?? p.productName ?? brand?.name ?? "Профессиональное средство",
            roleLabel: p.role === "recommended" ? "Основной состав" : "Альтернатива",
            brandName: brand?.name ?? p.brandName,
            brandSlug: brand?.slug,
          };
        }),
      });
    }

    return list;
  }, [solution, brands]);

  const safeIndex = slides.length > 0 ? Math.min(activeIndex, slides.length - 1) : 0;
  const current = slides[safeIndex];

  useEffect(() => {
    if (reduce || paused || slides.length <= 1) return;
    const timer = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, SLIDE_DURATION_MS);
    return () => clearTimeout(timer);
  }, [safeIndex, paused, reduce, slides.length]);

  if (!current) return null;

  function goPrev() {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }

  function goNext() {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  }

  function pauseUnlessToggle(event: { target: EventTarget }) {
    if (event.target instanceof Element && event.target.closest("[data-pause-toggle]")) return;
    setPaused(true);
  }

  const surfaceTarget = solution.material ?? SURFACE_LABELS[solution.surface].toLowerCase();

  return (
    <figure
      className="no-print mt-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onPointerDown={pauseUnlessToggle}
      onFocusCapture={pauseUnlessToggle}
    >
      <figcaption className="mb-3 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Интерактивный разбор протокола
        </span>
        <span className="font-data text-xs font-medium text-muted-foreground">
          Кадр {safeIndex + 1} / {slides.length}
        </span>
      </figcaption>

      <div className="data-surface relative overflow-hidden rounded-panel p-5 text-foreground sm:p-6">
        {/* Сегментированный прогресс-бар сторис */}
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Кадры разбора протокола">
          {slides.map((slide, idx) => {
            const isActive = idx === safeIndex;
            const isPassed = idx < safeIndex;
            return (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`${slide.label} (кадр ${idx + 1} из ${slides.length})`}
                onClick={() => setActiveIndex(idx)}
                className="group relative flex h-6 flex-1 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
              >
                <span className="relative block h-1.5 w-full overflow-hidden rounded-full bg-muted">
                {isPassed && <span className="block h-full w-full rounded-full bg-primary" />}
                {isActive && (
                  <motion.span
                    key={`${slide.id}-${paused ? "paused" : "play"}`}
                    initial={{ width: reduce ? "100%" : "0%" }}
                    animate={{ width: "100%" }}
                    transition={
                      reduce || paused
                        ? { duration: 0 }
                        : { duration: SLIDE_DURATION_MS / 1000, ease: "linear" }
                    }
                    className="block h-full rounded-full bg-primary"
                  />
                )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Шапка текущего слайда + управление паузой */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {current.kind === "warning" && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-danger/25 bg-danger/10 px-2.5 py-1 text-xs font-semibold text-danger">
                <Ban className="h-3.5 w-3.5" />
                {current.label}
              </span>
            )}
            {current.kind === "step" && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 font-data text-xs font-semibold text-primary">
                {current.label}
              </span>
            )}
            {current.kind === "products" && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-star/30 bg-star/15 px-2.5 py-1 text-xs font-semibold text-star">
                <ShieldCheck className="h-3.5 w-3.5" />
                Материал: {surfaceTarget} · проверьте инструкцию
              </span>
            )}
          </div>

          <button
            type="button"
            data-pause-toggle
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Продолжить автопоказ" : "Пауза"}
            className="inline-flex h-10 min-h-10 items-center gap-1.5 rounded-full border border-border bg-background px-4 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-[0.98]"
          >
            {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            <span>{paused ? "Старт" : "Пауза"}</span>
          </button>
        </div>

        {/* Контент слайда */}
        <div className="relative min-h-[190px] py-4 sm:min-h-[175px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current.id}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ type: "spring", stiffness: 240, damping: 26 }}
            >
              {current.kind === "warning" && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Главное правило перед началом
                  </p>
                  <p className="font-display text-lg font-bold leading-snug text-foreground sm:text-xl">
                    {current.warning}
                  </p>
                  {current.extraCount > 0 && (
                    <p className="text-xs text-muted-foreground">
                      В протоколе ещё {current.extraCount}{" "}
                      {current.extraCount === 1 ? "важное ограничение" : "важных ограничения"} для сохранения покрытия.
                    </p>
                  )}
                </div>
              )}

              {current.kind === "step" && (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-data text-xs font-bold text-primary-foreground">
                      {String(current.order).padStart(2, "0")}
                    </span>
                    <p className="text-[15px] font-medium leading-relaxed text-foreground sm:text-base">
                      {current.instruction}
                    </p>
                  </div>
                  {current.tip && (
                    <div className="flex items-start gap-2 rounded-control bg-muted/60 p-3 text-xs leading-5 text-foreground">
                      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-star" />
                      <span>{current.tip}</span>
                    </div>
                  )}
                </div>
              )}

              {current.kind === "products" && (
                <div className="space-y-2.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    Составы, которые выводят загрязнение и не портят покрытие ({current.surfaceLabel.toLowerCase()}):
                  </p>
                  <ul className="space-y-2">
                    {current.items.map((item) => (
                      <li
                        key={item.key}
                        className="flex items-center justify-between gap-3 rounded-control border border-border bg-background px-3.5 py-2.5"
                      >
                        <div className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-foreground">{item.name}</span>
                          <span className="block text-xs text-muted-foreground">
                            {item.roleLabel}
                            {item.brandName ? ` · ${item.brandName}` : ""}
                          </span>
                        </div>
                        {item.brandSlug && (
                          <Link
                            href={`/brands/${item.brandSlug}`}
                            className="inline-flex h-10 min-h-10 shrink-0 items-center gap-1 rounded-full border border-border px-3.5 text-xs font-semibold text-link transition-colors hover:bg-muted"
                          >
                            Бренд
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Нижняя панель навигации по кадрам */}
        <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
          <button
            type="button"
            onClick={goPrev}
            className="inline-flex h-10 min-h-10 items-center gap-1.5 rounded-full border border-border bg-background px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted active:scale-[0.98]"
          >
            <ChevronLeft className="h-4 w-4" />
            Назад
          </button>

          <div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            <span>Проверено для поверхности: {SURFACE_LABELS[solution.surface]}</span>
          </div>

          <button
            type="button"
            onClick={goNext}
            className="inline-flex h-10 min-h-10 items-center gap-1.5 rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98]"
          >
            {safeIndex === slides.length - 1 ? "Сначала" : "Дальше"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </figure>
  );
}
