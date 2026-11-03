"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, MessageCircle, Phone, Star } from "lucide-react";
import { CompanyAvatar } from "@/components/CompanyAvatar";
import { useRegion } from "@/components/providers/RegionProvider";
import { trackClick } from "@/lib/analytics";
import { getCategoryName, categoryLandingHref } from "@/lib/categories";
import { formatMarketCurrency } from "@/lib/format";
import { CLEANING_SERVICES, cleanerCardPrice, pickCategoryEstimate } from "@/lib/home/cleaning-services";
import {
  externalRating,
  rankOrganicCompanies,
  telHref,
} from "@/lib/solutions/diagnostic";
import { cn } from "@/lib/utils";
import type { CategoryId, Company, PriceEstimate } from "@/lib/types";

const ORGANIC_LIMIT = 3;

/**
 * «Проверенные клинеры рядом»: табы шести услуг, смета города (pe-cat-*)
 * и карточки компаний в ряд — спонсорская карточка с лаймовой рамкой и
 * пометкой «Реклама» + органический порядок по доверию. Прямые контакты трекаются.
 */
export function CleanersByServiceSection({
  companies,
  estimates,
}: {
  companies: Company[];
  estimates: PriceEstimate[];
}) {
  const { market, city } = useRegion();
  const [service, setService] = useState<CategoryId>(CLEANING_SERVICES[0].id);

  const ctx = { countryCode: market.countryCode, city: city.name };
  const serviceInfo = CLEANING_SERVICES.find((s) => s.id === service) ?? CLEANING_SERVICES[0];
  const estimate = pickCategoryEstimate(estimates, service, ctx);

  const { sponsor, organic } = useMemo(() => {
    const inCity = companies.filter((c) => c.city === city.name && c.categories.includes(service));
    const promoted = rankOrganicCompanies(inCity.filter((c) => c.promoted));
    return {
      sponsor: promoted[0] ?? null,
      organic: rankOrganicCompanies(inCity.filter((c) => !c.promoted)).slice(0, promoted[0] ? ORGANIC_LIMIT - 1 : ORGANIC_LIMIT),
    };
  }, [companies, city.name, service]);

  return (
    <section id="cleaners" aria-labelledby="cleaners-title" className="scroll-mt-24 border-y border-border bg-muted/40 py-12 sm:py-16">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-data text-[11px] font-bold uppercase tracking-[0.16em] text-teal">ChistoLab / Pro</p>
            <h2 id="cleaners-title" className="mt-2 max-w-xl text-balance font-display text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl">
              Проверенные клинеры рядом ({city.name})
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
              Компании с проверенным профилем. Звоните напрямую — без посредников.
              Рекламные места помечены и на ранжирование не влияют.
            </p>
          </div>
          <Link
            href={categoryLandingHref(city.slug, service)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal hover:underline"
          >
            Весь рейтинг: {serviceInfo.label}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        <div role="tablist" aria-label="Услуги" className="no-scrollbar -mx-4 mt-7 flex gap-2 overflow-x-auto px-4 pb-1">
          {CLEANING_SERVICES.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={service === s.id}
              onClick={() => setService(s.id)}
              className={cn(
                "min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors",
                service === s.id
                  ? "border-ink bg-ink text-ink-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-ink/40 hover:text-foreground",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Смета выбранной услуги в городе */}
        <div className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-panel border border-border bg-card p-5">
          <p className="font-data text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            {serviceInfo.label} · {city.name}
          </p>
          {estimate ? (
            <>
              <p className="font-data text-2xl font-bold tracking-tight text-teal sm:text-3xl">
                {formatMarketCurrency(estimate.priceMin, estimate.currency as "BYN" | "RUB" | "KZT")}
                <span className="text-muted-foreground"> – </span>
                {formatMarketCurrency(estimate.priceMax, estimate.currency as "BYN" | "RUB" | "KZT")}
              </p>
              <p className="text-sm text-muted-foreground">
                {estimate.unit ? `за ${estimate.unit}` : ""}
                {estimate.note ? ` · ${estimate.note}` : ""} · точную цену называет компания после осмотра
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Ориентир цены для этого города появится позже — сметы собираем из открытых прайсов.
            </p>
          )}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sponsor && <CleanerCard key={sponsor.id} company={sponsor} service={service} serviceUnit={estimate?.unit ?? null} countryCode={market.countryCode} sponsor />}
          {organic.map((company) => (
            <CleanerCard key={company.id} company={company} service={service} serviceUnit={estimate?.unit ?? null} countryCode={market.countryCode} />
          ))}
        </div>

        {!sponsor && organic.length === 0 && (
          <p className="mt-6 rounded-panel border border-dashed border-border bg-card p-5 text-sm text-muted-foreground">
            В городе «{city.name}» компаний по услуге «{serviceInfo.label}» пока нет — случайные не подставляем.{" "}
            <Link href="/for-partners" className="font-semibold text-teal">
              Разместить компанию
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}

function CleanerCard({
  company,
  service,
  serviceUnit,
  countryCode,
  sponsor = false,
}: {
  company: Company;
  service: CategoryId;
  serviceUnit: string | null;
  countryCode: string;
  sponsor?: boolean;
}) {
  const rating = externalRating(company);
  const serviceTags = [service, ...company.categories.filter((c) => c !== service)].slice(0, 3);

  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-panel border bg-card p-5 transition-shadow hover:shadow-md",
        sponsor ? "border-2 border-lime" : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <Link href={`/companies/${company.slug}`} className="flex min-w-0 items-center gap-3">
          <CompanyAvatar id={company.id} name={company.name} size="md" className="shrink-0" />
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-1.5">
              <span className="truncate text-sm font-bold text-foreground">{company.name}</span>
              {company.verified && <BadgeCheck className="size-4 shrink-0 text-teal" aria-label="Профиль проверен" />}
            </span>
            {rating && (
              <span className="mt-0.5 inline-flex items-center gap-1 font-data text-xs font-semibold text-foreground">
                <Star className="size-3 fill-star text-star" aria-hidden />
                {rating.value.toFixed(1)} · {rating.count} отзывов · {rating.source}
              </span>
            )}
          </span>
        </Link>
        {sponsor && (
          <span className="shrink-0 rounded-[6px] bg-lime-soft px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-ink">
            Реклама
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {serviceTags.map((category) => (
          <span key={category} className="rounded-full border border-border bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            {getCategoryName(category)}
          </span>
        ))}
      </div>

      <div className="mt-auto">
        <p className="font-data text-lg font-bold text-foreground">{cleanerCardPrice(company, serviceUnit)}</p>
        <div className="mt-3 flex gap-2">
          {company.phone && (
            <a
              href={telHref(company.phone)}
              onClick={() => trackClick({ companyId: company.id, categoryId: service, clickType: "phone", countryCode })}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-control bg-lime px-4 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <Phone className="size-4" aria-hidden />
              Позвонить
            </a>
          )}
          {company.telegramUrl && (
            <a
              href={company.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Telegram ${company.name}`}
              onClick={() => trackClick({ companyId: company.id, categoryId: service, clickType: "telegram", countryCode })}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-control bg-ink px-4 text-sm font-semibold text-ink-foreground transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <MessageCircle className="size-4" aria-hidden />
              Telegram
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
