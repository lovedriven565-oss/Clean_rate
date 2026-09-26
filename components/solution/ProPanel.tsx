"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock, MessageCircle, Phone, Sparkles, Star } from "lucide-react";
import { CompanyAvatar } from "@/components/CompanyAvatar";
import { useRegion } from "@/components/providers/RegionProvider";
import { StickyCallBar } from "@/components/StickyCallBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { trackClick } from "@/lib/analytics";
import { formatRating } from "@/lib/format";
import type { Company, PriceEstimate, Solution } from "@/lib/types";
import { PriceRange } from "./PriceRange";

const COMPANY_LIMIT = 3;

function pickCompanies(companies: Company[], cityNames: string[], solution: Solution): Company[] {
  const inMarket = companies.filter((c) => cityNames.includes(c.city));
  const score = (c: Company) =>
    (solution.relatedCategory && c.categories.includes(solution.relatedCategory) ? 4 : 0) +
    (c.promoted ? 2 : 0) +
    (c.verified ? 1 : 0) +
    (c.reviewCount > 0 ? Math.min(c.baseRating / 5, 1) : 0);
  return [...inMarket].sort((a, b) => score(b) - score(a)).slice(0, COMPANY_LIMIT);
}

export function ProPanel({
  solution,
  companies,
  estimates,
}: {
  solution: Solution;
  companies: Company[];
  estimates: PriceEstimate[];
}) {
  const { market, city } = useRegion();
  const cityNames = market.cities.map((c) => c.name);
  const picked = pickCompanies(companies, cityNames, solution);
  const ratingHref = solution.relatedCategory ? `/rating?category=${solution.relatedCategory}` : "/rating";

  return (
    <section
      id="pro"
      aria-labelledby="pro-title"
      className="data-surface scroll-mt-32 flex h-full min-w-0 flex-col rounded-[1.75rem] border border-border p-6 sm:p-8"
    >
      <header className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Путь 2
          </span>
          <h2 id="pro-title" className="mt-2 font-display text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
            Вызвать мастера
          </h2>
        </div>
        {solution.proTimeNote && (
          <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-medium text-muted-foreground sm:inline-flex">
            <Clock className="h-3.5 w-3.5" />
            {solution.proTimeNote}
          </span>
        )}
      </header>

      <p className="mt-6 text-[15px] leading-7 text-foreground">{solution.whenToCallPro}</p>

      {solution.proTimeNote && (
        <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground sm:hidden">
          <Clock className="h-3.5 w-3.5" />
          {solution.proTimeNote}
        </p>
      )}

      <PriceRange estimates={estimates} className="mt-6" />

      <div className="mt-8 flex items-baseline justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Компании · {city.name}
        </span>
        <Link href={ratingHref} className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
          Весь рейтинг
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {picked.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {picked.map((company) => (
            <li key={company.id}>
              <CompanyRow company={company} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-3 rounded-2xl border border-dashed border-border bg-card/60 p-5 text-sm leading-6 text-muted-foreground">
          В городе {city.name} компании ещё подключаются к платформе.{" "}
          <Link href="/for-partners" className="font-semibold text-primary">
            Разместить компанию
          </Link>
        </div>
      )}

      <p className="mt-6 text-xs leading-5 text-muted-foreground">
        Контакт прямой: платформа не берёт комиссию и не передаёт ваши данные. Спонсорские размещения отмечены открыто и не влияют на оценку.
      </p>

      <StickyCallBar
        label={picked[0] ? picked[0].name : `Мастера · ${city.name}`}
        phone={picked[0]?.phone}
        telegramUrl={picked[0]?.telegramUrl}
        companyId={picked[0]?.id}
        categoryId={picked[0]?.categories[0]}
        fallbackHref={ratingHref}
        fallbackLabel="Смотреть рейтинг"
      />
    </section>
  );
}

function CompanyRow({ company }: { company: Company }) {
  const hasRating =
    company.reviewCount > 0 && (company.ratingSource === "google" || company.ratingSource === "yandex");
  const categoryId = company.categories[0];

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-4 transition-colors hover:border-primary/30 sm:flex-row sm:items-center">
      <Link href={`/companies/${company.slug}`} className="flex min-w-0 flex-1 items-center gap-3">
        <CompanyAvatar id={company.id} name={company.name} size="md" className="shrink-0" />
        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-foreground">{company.name}</span>
            {company.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}
            {company.promoted && <StatusBadge variant="sponsor" />}
          </span>
          <span className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            {hasRating ? (
              <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {formatRating(company.baseRating)} · {company.reviewCount}
              </span>
            ) : (
              <span>Пока нет отзывов</span>
            )}
            {company.experienceYears ? <span>· {company.experienceYears} лет опыта</span> : null}
          </span>
        </span>
      </Link>

      <div className="flex shrink-0 items-center gap-2">
        {company.phone && (
          <a
            href={`tel:${company.phone.replace(/[^\d+]/g, "")}`}
            onClick={() => trackClick({ companyId: company.id, categoryId, clickType: "phone" })}
            className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 sm:flex-none"
          >
            <Phone className="h-3.5 w-3.5" />
            Позвонить
          </a>
        )}
        {company.telegramUrl && (
          <a
            href={company.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Telegram ${company.name}`}
            onClick={() => trackClick({ companyId: company.id, categoryId, clickType: "telegram" })}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
        )}
      </div>
    </article>
  );
}
