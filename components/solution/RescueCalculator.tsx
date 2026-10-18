"use client";

import { useState } from "react";
import { AlertTriangle, ArrowDown, CheckCircle2, Clock, FlaskConical, MessageCircle, Sparkles, Wallet } from "lucide-react";
import { PhoneButton } from "@/components/PhoneButton";
import { useRegion } from "@/components/providers/RegionProvider";
import { trackClick } from "@/lib/analytics";
import { formatMarketCurrency } from "@/lib/format";
import { MARKETS, type CountryCode, type CurrencyCode } from "@/lib/markets";
import { DIAGNOSTIC_CONTEXT, buildEscalation, formatEstimate, pickEstimate } from "@/lib/solutions/diagnostic";
import { SURFACE_RISK_LABELS } from "@/lib/solutions/meta";
import type { Company, PriceEstimate, Solution } from "@/lib/types";
import { cn } from "@/lib/utils";

export type RescueScenarioId = "fresh" | "dried" | "rubbed";

export interface RescueScenarioOption {
  id: RescueScenarioId;
  buttonLabel: string;
  shortTag: string;
  chancePercent: number;
  tone: "success" | "caution" | "danger";
  badgeClassName: string;
  headline: string;
  explanation: string;
  ctaLabel: string;
  ctaHref: string;
  recommendProCall: boolean;
}

export interface RescueComparisonRow {
  id: "household" | "pro_diy" | "master";
  title: string;
  costLabel: string;
  timeLabel: string;
  noteLabel: string;
  currency: CurrencyCode;
}

export const RESCUE_SCENARIO_ORDER: readonly RescueScenarioId[] = ["fresh", "dried", "rubbed"] as const;

export function buildRescueScenarios(
  solution: Pick<Solution, "surface" | "whenToCallPro">,
  priceFrom?: string | null,
): Record<RescueScenarioId, RescueScenarioOption> {
  const riskSurface = SURFACE_RISK_LABELS[solution.surface];

  return {
    fresh: {
      id: "fresh",
      buttonLabel: "Только что (свежее)",
      shortTag: "Первые 15–30 мин",
      chancePercent: 85,
      tone: "success",
      badgeClassName: "border-success/25 bg-success/10 text-success",
      headline: "Шанс вывести дома: 85% (низкий риск испортить покрытие)",
      explanation: `Загрязнение ещё на поверхности и не успело связаться с основой. Главное — не тереть щёткой и не лить горячую воду: идите по пошаговому чек-листу ниже, чтобы бережно спасти ${riskSurface}.`,
      ctaLabel: "Перейти к пошаговому чек-листу",
      ctaHref: "#diy-steps",
      recommendProCall: false,
    },
    dried: {
      id: "dried",
      buttonLabel: "Засохло (вчера и раньше)",
      shortTag: "Въевшееся пятно",
      chancePercent: 40,
      tone: "caution",
      badgeClassName: "border-star/30 bg-star/15 text-star",
      headline: "Шанс вывести дома: 40% · Нужен специализированный состав",
      explanation:
        "Обычная вода и бытовое мыло уже не возьмут высохший пигмент — нужен специализированный профессиональный пятновыводитель из подборки ниже с обязательным тестом на незаметном шве.",
      ctaLabel: "Подобрать специализированный состав",
      ctaHref: "#diy-products",
      recommendProCall: false,
    },
    rubbed: {
      id: "rubbed",
      buttonLabel: "Уже тёрли бытовой химией / содой / горячей водой",
      shortTag: "Риск ореола",
      chancePercent: 15,
      tone: "danger",
      badgeClassName: "border-danger/25 bg-danger/10 text-danger",
      headline: "Стоп! Шанс дома: 15% (высокий риск вечного ореола и повреждения ворса)",
      explanation: `Бытовая пена, сода или горячая вода уже загнали грязь глубоко в поролон/основу и зафиксировали пятно. Дальнейшее трение оставит жёлтый круг или белёсую проплешина. Чтобы спасти ${riskSurface}, нужен промывочный водосос-экстрактор, который вытянет химию и грязь из глубины.`,
      ctaLabel: priceFrom ? `Вызвать проверенного мастера — от ${priceFrom}` : "Вызвать проверенного мастера",
      ctaHref: "#pro",
      recommendProCall: true,
    },
  };
}

function formatDiyChemistryCost(solution: Pick<Solution, "diyCostNote">, countryCode: string, currency: CurrencyCode): string {
  if (countryCode === "BY" && solution.diyCostNote) {
    return solution.diyCostNote;
  }
  if (currency === "RUB") {
    return `${formatMarketCurrency(800, "RUB")} – ${formatMarketCurrency(1500, "RUB")} (флакон спецсредства)`;
  }
  if (currency === "KZT") {
    return `${formatMarketCurrency(4000, "KZT")} – ${formatMarketCurrency(7500, "KZT")} (флакон спецсредства)`;
  }
  return solution.diyCostNote ?? `${formatMarketCurrency(25, "BYN")} – ${formatMarketCurrency(40, "BYN")} (флакон спецсредства)`;
}

export function buildRescueComparison(
  solution: Solution,
  estimates: PriceEstimate[],
  ctx: { countryCode: string; city: string; currency?: CurrencyCode } = DIAGNOSTIC_CONTEXT,
): RescueComparisonRow[] {
  const market = MARKETS[(ctx.countryCode as CountryCode) in MARKETS ? (ctx.countryCode as CountryCode) : "BY"];
  const currency: CurrencyCode = ctx.currency ?? market.currency;
  const estimate = pickEstimate(estimates, solution, { countryCode: ctx.countryCode, city: ctx.city });
  const formattedEstimate = estimate ? formatEstimate(estimate, { countryCode: ctx.countryCode, city: ctx.city }) : null;

  const masterCost = formattedEstimate
    ? `${formattedEstimate.min} – ${formattedEstimate.max}${formattedEstimate.unit ? ` / ${formattedEstimate.unit}` : ""}`
    : "По запросу в вашем городе";

  return [
    {
      id: "household",
      title: "Подручные средства (салфетки + вода)",
      costLabel: `0 (${formatMarketCurrency(0, currency)})`,
      timeLabel: "только в первые 15 минут",
      noteLabel: "Экстренно промокнуть свежее пятно без трения",
      currency,
    },
    {
      id: "pro_diy",
      title: "Профессиональный пятновыводитель дома",
      costLabel: formatDiyChemistryCost(solution, ctx.countryCode, currency),
      timeLabel: "~30 мин работы · останется флакон на будущее",
      noteLabel: "Бережное удаление по шагам протокола",
      currency,
    },
    {
      id: "master",
      title: "Выезд мастера с экстрактором на дом",
      costLabel: masterCost,
      timeLabel: `${solution.proTimeNote ?? "~1–1.5 часа"} · с гарантией`,
      noteLabel: "Промывка из глубины водососом без ореолов",
      currency,
    },
  ];
}

export function RescueCalculator({
  solution,
  estimates,
  companies,
}: {
  solution: Solution;
  estimates: PriceEstimate[];
  companies: Company[];
}) {
  const [selected, setSelected] = useState<RescueScenarioId>("fresh");
  const { market, city } = useRegion();

  const offer = buildEscalation(solution, estimates, companies, {
    countryCode: market.countryCode,
    city: city.name,
    cities: market.cities.map((c) => c.name),
  });

  const scenarios = buildRescueScenarios(solution, offer.priceFrom);
  const current = scenarios[selected];
  const comparisonRows = buildRescueComparison(solution, estimates, {
    countryCode: market.countryCode,
    city: city.name,
    currency: market.currency,
  });

  const { company } = offer;

  return (
    <div
      aria-labelledby="rescue-calculator-title"
      className="no-print mt-6 rounded-panel border border-border bg-card/85 p-5 shadow-xs sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-primary">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          Вердикт за 10 секунд · Сам или мастер
        </span>
        <span className="text-xs text-muted-foreground">Выберите состояние загрязнения</span>
      </div>

      <h3
        id="rescue-calculator-title"
        className="mt-2 font-display text-lg font-bold tracking-[-0.02em] text-foreground sm:text-xl"
      >
        Что сейчас с пятном или покрытием?
      </h3>

      {/* 3 кнопки состояния пятна */}
      <div role="group" aria-label="Состояние загрязнения" className="mt-3.5 grid gap-2 sm:grid-cols-3">
        {RESCUE_SCENARIO_ORDER.map((id) => {
          const item = scenarios[id];
          const isActive = selected === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={isActive}
              onClick={() => setSelected(id)}
              className={cn(
                "flex flex-col items-start justify-between gap-1.5 rounded-control border p-3.5 text-left transition-all",
                isActive
                  ? item.tone === "danger"
                    ? "border-danger bg-danger/[0.08] ring-1 ring-danger/35"
                    : item.tone === "caution"
                      ? "border-star bg-star/[0.10] ring-1 ring-star/35"
                      : "border-primary bg-primary/[0.08] ring-1 ring-primary/30"
                  : "border-border bg-muted/35 hover:border-primary/30 hover:bg-card",
              )}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {item.shortTag}
              </span>
              <span className="text-xs font-semibold leading-snug text-foreground sm:text-[13px]">
                {item.buttonLabel}
              </span>
              <span
                className={cn(
                  "mt-1 inline-flex items-center rounded-full border px-2 py-0.5 font-data text-[11px] font-semibold",
                  item.badgeClassName,
                )}
              >
                Шанс дома: {item.chancePercent}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Динамический вердикт по выбранному состоянию */}
      <div
        className={cn(
          "mt-4 rounded-control border p-4 transition-colors sm:p-5",
          current.tone === "danger"
            ? "border-danger/35 bg-danger/[0.06]"
            : current.tone === "caution"
              ? "border-star/35 bg-star/[0.08]"
              : "border-success/30 bg-success/[0.06]",
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {current.tone === "danger" ? (
              <AlertTriangle className="h-4 w-4 shrink-0 text-danger" aria-hidden />
            ) : current.tone === "caution" ? (
              <FlaskConical className="h-4 w-4 shrink-0 text-star" aria-hidden />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden />
            )}
            <span className="font-display text-sm font-bold text-foreground sm:text-base">{current.headline}</span>
          </div>

          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 font-data text-xs font-semibold",
              current.badgeClassName,
            )}
          >
            {current.chancePercent}% успех дома
          </span>
        </div>

        {/* Индикатор шанса спасения */}
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-background/80">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              current.tone === "danger" ? "bg-danger" : current.tone === "caution" ? "bg-star" : "bg-success",
            )}
            style={{ width: `${current.chancePercent}%` }}
          />
        </div>

        <p className="mt-3 text-sm leading-6 text-foreground/90">{current.explanation}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          {current.recommendProCall ? (
            <>
              {company?.phone ? (
                <PhoneButton
                  phone={company.phone}
                  companyId={company.id}
                  categoryId={solution.relatedCategory ?? company.categories[0]}
                  label={
                    offer.priceFrom
                      ? `Позвонить проверенному мастеру — от ${offer.priceFrom}`
                      : "Позвонить проверенному мастеру"
                  }
                />
              ) : company?.telegramUrl ? (
                <a
                  href={company.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackClick({ companyId: company.id, categoryId: solution.relatedCategory, clickType: "telegram" })
                  }
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-brand px-4 text-xs font-semibold text-brand-foreground shadow-xs transition-transform hover:-translate-y-0.5 active:scale-[0.98] sm:text-sm"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  {offer.priceFrom
                    ? `Написать проверенному мастеру — от ${offer.priceFrom}`
                    : "Написать проверенному мастеру"}
                </a>
              ) : null}

              <a
                href="#pro"
                className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-xs font-semibold text-foreground transition-colors hover:border-primary/35 hover:text-primary sm:text-sm"
              >
                <Sparkles className="h-3.5 w-3.5 text-brand" aria-hidden />
                {offer.priceFrom ? `Мастера в ${city.nameIn} (от ${offer.priceFrom})` : `Выбрать мастера в ${city.nameIn}`}
              </a>
            </>
          ) : (
            <>
              <a
                href={current.ctaHref}
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:text-sm"
              >
                {current.ctaLabel}
                <ArrowDown className="h-3.5 w-3.5" aria-hidden />
              </a>
              {current.id === "dried" && (
                <a
                  href="#pro"
                  className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/35 hover:text-foreground"
                >
                  Или сравнить с выездом мастера
                </a>
              )}
            </>
          )}
        </div>
      </div>

      {/* Наглядная мини-таблица сравнения в деньгах и времени */}
      <div className="mt-5 border-t border-border/70 pt-4">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            <Wallet className="h-3.5 w-3.5" aria-hidden />
            Сравнение в деньгах и времени ({city.name})
          </span>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {comparisonRows.map((row) => (
            <div
              key={row.id}
              className={cn(
                "flex flex-col justify-between rounded-control border p-3 text-xs",
                row.id === "master" && selected === "rubbed"
                  ? "border-brand/40 bg-brand/[0.06]"
                  : row.id === "pro_diy" && selected === "dried"
                    ? "border-primary/35 bg-primary/[0.05]"
                    : "border-border/80 bg-muted/25",
              )}
            >
              <div>
                <div className="font-semibold text-foreground">{row.title}</div>
                <div className="mt-1.5 font-data text-sm font-bold text-foreground">{row.costLabel}</div>
              </div>
              <div className="mt-2 border-t border-border/50 pt-2 text-[11px] leading-4 text-muted-foreground">
                <div className="font-medium text-foreground/80">{row.timeLabel}</div>
                <div className="mt-0.5">{row.noteLabel}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
