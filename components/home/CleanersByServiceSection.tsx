"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, MessageCircle, Phone, Star } from "lucide-react";
import { CompanyAvatar } from "@/components/CompanyAvatar";
import { useRegion } from "@/components/providers/RegionProvider";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { trackClick } from "@/lib/analytics";
import { categoryLandingHref } from "@/lib/categories";
import { formatMarketCurrency } from "@/lib/format";
import { CLEANING_SERVICES, pickCategoryEstimate } from "@/lib/home/cleaning-services";
import {
  companyPriceLabel,
  externalRating,
  rankOrganicCompanies,
  telHref,
} from "@/lib/solutions/diagnostic";
import { cn } from "@/lib/utils";
import type { CategoryId, Company, PriceEstimate } from "@/lib/types";

const ORGANIC_LIMIT = 3;

/**
 * «Рейтинг проверенных клинеров по видам работ»: табы шести услуг,
 * вилка цен выбранного города (pe-cat-*) и карточки компаний города —
 * спонсорский слот с открытой маркировкой «Реклама» + органический порядок
 * по доверию. Прямые контакты (звонок/Telegram) трекаются.
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
      organic: rankOrganicCompanies(inCity.filter((c) => !c.promoted)).slice(0, ORGANIC_LIMIT),
    };
  }, [companies, city.name, service]);

  return (
    <section id="cleaners" aria-labelledby="cleaners-title" className="scroll-mt-24 bg-ink py-12 text-ink-foreground sm:py-16">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-data text-[11px] font-bold uppercase tracking-[0.16em] text-lime">Мастера и цены</p>
            <h2 id="cleaners-title" className="mt-2 max-w-xl text-balance font-display text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
              Проверенные клинеры в {city.nameIn}
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-foreground/70">
              Органический порядок по доверию: проверенный профиль и подтверждённая внешняя оценка.
              Рекламные места помечены и на ранжирование не влияют.
            </p>
          </div>
          <Link
            href={categoryLandingHref(city.slug, service)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-lime hover:underline"
          >
            Вся категория
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
                  ? "border-lime bg-lime text-ink"
                  : "border-white/15 bg-white/5 text-ink-foreground/80 hover:border-lime/50 hover:text-ink-foreground",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="rounded-panel border border-white/10 bg-white/5 p-5 sm:p-6">
            <p className="font-data text-[11px] font-bold uppercase tracking-[0.14em] text-ink-foreground/60">
              {serviceInfo.label} · {city.name}
            </p>
            {estimate ? (
              <>
                <p className="mt-2 font-data text-3xl font-bold tracking-tight text-lime sm:text-4xl">
                  {formatMarketCurrency(estimate.priceMin, estimate.currency as "BYN" | "RUB" | "KZT")}
                  <span className="text-ink-foreground/50"> – </span>
                  {formatMarketCurrency(estimate.priceMax, estimate.currency as "BYN" | "RUB" | "KZT")}
                </p>
                <p className="mt-1 text-sm text-ink-foreground/60">
                  {estimate.unit ? `за ${estimate.unit}` : ""}
                  {estimate.note ? ` · ${estimate.note}` : ""}
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-ink-foreground/60">
                Ориентир цены для этого города появится позже — сметы собираем из открытых прайсов.
              </p>
            )}
            <p className="mt-4 text-xs leading-5 text-ink-foreground/50">
              Итоговая стоимость зависит от площади и загрязнения — точную цену называет компания после осмотра.
            </p>
          </div>

          <div>
            {sponsor || organic.length > 0 ? (
              <ul className="space-y-3">
                {sponsor && <CleanerCard key={sponsor.id} company={sponsor} service={service} countryCode={market.countryCode} sponsor />}
                {organic.map((company) => (
                  <CleanerCard key={company.id} company={company} service={service} countryCode={market.countryCode} />
                ))}
              </ul>
            ) : (
              <p className="rounded-panel border border-dashed border-white/15 bg-white/5 p-5 text-sm text-ink-foreground/70">
                В городе «{city.name}» компаний по услуге «{serviceInfo.label}» пока нет — случайные не подставляем.{" "}
                <Link href="/for-partners" className="font-semibold text-lime">
                  Разместить компанию
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function CleanerCard({
  company,
  service,
  countryCode,
  sponsor = false,
}: {
  company: Company;
  service: CategoryId;
  countryCode: string;
  sponsor?: boolean;
}) {
  const rating = externalRating(company);

  return (
    <li className="flex flex-col gap-3 rounded-panel border border-white/10 bg-card p-4 text-foreground sm:flex-row sm:items-center">
      <Link href={`/companies/${company.slug}`} className="flex min-w-0 flex-1 items-center gap-3">
        <CompanyAvatar id={company.id} name={company.name} size="md" className="shrink-0" />
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="truncate text-sm font-bold">{company.name}</span>
            {company.verified && <BadgeCheck className="size-4 shrink-0 text-teal" aria-label="Профиль проверен" />}
            {sponsor && <StatusBadge variant="sponsor" />}
          </span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-muted-foreground">
            {rating && (
              <span className="inline-flex items-center gap-1 font-data">
                <Star className="size-3 fill-star text-star" aria-hidden />
                {rating.value.toFixed(1)} · {rating.count} · {rating.source}
              </span>
            )}
            <span className="font-data">{companyPriceLabel(company)}</span>
          </span>
        </span>
      </Link>

      <div className="flex shrink-0 items-center gap-2">
        {company.phone && (
          <a
            href={telHref(company.phone)}
            onClick={() => trackClick({ companyId: company.id, categoryId: service, clickType: "phone", countryCode })}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-ink-foreground transition-transform active:scale-[0.98]"
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
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-semibold text-foreground transition-colors hover:border-ink/40"
          >
            <MessageCircle className="size-4" aria-hidden />
            Telegram
          </a>
        )}
      </div>
    </li>
  );
}
