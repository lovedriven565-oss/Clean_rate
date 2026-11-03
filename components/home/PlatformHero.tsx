"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Ban, Building2, FlaskConical, ListChecks, MapPinned, Phone, Send, Sparkles } from "lucide-react";
import { MarketBadge } from "@/components/MarketBadge";
import { SmartSearch } from "@/components/SmartSearch";
import { useRegion } from "@/components/providers/RegionProvider";
import { trackClick } from "@/lib/analytics";
import { formatMarketCurrency, pluralize } from "@/lib/format";
import { CLEANING_SERVICES, pickCategoryEstimate, pickTopCompany } from "@/lib/home/cleaning-services";
import {
  externalRating,
  findProtocols,
  formatEstimate,
  listAllProblems,
  listSurfaceAvailability,
  pickEstimate,
  resolveSelection,
  telHref,
} from "@/lib/solutions/diagnostic";
import { solutionCover } from "@/lib/solutions/covers";
import { howToTitle } from "@/lib/solutions/meta";
import { cn } from "@/lib/utils";
import type {
  CategoryId,
  Company,
  PriceEstimate,
  Solution,
  SolutionProblemType,
  SolutionSurface,
} from "@/lib/types";

type Mode = "diy" | "pro";
type Currency = "BYN" | "RUB" | "KZT";

const MODES: { id: Mode; title: string; hint: string }[] = [
  { id: "diy", title: "Решить самому", hint: "Протоколы и химия" },
  { id: "pro", title: "Вызвать клининг", hint: "Мастера и цены" },
];

const chip =
  "inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-35";
const chipOn = "border-lime bg-lime text-ink";
const chipOff = "border-white/15 bg-white/5 text-ink-foreground/85 enabled:hover:border-lime/60 enabled:hover:text-ink-foreground";

/**
 * Первый экран: тёмный блок с переключателем «Решить самому» ⇄ «Вызвать клининг».
 * SSR отдаёт H1 и карточку режима «Решить самому» сразу, без ожидания гидрации.
 */
export function PlatformHero({
  solutions,
  estimates,
  companies,
}: {
  solutions: Solution[];
  estimates: PriceEstimate[];
  companies: Company[];
}) {
  const { market, city } = useRegion();
  const [mode, setMode] = useState<Mode>("diy");

  const initial = useMemo(() => resolveSelection(solutions, {}), [solutions]);
  const [problem, setProblem] = useState<SolutionProblemType | null>(initial.problem);
  const [surface, setSurface] = useState<SolutionSurface | null>(initial.surface);
  const [variant, setVariant] = useState<string | null>(null);
  const [service, setService] = useState<CategoryId>(CLEANING_SERVICES[0].id);

  const problems = useMemo(() => listAllProblems(solutions), [solutions]);
  const surfaces = useMemo(() => listSurfaceAvailability(solutions, problem), [solutions, problem]);
  const protocols = useMemo(
    () => (problem && surface ? findProtocols(solutions, surface, problem) : []),
    [solutions, problem, surface],
  );
  const active = protocols.find((s) => s.slug === variant) ?? protocols[0] ?? null;

  function pickProblem(next: SolutionProblemType) {
    const options = listSurfaceAvailability(solutions, next);
    const keep = options.find((s) => s.id === surface && s.available);
    setProblem(next);
    setSurface((keep ?? options.find((s) => s.available))?.id ?? null);
    setVariant(null);
  }

  function pickSurface(next: SolutionSurface) {
    setSurface(next);
    setVariant(null);
  }

  const ctx = { countryCode: market.countryCode, city: city.name };
  const estimate = active ? pickEstimate(estimates, active, ctx) : null;
  const price = estimate ? formatEstimate(estimate, ctx) : null;

  const serviceInfo = CLEANING_SERVICES.find((s) => s.id === service) ?? CLEANING_SERVICES[0];
  const serviceEstimate = pickCategoryEstimate(estimates, service, ctx);
  const topCompany = pickTopCompany(companies, service, city.name);
  const topRating = topCompany ? externalRating(topCompany) : null;

  const cityCompanies = companies.filter((c) => c.city === city.name).length;
  const metrics = [
    { icon: FlaskConical, value: solutions.length, label: pluralize(solutions.length, ["протокол", "протокола", "протоколов"]) },
    { icon: ListChecks, value: solutions.reduce((n, s) => n + s.diySteps.length, 0), label: "шагов в инструкциях" },
    { icon: Building2, value: cityCompanies, label: `компаний · ${city.name}` },
    { icon: MapPinned, value: market.cities.filter((c) => c.enabled !== false).length, label: `гор. · ${market.name}` },
  ];

  return (
    <section className="relative isolate bg-ink text-ink-foreground">
      <div className="container pb-10 pt-6 sm:pt-10 lg:pb-14 lg:pt-12">
        <div
          role="tablist"
          aria-label="Режим"
          className="mb-8 inline-grid w-full max-w-md grid-cols-2 gap-1 rounded-full border border-white/10 bg-white/5 p-1 sm:w-auto sm:max-w-none"
        >
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={mode === m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                "min-h-11 rounded-full px-3 text-left transition-colors sm:px-5",
                mode === m.id ? "bg-lime text-ink" : "text-ink-foreground/75 hover:text-ink-foreground",
              )}
            >
              <span className="block text-sm font-bold leading-tight">{m.title}</span>
              <span className="hidden font-data text-[10px] uppercase tracking-wider opacity-70 sm:block">{m.hint}</span>
            </button>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_0.92fr] lg:items-center lg:gap-12">
          <div className="min-w-0">
            <div className="inline-flex rounded-full [&>span]:border-white/15 [&>span]:bg-white/5 [&>span]:text-lime [&>span]:shadow-none">
              <MarketBadge />
            </div>
            <h1 className="mt-5 max-w-xl text-balance font-display text-4xl font-bold leading-[1.04] tracking-[-0.04em] sm:text-5xl lg:text-[3.4rem]">
              Найдите решение <span className="text-lime">любой задачи чистоты</span>
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-foreground/70">
              {mode === "diy"
                ? "Выберите, что случилось и на чём: получите инструкцию с блоком «Не делайте» и честной ценой мастера в вашем городе."
                : "Выберите услугу: увидите вилку цен в вашем городе и лучшую проверенную компанию без переплаты за рекламу."}
            </p>

            <div className="mt-7 space-y-5">
              {mode === "diy" ? (
                <>
                  <ChipGroup label="Что случилось">
                    {problems.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        aria-pressed={o.id === problem}
                        onClick={() => pickProblem(o.id)}
                        className={cn(chip, o.id === problem ? chipOn : chipOff)}
                      >
                        {o.label}
                      </button>
                    ))}
                  </ChipGroup>
                  <ChipGroup label="На чём">
                    {surfaces.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        disabled={!o.available}
                        aria-pressed={o.id === surface}
                        title={o.available ? undefined : "Для этой проблемы на такой поверхности инструкции пока нет"}
                        onClick={() => pickSurface(o.id)}
                        className={cn(chip, o.id === surface ? chipOn : chipOff)}
                      >
                        {o.label}
                      </button>
                    ))}
                  </ChipGroup>
                </>
              ) : (
                <ChipGroup label="Какая услуга нужна">
                  {CLEANING_SERVICES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      aria-pressed={s.id === service}
                      onClick={() => setService(s.id)}
                      className={cn(chip, s.id === service ? chipOn : chipOff)}
                    >
                      {s.label}
                    </button>
                  ))}
                </ChipGroup>
              )}
            </div>

            <div className="mt-7 max-w-xl">
              <p className="mb-2 flex items-center gap-1.5 px-1 text-sm text-ink-foreground/70">
                <Sparkles className="size-3.5 text-lime" aria-hidden />
                Или опишите задачу словами
              </p>
              <SmartSearch bare />
            </div>
          </div>

          <div className="min-w-0 text-foreground">
            {mode === "diy" && active && (
              <article className="overflow-hidden rounded-panel bg-card" aria-live="polite">
                <div className="relative aspect-[16/10] w-full bg-muted">
                  <Image
                    src={solutionCover(active)}
                    alt=""
                    fill
                    priority
                    sizes="(min-width: 1024px) 560px, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="grid gap-4 p-5 sm:p-6">
                  <h2 className="text-balance font-display text-xl font-bold leading-tight tracking-tight sm:text-2xl">
                    {howToTitle(active)}
                  </h2>
                  {active.warnings[0] && (
                    <p className="flex gap-3 rounded-control bg-danger-soft py-3 pr-3 text-[13px] leading-snug">
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
                  <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="font-data">{pluralize(active.diySteps.length, ["шаг", "шага", "шагов"])}</span>
                    {price && (
                      <span>
                        Мастер от <b className="font-data font-bold text-teal">{price.min}</b>
                        {price.unit ? ` за ${price.unit}` : ""}
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/solutions/${active.slug}`}
                      className="inline-flex min-h-12 items-center gap-2 rounded-full bg-lime px-6 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
                    >
                      Как убрать
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                    <a href="#cleaners" className="text-sm font-semibold text-teal hover:underline">
                      Мастера в городе
                    </a>
                  </div>
                  {protocols.length > 1 && (
                    <div className="border-t border-border pt-4">
                      <p className="mb-2 text-xs text-muted-foreground">Другие задачи на этой поверхности</p>
                      <div className="flex gap-2">
                        {protocols.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            aria-label={howToTitle(s)}
                            title={howToTitle(s)}
                            aria-pressed={s.id === active.id}
                            onClick={() => setVariant(s.slug)}
                            className={cn(
                              "relative size-14 overflow-hidden rounded-control ring-offset-2 ring-offset-card transition",
                              s.id === active.id ? "ring-2 ring-ink" : "opacity-70 hover:opacity-100",
                            )}
                          >
                            <Image src={solutionCover(s)} alt="" fill sizes="56px" className="object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            )}

            {mode === "pro" && (
              <article className="grid gap-5 rounded-panel bg-card p-5 sm:p-6" aria-live="polite">
                <div>
                  <p className="font-data text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    {serviceInfo.label} · {city.name}
                  </p>
                  {serviceEstimate ? (
                    <>
                      <p className="mt-2 font-data text-3xl font-bold tracking-tight sm:text-4xl">
                        {formatMarketCurrency(serviceEstimate.priceMin, serviceEstimate.currency as Currency)}
                        <span className="text-muted-foreground"> – </span>
                        {formatMarketCurrency(serviceEstimate.priceMax, serviceEstimate.currency as Currency)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {serviceEstimate.unit ? `за ${serviceEstimate.unit}` : ""}
                        {serviceEstimate.note ? ` · ${serviceEstimate.note}` : ""}
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">Ориентир цены для этого города появится позже.</p>
                  )}
                </div>

                <div className="rounded-control border border-border p-4">
                  {topCompany ? (
                    <>
                      <p className="font-data text-[10px] font-bold uppercase tracking-[0.14em] text-teal">
                        Топ в городе по доверию
                      </p>
                      <p className="mt-1 text-lg font-bold leading-tight">{topCompany.name}</p>
                      <p className="mt-1 flex flex-wrap gap-x-3 text-sm text-muted-foreground">
                        {topCompany.verified && <span>Профиль проверен</span>}
                        {topRating && (
                          <span className="font-data">
                            {topRating.value.toFixed(1)} · {topRating.source}, {topRating.count}
                          </span>
                        )}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {topCompany.phone && (
                          <a
                            href={telHref(topCompany.phone)}
                            onClick={() =>
                              trackClick({
                                companyId: topCompany.id,
                                categoryId: service,
                                clickType: "phone",
                                countryCode: market.countryCode,
                              })
                            }
                            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-ink-foreground"
                          >
                            <Phone className="size-4" aria-hidden />
                            Позвонить
                          </a>
                        )}
                        {topCompany.telegramUrl && (
                          <a
                            href={topCompany.telegramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() =>
                              trackClick({
                                companyId: topCompany.id,
                                categoryId: service,
                                clickType: "telegram",
                                countryCode: market.countryCode,
                              })
                            }
                            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-semibold"
                          >
                            <Send className="size-4" aria-hidden />
                            Telegram
                          </a>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      В городе «{city.name}» проверенных компаний по этой услуге пока нет — добавляем по мере
                      верификации.
                    </p>
                  )}
                </div>

                <Link
                  href={`/rating?category=${service}`}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-lime px-6 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  Смотреть рейтинг компаний
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </article>
            )}
          </div>
        </div>

        <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-panel bg-white/10 sm:grid-cols-4">
          {metrics.map((m) => (
            <div key={m.label} className="flex items-center gap-3 bg-ink px-4 py-4">
              <dt className="sr-only">{m.label}</dt>
              <dd className="flex min-w-0 items-center gap-3">
                <m.icon className="size-5 shrink-0 text-lime" aria-hidden />
                <span>
                  <span className="font-data text-2xl font-bold text-ink-foreground">{m.value}</span>
                  <span className="mt-0.5 block text-xs text-ink-foreground/60">{m.label}</span>
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function ChipGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{label}</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {children}
      </div>
    </div>
  );
}
