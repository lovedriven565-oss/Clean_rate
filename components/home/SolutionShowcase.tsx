"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { ArrowRight, Ban, PlayCircle, Wrench } from "lucide-react";
import { PillTabs } from "@/components/ui/fx";
import { useRegion } from "@/components/providers/RegionProvider";
import { Collections } from "@/components/home/Collections";
import { solutionCover } from "@/lib/solutions/covers";
import { buildTaskShelves } from "@/lib/solutions/shelves";
import { parseVideoSource } from "@/lib/solutions/video";
import { formatEstimate, pickEstimate, type DiagnosticContext } from "@/lib/solutions/diagnostic";
import { SURFACE_LABELS } from "@/lib/solutions/meta";
import { pluralize } from "@/lib/format";
import { cn, scrollBehavior } from "@/lib/utils";
import type { PriceEstimate, Solution } from "@/lib/types";

const ALL_TAB = "all";

function scrollToPros(e: React.MouseEvent<HTMLAnchorElement>) {
  e.preventDefault();
  document.getElementById("pros")?.scrollIntoView({ behavior: scrollBehavior() });
}

/**
 * Детальная панель задачи (общая для sticky-колонки на десктопе
 * и inline-раскрытия под строкой на мобильном): обложка или проверенное
 * видео, теги, «Не делайте», шаги инструкции и два пути.
 */
function DetailPanel({
  solution,
  estimates,
  ctx,
}: {
  solution: Solution;
  estimates: PriceEstimate[];
  ctx: DiagnosticContext;
}) {
  const videoSource = parseVideoSource(solution.videoUrl);
  const estimate = pickEstimate(estimates, solution, ctx);
  const view = estimate ? formatEstimate(estimate, ctx) : null;
  const steps = [...solution.diySteps].sort((a, b) => a.order - b.order);

  return (
    <div className="data-surface overflow-hidden rounded-panel">
      {videoSource ? (
        <div className="relative aspect-video w-full overflow-hidden bg-cta">
          {videoSource.kind === "iframe" ? (
            <iframe
              src={videoSource.embedUrl}
              title={`Видео-разбор: ${solution.title}`}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          ) : (
            <video
              src={videoSource.url}
              muted
              playsInline
              controls
              preload="metadata"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </div>
      ) : (
        <div className="relative h-40 overflow-hidden sm:h-48">
          <Image
            src={solutionCover(solution)}
            alt=""
            fill
            sizes="(min-width: 1024px) 560px, 100vw"
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"
          />
          <h3 className="absolute inset-x-4 bottom-3 text-balance font-display text-lg font-bold tracking-tight text-white sm:text-xl">
            {solution.title}
          </h3>
        </div>
      )}

      <div className="grid gap-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-foreground/80">
            {SURFACE_LABELS[solution.surface]}
          </span>
          {solution.material && (
            <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-foreground/80">
              {solution.material}
            </span>
          )}
          <span className="rounded-full bg-muted px-2.5 py-1 font-data text-[11px] font-semibold text-foreground/80">
            {pluralize(steps.length, ["шаг", "шага", "шагов"])}
          </span>
          {videoSource && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-link">
              <PlayCircle className="size-3.5" aria-hidden />
              Видео
            </span>
          )}
        </div>

        {solution.warnings[0] && (
          <p className="flex items-start gap-2 rounded-control bg-danger/10 p-3 text-[13px] leading-snug text-foreground ring-1 ring-inset ring-danger/25">
            <Ban className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
            <span>
              <span className="font-semibold text-danger">Не делайте: </span>
              {solution.warnings[0]}
            </span>
          </p>
        )}

        <ol className="grid gap-2">
          {steps.map((step) => (
            <li
              key={step.order}
              className="grid grid-cols-[1.5rem_1fr] items-start gap-2.5 text-sm leading-relaxed text-foreground"
            >
              <span className="mt-0.5 grid size-6 place-items-center rounded-full bg-primary/10 font-data text-[11px] font-bold text-link">
                {step.order}
              </span>
              <span>{step.instruction}</span>
            </li>
          ))}
        </ol>

        <p className="text-xs text-muted-foreground">
          {view
            ? `Выезд мастера, ориентир: ${view.min}–${view.max}${view.unit ? ` ${view.unit}` : ""} · ${view.city}`
            : "Стоимость выезда мастера уточняйте у компаний вашего города."}
        </p>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href={`/solutions/${solution.slug}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-brand-foreground transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
          >
            Открыть решение
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <a
            href="#pros"
            onClick={scrollToPros}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-link"
          >
            <Wrench className="size-4" aria-hidden />
            Показать мастеров
          </a>
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          Нет данных о вашей поверхности? Проверьте средство на скрытом участке и сверьтесь с инструкцией производителя.
        </p>
      </div>
    </div>
  );
}

/**
 * Витрина решений (мастер-деталь как в прототипе home-v3):
 * слева — категории и компактный список задач, справа — sticky-панель выбранной задачи.
 * Клик и клавиатура выбирают задачу; наведение на десктопе — временное превью,
 * не отменяющее явный выбор. На мобильном ответ раскрывается под выбранной строкой.
 */
export function SolutionShowcase({
  solutions,
  estimates,
}: {
  solutions: Solution[];
  estimates: PriceEstimate[];
}) {
  const reduce = usePrefersReducedMotion();
  const { market, city } = useRegion();
  const ctx = useMemo(() => ({ countryCode: market.countryCode, city: city.name }), [market, city]);

  const published = useMemo(() => solutions.filter((s) => s.status === "published"), [solutions]);
  const shelves = useMemo(() => buildTaskShelves(solutions), [solutions]);
  const [tab, setTab] = useState(ALL_TAB);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [hoverSlug, setHoverSlug] = useState<string | null>(null);
  // После программного скролла (подборка) страница проезжает под неподвижным курсором
  // и строка ловит mouseenter — это не намеренное наведение, превью подавляем до
  // следующего реального движения мыши.
  const hoverSuppressed = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const activeShelf = shelves.find((s) => s.id === tab) ?? null;
  const filteredList = useMemo(() => {
    if (!activeShelf) return published;
    return published.filter((s) => activeShelf.slugs.includes(s.slug));
  }, [published, activeShelf]);

  const selected = useMemo(() => {
    const found = selectedSlug ? filteredList.find((s) => s.slug === selectedSlug) : undefined;
    return found ?? filteredList[0] ?? null;
  }, [filteredList, selectedSlug]);

  /** Превью по наведению — только для панели, явный выбор (selected) не трогает. */
  const displayed = useMemo(() => {
    const hovered = hoverSlug ? filteredList.find((s) => s.slug === hoverSlug) : undefined;
    return hovered ?? selected;
  }, [hoverSlug, filteredList, selected]);

  if (!selected || !displayed) return null;

  function select(slug: string) {
    setSelectedSlug(slug);
    setHoverSlug(null);
  }

  /** Выбор задачи из подборки: сбрасывает фильтр категории, если задача вне её, и подскролливает к строке. */
  function pickFromCollection(slug: string) {
    if (!published.some((s) => s.slug === slug)) return;
    if (activeShelf && !activeShelf.slugs.includes(slug)) setTab(ALL_TAB);
    select(slug);
    hoverSuppressed.current = true;
    window.setTimeout(() => {
      const row = listRef.current?.querySelector(`[data-sol="${slug}"]`);
      (row ?? sectionRef.current)?.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
    }, 60);
  }

  function onListKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const rows = listRef.current?.querySelectorAll<HTMLButtonElement>("button[data-sol]");
    if (!rows?.length) return;
    const index = [...rows].indexOf(document.activeElement as HTMLButtonElement);
    if (index < 0) return;
    e.preventDefault();
    rows[index + (e.key === "ArrowDown" ? 1 : -1)]?.focus();
  }

  return (
    <section id="shelf" ref={sectionRef} aria-labelledby="shelf-title" className="scroll-mt-24">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-data text-xs font-semibold uppercase tracking-[0.16em] text-link">
            Витрина решений
          </p>
          <h2
            id="shelf-title"
            className="mt-1.5 text-balance font-display text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl"
          >
            Выберите задачу — ответ справа
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Список работает по клику и клавиатуре; на десктопе достаточно наведения. На телефоне ответ раскрывается под выбранной строкой.
          </p>
        </div>
        <Link
          href="/solutions"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-link hover:underline"
        >
          Все решения
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <PillTabs
        label="Категория задач"
        options={[
          { id: ALL_TAB, label: "Все", meta: String(published.length) },
          ...shelves.map((s) => ({ id: s.id, label: s.title, meta: String(s.count) })),
        ]}
        value={tab}
        onChange={setTab}
        className="mb-5"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        {/* Компактный список задач */}
        <div
          ref={listRef}
          role="group"
          aria-label="Список задач"
          className="flex min-w-0 flex-col gap-2"
          onMouseLeave={() => setHoverSlug(null)}
          onMouseMove={() => {
            hoverSuppressed.current = false;
          }}
          onKeyDown={onListKeyDown}
        >
          {filteredList.map((item) => {
            const isSelected = item.slug === selected.slug;
            const isDisplayed = item.slug === displayed.slug;
            const est = pickEstimate(estimates, item, ctx);
            const estView = est ? formatEstimate(est, ctx) : null;

            return (
              <div key={item.id} className="scroll-mt-28">
                <button
                  type="button"
                  data-sol={item.slug}
                  aria-pressed={isSelected}
                  aria-expanded={isSelected}
                  aria-controls={`exp-${item.slug}`}
                  onClick={() => select(item.slug)}
                  onMouseEnter={() => {
                    if (!hoverSuppressed.current) setHoverSlug(item.slug);
                  }}
                  className={cn(
                    "data-surface group relative flex w-full items-center gap-3.5 rounded-panel p-2.5 text-left transition-all",
                    isSelected
                      ? "border-primary/55 bg-card shadow-[0_14px_32px_-18px_hsl(var(--brand)/0.45)] ring-1 ring-inset ring-primary/25"
                      : isDisplayed
                        ? "border-primary/35 bg-card"
                        : "bg-card/70 hover:border-primary/30 hover:bg-card",
                  )}
                >
                  <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-control bg-muted">
                    <Image
                      src={solutionCover(item)}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-foreground group-hover:text-link">
                      {item.title}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-foreground/80">
                        {SURFACE_LABELS[item.surface]}
                      </span>
                      {item.material && <span>{item.material}</span>}
                      <span className="font-data">
                        · {pluralize(item.diySteps.length, ["шаг", "шага", "шагов"])}
                      </span>
                    </span>
                  </span>
                  {estView ? (
                    <span className="shrink-0 rounded-[6px] bg-success/15 px-2.5 py-1 font-data text-xs font-bold tabular-nums text-success">
                      {estView.min}–{estView.max}
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-[6px] bg-muted px-2 py-1 font-data text-[11px] font-semibold text-muted-foreground">
                      DIY
                    </span>
                  )}
                </button>
                {/* Inline-раскрытие под строкой — только на мобильном */}
                <div id={`exp-${item.slug}`} hidden={!isSelected} className="lg:hidden">
                  {isSelected && (
                    <div className="mt-2">
                      <DetailPanel solution={item} estimates={estimates} ctx={ctx} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sticky-панель выбранной задачи — только десктоп */}
        <motion.aside
          key={displayed.slug}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.3 }}
          className="sticky top-24 hidden min-w-0 lg:block"
        >
          <DetailPanel solution={displayed} estimates={estimates} ctx={ctx} />
        </motion.aside>
      </div>

      <Collections shelves={shelves} solutions={published} onPick={pickFromCollection} />
    </section>
  );
}
