"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Ban, Play } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { useRegion } from "@/components/providers/RegionProvider";
import { formatMarketCurrency, pluralize } from "@/lib/format";
import { pickCategoryEstimate } from "@/lib/home/cleaning-services";
import {
  findProtocols,
  listAllProblems,
  listSurfaceAvailability,
  resolveSelection,
} from "@/lib/solutions/diagnostic";
import { SEVERITY_LABELS, SURFACE_LABELS, howToTitle } from "@/lib/solutions/meta";
import { cn } from "@/lib/utils";
import type { ShelfProduct } from "@/lib/products/zone-shelf";
import type { PriceEstimate, Solution, SolutionProblemType, SolutionSurface } from "@/lib/types";

const STEPS_SHOWN = 3;

/**
 * «Спасатель пятен» (#rescue): пилюли проблем со счётчиком реальных протоколов,
 * только доступные поверхности; карточка протокола (тег безопасности, первые
 * шаги, «Не делайте», видео-заглушка); до 3 средств протокола и мостик к мастерам.
 */
export function StainRescue({
  solutions,
  products,
  estimates,
}: {
  solutions: Solution[];
  products: ShelfProduct[];
  estimates: PriceEstimate[];
}) {
  const { market, city } = useRegion();

  const initial = useMemo(() => resolveSelection(solutions, {}), [solutions]);
  const [problem, setProblem] = useState<SolutionProblemType | null>(initial.problem);
  const [surface, setSurface] = useState<SolutionSurface | null>(initial.surface);
  const [variant, setVariant] = useState<string | null>(null);

  const problems = useMemo(
    () =>
      listAllProblems(solutions).map((o) => ({
        ...o,
        count: solutions.filter((s) => s.status === "published" && s.problemType === o.id).length,
      })),
    [solutions],
  );
  const surfaces = useMemo(
    () => listSurfaceAvailability(solutions, problem).filter((s) => s.available),
    [solutions, problem],
  );
  const protocols = useMemo(
    () => (problem && surface ? findProtocols(solutions, surface, problem) : []),
    [solutions, problem, surface],
  );
  const active = protocols.find((s) => s.slug === variant) ?? protocols[0] ?? null;

  const protocolProducts = useMemo(
    () => (active ? products.filter((p) => p.solutionSlug === active.slug).slice(0, 3) : []),
    [products, active],
  );

  const ctx = { countryCode: market.countryCode, city: city.name };
  const rescueEstimate = pickCategoryEstimate(estimates, "upholstery", ctx);

  function pickProblem(next: SolutionProblemType) {
    const options = listSurfaceAvailability(solutions, next).filter((s) => s.available);
    setProblem(next);
    setSurface(options.find((s) => s.id === surface)?.id ?? options[0]?.id ?? null);
    setVariant(null);
  }

  function pickSurface(next: SolutionSurface) {
    setSurface(next);
    setVariant(null);
  }

  if (problems.length === 0) return null;

  return (
    <section id="rescue" aria-labelledby="rescue-title" className="container scroll-mt-24 py-12 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-data text-[11px] font-bold uppercase tracking-[0.16em] text-teal">ChistoLab / Lab</p>
          <h2 id="rescue-title" className="mt-2 max-w-xl text-balance font-display text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl">
            Спасатель пятен
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Точный протокол. Правильное средство. Чистый результат.
          </p>
        </div>
        <Link href="/solutions" className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal hover:underline">
          Все протоколы
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <div className="mt-7 grid gap-6 rounded-panel border border-border bg-card p-5 sm:p-7 lg:grid-cols-[210px_minmax(0,1fr)_minmax(0,0.95fr)]">
        {/* Пилюли проблем: счётчик — число реальных протоколов */}
        <ul className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0">
          {problems.map((o) => {
            const selected = o.id === problem;
            return (
              <li key={o.id} className="shrink-0 lg:shrink">
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => pickProblem(o.id)}
                  className={cn(
                    "flex w-full min-w-44 items-center justify-between gap-3 rounded-control px-4 py-3 text-left text-sm font-semibold transition-colors lg:min-w-0",
                    selected
                      ? "bg-ink text-lime"
                      : "bg-muted/60 text-foreground hover:bg-muted",
                  )}
                >
                  {o.label}
                  <span className={cn("font-data text-xs", selected ? "text-lime/80" : "text-muted-foreground")}>
                    {o.count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Карточка протокола */}
        <div className="min-w-0 border-t border-border pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div className="flex flex-wrap items-center gap-2">
            {surfaces.map((o) => (
              <button
                key={o.id}
                type="button"
                aria-pressed={o.id === surface}
                onClick={() => pickSurface(o.id)}
                className={cn(
                  "min-h-9 rounded-full border px-3.5 text-xs font-semibold transition-colors",
                  o.id === surface
                    ? "border-ink bg-ink text-ink-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-ink/40 hover:text-foreground",
                )}
              >
                {o.label}
              </button>
            ))}
          </div>

          {active ? (
            <div className="mt-5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-teal/10 px-2.5 py-1 text-[11px] font-semibold text-teal">
                  {SURFACE_LABELS[active.surface]}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  {SEVERITY_LABELS[active.severity]}
                </span>
                {protocolProducts[0]?.safetyTags[0] && (
                  <span className="rounded-full border border-success/25 bg-success/10 px-2.5 py-1 text-[11px] font-medium text-foreground">
                    {protocolProducts[0].safetyTags[0]}
                  </span>
                )}
              </div>

              <h3 className="mt-3 font-display text-2xl font-bold tracking-[-0.02em] text-foreground">
                {howToTitle(active)}
              </h3>

              <ol className="mt-4 space-y-2.5">
                {active.diySteps.slice(0, STEPS_SHOWN).map((step) => (
                  <li key={step.order} className="flex items-start gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-control bg-teal font-data text-xs font-bold text-teal-foreground">
                      {step.order}
                    </span>
                    <p className="pt-1 text-sm leading-snug text-foreground">{step.instruction}</p>
                  </li>
                ))}
              </ol>
              {active.diySteps.length > STEPS_SHOWN && (
                <Link href={`/solutions/${active.slug}`} className="mt-2 inline-block text-xs font-semibold text-teal hover:underline">
                  Все {pluralize(active.diySteps.length, ["шаг", "шага", "шагов"])} →
                </Link>
              )}

              {active.warnings[0] && (
                <p className="mt-4 flex gap-3 rounded-control bg-danger-soft py-3 pr-3 text-[13px] leading-snug text-ink">
                  <span aria-hidden className="w-1 shrink-0 self-stretch rounded-full bg-danger" />
                  <span>
                    <span className="mb-0.5 flex items-center gap-1.5 font-data text-[11px] font-bold uppercase tracking-[0.14em] text-danger">
                      <Ban className="size-3.5" aria-hidden />
                      Не делайте
                    </span>
                    {active.warnings[0]}
                  </span>
                </p>
              )}

              {/* Видео: заглушка до съёмки разборов */}
              {active.videoUrl ? (
                <Link
                  href={`/solutions/${active.slug}`}
                  className="mt-4 flex items-center gap-3 rounded-control bg-ink p-4 text-ink-foreground transition-transform hover:-translate-y-0.5"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-lime text-ink">
                    <Play className="size-4 fill-ink" aria-hidden />
                  </span>
                  <span className="text-sm font-semibold">Смотреть видеоразбор протокола</span>
                </Link>
              ) : (
                <div className="mt-4 flex items-center gap-3 rounded-control bg-ink p-4 text-ink-foreground" aria-label="Видео появится позже">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10">
                    <Play className="size-4 text-lime" aria-hidden />
                  </span>
                  <span className="text-sm font-semibold text-ink-foreground/80">Видео скоро — пока пошаговый протокол выше</span>
                </div>
              )}
            </div>
          ) : (
            <p className="mt-5 text-sm text-muted-foreground">Для этой пары протокол готовится.</p>
          )}
        </div>

        {/* Средства протокола + мостик к мастерам */}
        <div className="flex min-w-0 flex-col gap-3 border-t border-border pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          {protocolProducts.length > 0 ? (
            protocolProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                variant="compact"
                currency={market.currency}
                countryCode={market.countryCode}
                placement="home.rescue"
              />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Средства к этому протоколу добавляем.</p>
          )}

          <div className="mt-auto flex flex-col items-start justify-between gap-3 rounded-control border border-dashed border-ink/25 p-4 sm:flex-row sm:items-center">
            <p className="text-[13px] leading-snug text-foreground">
              <b>Пятно уже въелось?</b>{" "}
              <span className="text-muted-foreground">
                Проверенные мастера в {city.nameIn}
                {rescueEstimate ? ` — выезд от ${formatMarketCurrency(rescueEstimate.priceMin, rescueEstimate.currency as "BYN" | "RUB" | "KZT")}` : ""}
              </span>
            </p>
            <a
              href="#cleaners"
              className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-control bg-ink px-4 text-xs font-semibold text-ink-foreground transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Выбрать клинера
              <ArrowRight className="size-3.5" aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
