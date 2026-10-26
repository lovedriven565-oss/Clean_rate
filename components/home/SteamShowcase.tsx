"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  Ban,
  FlaskConical,
  Pause,
  Play,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { useRegion } from "@/components/providers/RegionProvider";
import { PillTabs } from "@/components/ui/fx";
import { buildHumanSafetyBadge, findSeedProduct } from "@/lib/ph";
import { solutionCover } from "@/lib/solutions/covers";
import { formatEstimate, pickEstimate } from "@/lib/solutions/diagnostic";
import { SURFACE_LABELS } from "@/lib/solutions/meta";
import { parseVideoSource } from "@/lib/solutions/video";
import { pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Brand, PriceEstimate, Solution } from "@/lib/types";

type ShowcaseTabId = "popular" | "stains" | "odors" | "kitchen" | "renovation";

const SHOWCASE_TABS: {
  id: ShowcaseTabId;
  label: string;
  match: (s: Solution) => boolean;
}[] = [
  {
    id: "popular",
    label: "Популярные протоколы",
    match: () => true,
  },
  {
    id: "stains",
    label: "Пятна и обивка",
    match: (s) => s.problemType === "stain" || s.surface === "upholstery" || s.surface === "carpet",
  },
  {
    id: "odors",
    label: "Запахи и матрасы",
    match: (s) => s.problemType === "odor" || s.surface === "mattress",
  },
  {
    id: "kitchen",
    label: "Кухня и санузел",
    match: (s) =>
      s.surface === "kitchen" ||
      s.surface === "bathroom" ||
      s.problemType === "scale",
  },
  {
    id: "renovation",
    label: "После ремонта",
    match: (s) => s.problemType === "postrenovation" || s.surface === "window" || s.surface === "floor",
  },
];

const DEMO_PHASES = [
  { id: "stop", code: "01", title: "Стоп-ошибка" },
  { id: "reaction", code: "02", title: "Реакция состава и pH" },
  { id: "product", code: "03", title: "Безопасное средство" },
] as const;

const PHASE_DURATION_MS = 6000;

/**
 * Двухколоночный стенд в стиле Steam с двухконтурной видео-демонстрацией средств:
 * слева — плотный Master-list протоколов с зелёными Steam-бейджами смет;
 * справа — Sticky Dual-Engine плеер (реальное видео `solution.videoUrl` или 3-фазный
 * симулятор работы химии со светофором pH `buildHumanSafetyBadge`) и 2 прямые кнопки конверсии.
 */
export function SteamShowcase({
  solutions,
  estimates,
  brands,
}: {
  solutions: Solution[];
  estimates: PriceEstimate[];
  brands: Brand[];
}) {
  const reduce = useReducedMotion() ?? false;
  const { market, city } = useRegion();
  const ctx = useMemo(() => ({ countryCode: market.countryCode, city: city.name }), [market, city]);

  const published = useMemo(() => solutions.filter((s) => s.status === "published"), [solutions]);
  const [tab, setTab] = useState<ShowcaseTabId>("popular");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const tabOptions = useMemo(
    () =>
      SHOWCASE_TABS.map((t) => ({
        id: t.id,
        label: t.label,
        meta: String(t.id === "popular" ? Math.min(6, published.length) : published.filter(t.match).length),
      })),
    [published]
  );

  const filteredList = useMemo(() => {
    const activeTab = SHOWCASE_TABS.find((t) => t.id === tab) ?? SHOWCASE_TABS[0];
    const matched = published.filter(activeTab.match);
    return (matched.length > 0 ? matched : published).slice(0, 6);
  }, [published, tab]);

  const selected = useMemo(() => {
    if (selectedSlug) {
      const found = filteredList.find((s) => s.slug === selectedSlug);
      if (found) return found;
    }
    return filteredList[0] ?? null;
  }, [filteredList, selectedSlug]);

  // Авто-переключение 3 фаз симулятора работы химии
  useEffect(() => {
    if (reduce || paused || !selected) return;
    const timer = window.setTimeout(() => {
      setPhaseIndex((prev) => (prev + 1) % DEMO_PHASES.length);
    }, PHASE_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [paused, phaseIndex, reduce, selected]);

  if (!selected) return null;

  const brandBySlugOrId = (id?: string) => brands.find((b) => b.id === id || b.slug === id);
  const primaryRec =
    selected.recommendedProducts?.find((p) => p.role === "recommended") ??
    selected.recommendedProducts?.[0];
  const primaryBrand = brandBySlugOrId(primaryRec?.brandId);
  const seedProd = primaryRec
    ? findSeedProduct({
        productId: primaryRec.productId,
        brandId: primaryRec.brandId,
        productName: primaryRec.productName,
        note: primaryRec.note,
      })
    : undefined;

  const safetyBadge = buildHumanSafetyBadge({
    product: seedProd ?? null,
    surface: selected.surface,
    solution: selected,
    note: primaryRec?.note,
  });

  const videoSource = parseVideoSource(selected.videoUrl);
  const selectedEstimate = pickEstimate(estimates, selected, ctx);
  const selectedEstimateView = selectedEstimate ? formatEstimate(selectedEstimate, ctx) : null;

  const productDisplayName =
    seedProd?.name ??
    primaryRec?.note ??
    primaryRec?.productName ??
    primaryBrand?.name ??
    "Профессиональный состав по протоколу";

  const brandHref = primaryBrand ? `/brands/${primaryBrand.slug}` : "/brands";
  const affiliateHref = primaryBrand?.affiliateUrl;

  function handleSelectRow(slug: string) {
    if (slug !== selected?.slug) {
      setSelectedSlug(slug);
      setPhaseIndex(0);
    }
  }

  return (
    <section id="steam-showcase" aria-labelledby="steam-showcase-title" className="scroll-mt-24">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-data text-xs font-semibold uppercase tracking-[0.16em] text-link">
            Лабораторный стенд · Dual-Engine Demo
          </p>
          <h2
            id="steam-showcase-title"
            className="mt-1.5 text-balance font-display text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl"
          >
            Как работают средства в протоколах
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Наведите или выберите задачу слева: справа мгновенно откроется видео-разбор реакции состава, контроль pH для покрытия и ориентир сметы.
          </p>
        </div>
        <Link
          href="/brands"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-link hover:underline"
        >
          Индекс доверия брендов
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <PillTabs
        label="Категория стенда"
        options={tabOptions}
        value={tab}
        onChange={(next) => {
          setTab(next as ShowcaseTabId);
          setSelectedSlug(null);
          setPhaseIndex(0);
        }}
        className="mb-5"
      />

      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        {/* Левая колонка: плотный Master-list в стиле Steam */}
        <div role="listbox" aria-label="Список протоколов стенда" className="flex flex-col gap-2">
          {filteredList.map((item) => {
            const isActive = item.slug === selected.slug;
            const est = pickEstimate(estimates, item, ctx);
            const estView = est ? formatEstimate(est, ctx) : null;
            const rec =
              item.recommendedProducts?.find((p) => p.role === "recommended") ??
              item.recommendedProducts?.[0];
            const itemBrand = brandBySlugOrId(rec?.brandId);

            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={isActive}
                onMouseEnter={() => handleSelectRow(item.slug)}
                onClick={() => handleSelectRow(item.slug)}
                className={cn(
                  "data-surface group relative flex w-full items-center gap-3.5 rounded-panel p-2.5 text-left transition-all",
                  isActive
                    ? "border-primary/55 bg-card shadow-[0_14px_32px_-18px_hsl(var(--brand)/0.45)] ring-1 ring-inset ring-primary/25"
                    : "bg-card/70 hover:border-primary/30 hover:bg-card"
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
                    {itemBrand && (
                      <span className="font-data font-semibold text-link">
                        · {itemBrand.name}
                      </span>
                    )}
                    <span className="font-data">
                      · {pluralize(item.diySteps.length, ["шаг", "шага", "шагов"])}
                    </span>
                  </span>
                </span>

                {/* Зелёный Steam-бейдж сметы */}
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
            );
          })}
        </div>

        {/* Правая колонка: Sticky Dual-Engine Video / Chemical Demo Player */}
        <div
          className="data-surface linear-beam sticky top-24 overflow-hidden rounded-panel p-5 sm:p-6"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Верхняя приборная строка превью */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-data text-xs font-semibold text-link">
                <FlaskConical className="size-3.5" aria-hidden />
                {SURFACE_LABELS[selected.surface]}
                {selected.material ? ` · ${selected.material}` : ""}
              </span>
              {selectedEstimateView && (
                <span className="rounded-full bg-success/15 px-2.5 py-1 font-data text-xs font-bold tabular-nums text-success">
                  Выезд мастера: {selectedEstimateView.min}–{selectedEstimateView.max}
                </span>
              )}
            </div>

            {!videoSource && (
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? "Запустить авто-демо" : "Поставить авто-демо на паузу"}
                className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-background px-3 font-data text-[11px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                {paused ? <Play className="size-3" aria-hidden /> : <Pause className="size-3" aria-hidden />}
                {paused ? "Старт" : "Авто-демо"}
              </button>
            )}
          </div>

          <h3 className="mt-3 font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {selected.title}
          </h3>

          {/* Экран плеера: Контур 1 (Реальное видео) ИЛИ Контур 2 (3-фазный симулятор химии) */}
          <div className="mt-4">
            {videoSource ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-control bg-cta">
                {videoSource.kind === "iframe" ? (
                  <iframe
                    src={videoSource.embedUrl}
                    title={`Видео-демо: ${selected.title}`}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                ) : (
                  <video
                    src={videoSource.url}
                    muted
                    playsInline
                    loop
                    controls
                    preload="metadata"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-control bg-cta p-4 text-cta-foreground sm:p-5">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--cta-foreground)/0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--cta-foreground)/0.05)_1px,transparent_1px)] bg-size-[24px_24px]"
                />

                {/* Таймлайн 3 фаз симулятора */}
                <div role="tablist" aria-label="Фазы демонстрации состава" className="relative grid grid-cols-3 gap-2">
                  {DEMO_PHASES.map((phase, idx) => {
                    const isCurrent = idx === phaseIndex;
                    const isDone = idx < phaseIndex;
                    return (
                      <button
                        key={phase.id}
                        type="button"
                        role="tab"
                        aria-selected={isCurrent}
                        onClick={() => setPhaseIndex(idx)}
                        className={cn(
                          "flex flex-col gap-1.5 rounded-control border p-2 text-left transition-colors",
                          isCurrent
                            ? "border-brand/50 bg-cta-foreground/10"
                            : "border-cta-foreground/10 bg-cta-foreground/5 opacity-75 hover:opacity-100"
                        )}
                      >
                        <span className="flex items-center justify-between font-data text-[10px] font-bold uppercase tracking-wider">
                          <span className="text-brand">{phase.code}</span>
                          <span className="truncate pl-1 text-cta-foreground/85">{phase.title}</span>
                        </span>
                        <span className="block h-1 w-full overflow-hidden rounded-full bg-cta-foreground/15">
                          {isDone && <span className="block h-full w-full bg-brand" />}
                          {isCurrent && (
                            <motion.span
                              key={`${selected.slug}-${phase.id}-${paused ? "pause" : "play"}`}
                              initial={{ width: reduce ? "100%" : "0%" }}
                              animate={{ width: "100%" }}
                              transition={
                                reduce || paused
                                  ? { duration: 0 }
                                  : { duration: PHASE_DURATION_MS / 1000, ease: "linear" }
                              }
                              className="block h-full bg-brand"
                            />
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Содержимое активной фазы */}
                <div className="relative mt-4 min-h-[156px]">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={`${selected.slug}-phase-${phaseIndex}`}
                      initial={reduce ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? undefined : { opacity: 0, y: -6 }}
                      transition={{ type: "spring", stiffness: 260, damping: 26 }}
                      className="space-y-3"
                    >
                      {phaseIndex === 0 && (
                        <div className="space-y-2.5">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/20 px-2.5 py-1 font-data text-[11px] font-semibold uppercase tracking-wider text-brand">
                            <Ban className="size-3.5" aria-hidden />
                            Фаза 01 · Защита материала от ожога и ореола
                          </span>
                          <p className="text-sm font-semibold leading-relaxed text-cta-foreground sm:text-[15px]">
                            {selected.warnings[0] ?? "Перед нанесением состава проверьте стойкость красителя на скрытом шве."}
                          </p>
                          <p className="text-xs text-cta-foreground/70">
                            Неправильный pH или горячая вода закрепляют пятно в волокнах — протокол блокирует эту ошибку на старте.
                          </p>
                        </div>
                      )}

                      {phaseIndex === 1 && (
                        <div className="space-y-2.5">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/20 px-2.5 py-1 font-data text-[11px] font-semibold uppercase tracking-wider text-brand">
                            <Sparkles className="size-3.5" aria-hidden />
                            Фаза 02 · Пошаговая реакция состава ({pluralize(selected.diySteps.length, ["шаг", "шага", "шагов"])})
                          </span>
                          <ol className="space-y-2 text-xs leading-relaxed text-cta-foreground/90 sm:text-sm">
                            {selected.diySteps.slice(0, 2).map((step) => (
                              <li key={step.order} className="flex items-start gap-2">
                                <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-brand font-data text-[11px] font-bold text-brand-foreground">
                                  {step.order}
                                </span>
                                <span className="line-clamp-2">{step.instruction}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {phaseIndex === 2 && (
                        <div className="space-y-2.5">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/25 px-2.5 py-1 font-data text-[11px] font-semibold uppercase tracking-wider text-brand">
                            <ShieldCheck className="size-3.5" aria-hidden />
                            Фаза 03 · Рекомендованный состав и pH-допуск
                          </span>
                          <p className="text-sm font-semibold text-cta-foreground sm:text-[15px]">
                            {productDisplayName}
                            {primaryBrand ? ` (${primaryBrand.name})` : ""}
                          </p>
                          <p className="text-xs leading-relaxed text-cta-foreground/75">
                            {safetyBadge.detail}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>

          {/* Паспорт рекомендуемого средства со светофором безопасности pH */}
          <div className="mt-4 rounded-control border border-border bg-muted/45 p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-data text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Состав в протоколе {primaryBrand ? `· ${primaryBrand.name}` : ""}
                </p>
                <p className="truncate text-sm font-semibold text-foreground">{productDisplayName}</p>
              </div>
              {safetyBadge.proPhLabel && (
                <span className="rounded-full border border-border bg-card px-2.5 py-0.5 font-data text-[11px] font-semibold text-foreground">
                  {safetyBadge.proPhLabel}
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                  safetyBadge.className
                )}
              >
                <ShieldCheck className="size-3.5 shrink-0" aria-hidden />
                {safetyBadge.label}
              </span>
            </div>
          </div>

          {/* 2 прямые кнопки конверсии */}
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            {affiliateHref ? (
              <a
                href={affiliateHref}
                target="_blank"
                rel="sponsored nofollow noopener"
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-brand px-5 text-xs font-semibold text-brand-foreground transition-transform active:scale-[0.98] sm:text-sm"
              >
                <ShoppingCart className="size-4" aria-hidden />
                Купить средство
                <ArrowUpRight className="size-4" aria-hidden />
              </a>
            ) : (
              <Link
                href={brandHref}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-brand px-5 text-xs font-semibold text-brand-foreground transition-transform active:scale-[0.98] sm:text-sm"
              >
                <ShoppingCart className="size-4" aria-hidden />
                {primaryBrand ? `Средство ${primaryBrand.name}` : "Выбрать средство"}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            )}

            <Link
              href={`/solutions/${selected.slug}`}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card px-5 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-link sm:text-sm"
            >
              Открыть протокол ({pluralize(selected.diySteps.length, ["шаг", "шага", "шагов"])})
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
