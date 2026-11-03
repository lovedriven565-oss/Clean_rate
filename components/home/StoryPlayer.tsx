"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpRight,
  Ban,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  Lightbulb,
  X,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { formatMarketCurrency } from "@/lib/format";
import { displayPrice, type ShelfProduct } from "@/lib/products/zone-shelf";
import { solutionCover } from "@/lib/solutions/covers";
import { howToTitle } from "@/lib/solutions/meta";
import { parseVideoSource } from "@/lib/solutions/video";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { cn } from "@/lib/utils";
import type { CurrencyCode } from "@/lib/markets";
import type { Solution } from "@/lib/types";

const SLIDE_MS = 7000;

type Slide =
  | { id: string; kind: "warning"; text: string }
  | { id: string; kind: "step"; order: number; instruction: string; tip?: string }
  | { id: string; kind: "product" };

function buildSlides(solution: Solution, hasProduct: boolean): Slide[] {
  const slides: Slide[] = [];
  if (solution.warnings[0]) slides.push({ id: "warning", kind: "warning", text: solution.warnings[0] });
  for (const step of solution.diySteps) {
    slides.push({ id: `step-${step.order}`, kind: "step", order: step.order, instruction: step.instruction, tip: step.tip });
  }
  if (hasProduct) slides.push({ id: "product", kind: "product" });
  return slides;
}

/**
 * Сторис-плеер 9:16 в модалке: таймлайн «Не делайте» → шаги → карточка
 * средства с кнопкой покупки. Если у протокола есть videoUrl, вместо слайдов
 * встраивается сам ролик (YouTube/VK/Rutube/mp4). Подключается через
 * next/dynamic — не входит в первоначальный бандл страницы.
 */
export default function StoryPlayer({
  solution,
  product,
  currency,
  countryCode,
  onClose,
}: {
  solution: Solution | null;
  product: ShelfProduct | undefined;
  currency: CurrencyCode;
  countryCode: string;
  onClose: () => void;
}) {
  const reduce = usePrefersReducedMotion();

  // Блокировка скролла страницы под модалкой + закрытие по Escape.
  useEffect(() => {
    if (!solution) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [solution]);

  useEffect(() => {
    if (!solution) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [solution, onClose]);

  return (
    <AnimatePresence>
      {solution && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Разбор протокола: ${solution.title}`}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Закрыть разбор"
            onClick={onClose}
            className="absolute inset-0 bg-ink/85 backdrop-blur-sm"
          />
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="relative flex aspect-[9/16] max-h-[86dvh] w-full max-w-[calc(86dvh*9/16)] flex-col overflow-hidden rounded-panel bg-ink text-ink-foreground shadow-2xl ring-1 ring-white/10"
          >
            <StoryBody
              key={solution.slug}
              solution={solution}
              product={product}
              currency={currency}
              countryCode={countryCode}
              onClose={onClose}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Тело плеера: перемонтируется на каждый протокол (key=slug) → кадр сбрасывается без эффектов. */
function StoryBody({
  solution,
  product,
  currency,
  countryCode,
  onClose,
}: {
  solution: Solution;
  product: ShelfProduct | undefined;
  currency: CurrencyCode;
  countryCode: string;
  onClose: () => void;
}) {
  const reduce = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const slides = useMemo(() => buildSlides(solution, Boolean(product)), [solution, product]);
  const safeIndex = slides.length ? Math.min(index, slides.length - 1) : 0;
  const slide = slides[safeIndex];
  const videoSource = parseVideoSource(solution.videoUrl);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") setIndex((i) => Math.min(i + 1, slides.length - 1));
      if (event.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length]);

  useEffect(() => {
    if (videoSource || reduce || paused || slides.length <= 1) return;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => clearTimeout(timer);
  }, [videoSource, safeIndex, paused, reduce, slides.length]);

  const price = product?.price !== undefined ? displayPrice(product.price, currency) : null;

  return (
    <>
      {videoSource ? (
        <div className="relative flex-1 bg-ink">
          {videoSource.kind === "iframe" ? (
            <iframe
              src={videoSource.embedUrl}
              title={`Видеоразбор: ${solution.title}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          ) : (
            <video src={videoSource.url} controls autoPlay={!reduce} className="absolute inset-0 h-full w-full object-cover" />
          )}
        </div>
      ) : (
        <>
          <Image src={solutionCover(solution)} alt="" fill sizes="420px" className="object-cover opacity-25" />
          <span aria-hidden className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/85 to-ink" />
        </>
      )}

      {/* Таймлайн кадров 1-2-3… */}
      {!videoSource && slides.length > 0 && (
        <div className="relative z-10 flex items-center gap-1.5 px-4 pt-4" role="tablist" aria-label="Кадры разбора">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === safeIndex}
              aria-label={`Кадр ${i + 1} из ${slides.length}`}
              onClick={() => setIndex(i)}
              className="flex h-5 flex-1 items-center"
            >
              <span className="block h-1 w-full overflow-hidden rounded-full bg-white/20">
                {i < safeIndex && <span className="block h-full w-full bg-lime" />}
                {i === safeIndex && (
                  <motion.span
                    key={`${s.id}-${paused}`}
                    initial={{ width: reduce ? "100%" : "0%" }}
                    animate={{ width: "100%" }}
                    transition={reduce || paused ? { duration: 0 } : { duration: SLIDE_MS / 1000, ease: "linear" }}
                    className="block h-full bg-lime"
                  />
                )}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Шапка */}
      <div className="relative z-10 flex items-start justify-between gap-3 px-4 pt-3">
        <p className="min-w-0 flex-1 text-sm font-bold leading-snug">{howToTitle(solution)}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="grid size-11 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 text-ink-foreground transition-colors hover:bg-white/20"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      {/* Содержимое кадра */}
      {!videoSource && slide && (
        <div
          className="relative z-10 flex flex-1 flex-col justify-center px-5 py-4"
          onPointerDown={() => setPaused(true)}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={slide.id}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ type: "spring", stiffness: 240, damping: 26 }}
            >
              {slide.kind === "warning" && (
                <div className="rounded-control bg-danger-soft p-4 text-ink">
                  <p className="flex items-center gap-1.5 font-data text-[11px] font-bold uppercase tracking-[0.14em] text-danger">
                    <Ban className="size-3.5" aria-hidden />
                    Не делайте
                  </p>
                  <p className="mt-2 text-[15px] font-semibold leading-snug">{slide.text}</p>
                </div>
              )}

              {slide.kind === "step" && (
                <div>
                  <p className="flex items-center gap-2 font-data text-[11px] font-bold uppercase tracking-[0.14em] text-lime">
                    <span className="grid size-7 place-items-center rounded-full bg-lime text-ink">
                      {String(slide.order).padStart(2, "0")}
                    </span>
                    Шаг {slide.order} из {solution.diySteps.length}
                  </p>
                  <p className="mt-3 text-[15px] font-medium leading-relaxed">{slide.instruction}</p>
                  {slide.tip && (
                    <p className="mt-3 flex items-start gap-2 rounded-control bg-white/10 p-3 text-xs leading-5 text-ink-foreground/85">
                      <Lightbulb className="mt-0.5 size-4 shrink-0 text-lime" aria-hidden />
                      {slide.tip}
                    </p>
                  )}
                </div>
              )}

              {slide.kind === "product" && product && (
                <div className="rounded-control bg-card p-4 text-foreground">
                  <p className="flex items-center gap-1.5 font-data text-[11px] font-bold uppercase tracking-[0.14em] text-teal">
                    <FlaskConical className="size-3.5" aria-hidden />
                    Средство из протокола
                  </p>
                  <p className="mt-2 text-base font-bold leading-snug">{product.name}</p>
                  {product.brandName && <p className="mt-0.5 text-xs text-muted-foreground">{product.brandName}</p>}
                  {product.safetyTags.length > 0 && (
                    <p className="mt-2 flex flex-wrap gap-1.5">
                      {product.safetyTags.slice(0, 2).map((tag) => (
                        <span key={tag} className="rounded-full border border-success/25 bg-success/10 px-2 py-0.5 text-[11px] font-medium">
                          {tag}
                        </span>
                      ))}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="font-data text-lg font-bold">
                      {price ? `${price.approx ? "≈ " : ""}${formatMarketCurrency(price.value, currency)}` : "Цена у дилера"}
                    </p>
                    {product.affiliateUrl && (
                      <span className="flex flex-col items-end gap-1">
                        <a
                          href={product.affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          onClick={() =>
                            trackEvent({
                              entityType: "product",
                              entityId: product.id,
                              eventType: "website",
                              countryCode,
                              metadata: { placement: "home.video_lab", solutionId: solution.slug },
                            })
                          }
                          className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-ink px-4 text-xs font-semibold text-ink-foreground"
                        >
                          Где купить
                          <ArrowUpRight className="size-3.5" aria-hidden />
                        </a>
                        <span className="text-[10px] leading-3 text-muted-foreground/80">партнёрская ссылка</span>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Нижняя навигация */}
      <div className={cn("relative z-10 mt-auto flex items-center justify-between gap-3 border-t border-white/10 p-4", videoSource && "bg-ink")}>
        {!videoSource ? (
          <button
            type="button"
            onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
            className="inline-flex min-h-11 items-center gap-1 rounded-full border border-white/15 px-4 text-xs font-semibold text-ink-foreground transition-colors hover:bg-white/10"
          >
            <ChevronLeft className="size-4" aria-hidden />
            Назад
          </button>
        ) : (
          <span />
        )}
        <Link
          href={`/solutions/${solution.slug}`}
          onClick={onClose}
          className="inline-flex min-h-11 items-center text-xs font-semibold text-lime hover:underline"
        >
          Весь протокол →
        </Link>
        {!videoSource ? (
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % slides.length)}
            className="inline-flex min-h-11 items-center gap-1 rounded-full bg-lime px-4 text-xs font-semibold text-ink transition-transform active:scale-[0.98]"
          >
            {safeIndex === slides.length - 1 ? "Сначала" : "Дальше"}
            <ChevronRight className="size-4" aria-hidden />
          </button>
        ) : (
          <span />
        )}
      </div>
    </>
  );
}
