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
  Play,
  Star,
  X,
} from "lucide-react";
import { useRegion } from "@/components/providers/RegionProvider";
import { trackEvent } from "@/lib/analytics";
import { formatMarketCurrency, pluralize } from "@/lib/format";
import { displayPrice, type ShelfProduct } from "@/lib/products/zone-shelf";
import { solutionCover } from "@/lib/solutions/covers";
import { howToTitle } from "@/lib/solutions/meta";
import { parseVideoSource } from "@/lib/solutions/video";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { cn } from "@/lib/utils";
import type { CurrencyCode } from "@/lib/markets";
import type { Solution } from "@/lib/types";

const CARD_LIMIT = 5;
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
 * «Видеолаборатория»: вертикальные карточки 9:16 с разборами протоколов.
 * По клику — сторис-плеер 9:16 в модалке: таймлайн «Не делайте» → шаги →
 * карточка протестированного средства с кнопкой покупки. Если у протокола есть
 * videoUrl, вместо слайдов встраивается сам ролик (YouTube/VK/Rutube/mp4).
 */
export function VideoLabSection({ solutions, products }: { solutions: Solution[]; products: ShelfProduct[] }) {
  const { market } = useRegion();
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const items = useMemo(() => solutions.filter((s) => s.status === "published").slice(0, CARD_LIMIT), [solutions]);
  const active = items.find((s) => s.slug === openSlug) ?? null;
  const testedProduct = active ? products.find((p) => p.solutionSlug === active.slug) : undefined;

  if (items.length === 0) return null;

  return (
    <section id="videolab" aria-labelledby="videolab-title" className="container scroll-mt-24 py-12 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-data text-[11px] font-bold uppercase tracking-[0.16em] text-teal">ChistoLab / Video</p>
          <h2 id="videolab-title" className="mt-2 max-w-xl text-balance font-display text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl">
            Видеолаборатория: разборы протоколов
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Короткие разборы: реальное пятно, реальное средство, честный результат.
          </p>
        </div>
        <Link href="/solutions" className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal hover:underline">
          Все протоколы
          <ArrowUpRight className="size-4" aria-hidden />
        </Link>
      </div>

      <ul className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((solution) => {
          const product = products.find((p) => p.solutionSlug === solution.slug);
          const price = product?.price !== undefined ? displayPrice(product.price, market.currency) : null;
          return (
            <li key={solution.id}>
              <button
                type="button"
                onClick={() => setOpenSlug(solution.slug)}
                className="group flex w-full flex-col overflow-hidden rounded-panel border border-border bg-card text-left transition-shadow hover:shadow-lg"
                aria-label={`Открыть разбор: ${howToTitle(solution)}`}
              >
                <span className="relative block aspect-[9/16] w-full bg-ink">
                  <Image
                    src={solutionCover(solution)}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 240px, (min-width: 640px) 33vw, 50vw"
                    className="object-cover opacity-85 transition-transform duration-500 group-hover:scale-105"
                  />
                  <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />

                  <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-[6px] bg-ink/80 px-2 py-1 font-data text-[10px] font-bold text-white">
                    <Play className="size-3 fill-white" aria-hidden />
                    {solution.videoUrl ? "Видео" : `Разбор · ${pluralize(solution.diySteps.length, ["шаг", "шага", "шагов"])}`}
                  </span>
                  {!solution.videoUrl && (
                    <span className="absolute right-2.5 top-2.5 rounded-[6px] bg-ink/80 px-2 py-1 font-data text-[10px] font-bold text-white">
                      Видео скоро
                    </span>
                  )}

                  <span className="absolute bottom-3 right-3 grid size-11 place-items-center rounded-full bg-lime text-ink shadow-lg transition-transform group-hover:scale-110">
                    <Play className="size-4 fill-ink" aria-hidden />
                  </span>
                  <span className="absolute inset-x-0 bottom-0 p-3.5 pr-16 text-ink-foreground">
                    <span className="line-clamp-3 block text-[13px] font-bold leading-snug">
                      {howToTitle(solution)}
                    </span>
                  </span>
                </span>

                {/* Товарная плашка под видео — протестированное средство */}
                <span className="flex w-full items-center gap-3 border-t border-border bg-card p-3">
                  {product ? (
                    <>
                      <span className="relative size-11 shrink-0 overflow-hidden rounded-control bg-muted">
                        <Image src="/lovable/spray.jpg" alt="" fill sizes="44px" className="object-cover" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold text-foreground">{product.name}</span>
                        <span className="mt-0.5 flex items-center gap-1.5 font-data text-[11px] text-muted-foreground">
                          {product.rating !== undefined && (
                            <span className="inline-flex items-center gap-0.5 font-bold text-foreground">
                              <Star className="size-3 fill-star text-star" aria-hidden />
                              {product.rating.toFixed(1)}
                            </span>
                          )}
                          {price && <span>{formatMarketCurrency(price.value, market.currency)}</span>}
                        </span>
                      </span>
                      <span className="shrink-0 rounded-control bg-ink px-2.5 py-1.5 text-[11px] font-semibold text-ink-foreground">
                        Смотреть
                      </span>
                    </>
                  ) : (
                    <span className="flex w-full items-center justify-between gap-2">
                      <span className="font-data text-[11px] text-muted-foreground">
                        {pluralize(solution.diySteps.length, ["шаг", "шага", "шагов"])} · протокол
                      </span>
                      <span className="shrink-0 rounded-control bg-ink px-2.5 py-1.5 text-[11px] font-semibold text-ink-foreground">
                        Смотреть
                      </span>
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <StoryModal
        solution={active}
        product={testedProduct}
        currency={market.currency}
        countryCode={market.countryCode}
        onClose={() => setOpenSlug(null)}
      />
    </section>
  );
}

function StoryModal({
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
          className="grid size-9 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 text-ink-foreground transition-colors hover:bg-white/20"
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
                            metadata: { placement: "home.video_lab", solution: solution.slug },
                          })
                        }
                        className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-xs font-semibold text-ink-foreground"
                      >
                        Где купить
                        <ArrowUpRight className="size-3.5" aria-hidden />
                      </a>
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
            className="inline-flex min-h-10 items-center gap-1 rounded-full border border-white/15 px-4 text-xs font-semibold text-ink-foreground transition-colors hover:bg-white/10"
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
          className="text-xs font-semibold text-lime hover:underline"
        >
          Весь протокол →
        </Link>
        {!videoSource ? (
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % slides.length)}
            className="inline-flex min-h-10 items-center gap-1 rounded-full bg-lime px-4 text-xs font-semibold text-ink transition-transform active:scale-[0.98]"
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
