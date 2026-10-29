"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, Star } from "lucide-react";
import { PhoneButton } from "@/components/PhoneButton";
import { useRegion } from "@/components/providers/RegionProvider";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  buildProCompanies,
  companyPriceLabel,
  externalRating,
  rankOrganicCompanies,
} from "@/lib/solutions/diagnostic";
import type { Brand, Company, Solution } from "@/lib/types";

const BRAND_LIMIT = 3;

function CompanyRow({ company, sponsor }: { company: Company; sponsor?: boolean }) {
  const rating = externalRating(company);
  return (
    <li className="flex items-center gap-3 border-t border-border py-3 first:border-t-0 first:pt-0 last:pb-0">
      <div className="min-w-0 flex-1">
        <Link
          href={`/companies/${company.slug}`}
          className="flex items-center gap-1.5 text-[15px] font-semibold text-foreground hover:underline"
        >
          <span className="truncate">{company.name}</span>
          {company.verified && <BadgeCheck className="size-4 shrink-0 text-link" aria-label="Профиль проверен" />}
          {sponsor && <StatusBadge variant="sponsor" />}
        </Link>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          {rating && (
            <span className="inline-flex items-center gap-1 font-data">
              <Star className="size-3 fill-current text-star" aria-hidden />
              {rating.value.toFixed(1)} · {rating.count} · {rating.source}
            </span>
          )}
          <span className="font-data">{companyPriceLabel(company)}</span>
        </p>
      </div>
      {company.phone && (
        <span className="shrink-0">
          <PhoneButton phone={company.phone} companyId={company.id} categoryId={company.categories[0]} compact />
        </span>
      )}
    </li>
  );
}

function BrandRow({ brand }: { brand: Brand }) {
  return (
    <li className="flex items-center gap-3 border-t border-border py-3 first:border-t-0 first:pt-0 last:pb-0">
      <span
        aria-hidden
        className="grid size-10 shrink-0 place-items-center rounded-control bg-muted text-sm font-extrabold text-link"
      >
        {brand.name[0]}
      </span>
      <div className="min-w-0 flex-1">
        <Link href={`/brands/${brand.slug}`} className="flex items-center gap-1.5 text-[15px] font-semibold text-foreground hover:underline">
          <span className="truncate">{brand.name}</span>
          {brand.isSponsor && <StatusBadge variant="sponsor" />}
        </Link>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{brand.tagline}</p>
      </div>
      <Link
        href={`/brands/${brand.slug}`}
        className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-full border border-border bg-card px-4 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-link"
      >
        Открыть
        <ArrowUpRight className="size-3.5" aria-hidden />
      </Link>
    </li>
  );
}

/**
 * «Мастера и компании города» + «Бренды и средства».
 * Компании — органический порядок региона посетителя для контекста выбранной задачи;
 * спонсор — отдельной помеченной строкой. Пустой регион — честное состояние без подстановок.
 */
export function MastersBrandsSection({
  solution,
  companies,
  brands,
}: {
  solution: Solution | null;
  companies: Company[];
  brands: Brand[];
}) {
  const { market, city } = useRegion();
  const cityNames = market.cities.map((c) => c.name);
  const inRegion = companies.filter((c) => cityNames.includes(c.city));
  const pro = solution
    ? buildProCompanies(companies, solution, { cities: cityNames })
    : { sponsor: null, organic: rankOrganicCompanies(inRegion).slice(0, 3) };
  const shownBrands = brands.slice(0, BRAND_LIMIT);

  return (
    <section id="pros" aria-labelledby="pros-title" className="scroll-mt-24">
      <div className="mb-5">
        <p className="font-data text-xs font-semibold uppercase tracking-[0.16em] text-link">Два пути</p>
        <h2
          id="pros-title"
          className="mt-1.5 text-balance font-display text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl"
        >
          Мастера и бренды
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Органический порядок не зависит от оплаты; спонсорские места помечены. Контакт с компанией — прямой, без посредников.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div className="data-surface rounded-panel p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-lg font-bold tracking-tight text-foreground">
              Мастера и компании города
            </h3>
            <Link href="/rating" className="inline-flex items-center gap-1 text-sm font-semibold text-link hover:underline">
              Весь рейтинг города
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <p className="mt-2 font-data text-xs text-muted-foreground">
            Контекст: {solution ? `задача «${solution.title}»` : "все задачи"} · {city.name}
          </p>
          {pro.sponsor || pro.organic.length > 0 ? (
            <ul className="mt-3">
              {pro.sponsor && <CompanyRow key={pro.sponsor.id} company={pro.sponsor} sponsor />}
              {pro.organic.map((company) => (
                <CompanyRow key={company.id} company={company} />
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-panel border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
              В городе «{city.name}» проверенных компаний для этой задачи пока нет — случайные не подставляем.{" "}
              <Link href="/for-partners" className="font-semibold text-link">
                Разместить компанию
              </Link>
            </p>
          )}
        </div>

        <div className="data-surface rounded-panel p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-lg font-bold tracking-tight text-foreground">
              Бренды и средства
            </h3>
            <Link href="/brands" className="inline-flex items-center gap-1 text-sm font-semibold text-link hover:underline">
              Витрина брендов
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Без выдуманных баллов — методология «Индекса доверия профи» открыта на странице брендов.
          </p>
          {shownBrands.length > 0 ? (
            <ul className="mt-3">
              {shownBrands.map((brand) => (
                <BrandRow key={brand.id} brand={brand} />
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-panel border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
              Витрина брендов наполняется — проверенные производители появятся здесь.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
