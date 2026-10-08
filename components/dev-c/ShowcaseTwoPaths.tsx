"use client";

import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Hand, Phone, Star, Wrench } from "lucide-react";
import {
  buildProCompanies,
  companyPriceLabel,
  externalRating,
  telHref,
} from "@/components/dev/diagnostic-model";
import type { Company, Solution } from "@/lib/types";
import { SpotlightCard } from "./Fx";

function CompanyRow({ company, sponsor }: { company: Company; sponsor?: boolean }) {
  const rating = externalRating(company);
  return (
    <li className="flex items-center gap-3 border-t c-line py-3 first:border-t-0 first:pt-0 last:pb-0">
      <div className="min-w-0 flex-1">
        <Link href={`/companies/${company.slug}`} className="flex items-center gap-1.5 truncate text-[15px] font-semibold hover:underline">
          {company.name}
          {company.verified && <BadgeCheck className="size-4 shrink-0 c-link" aria-label="Профиль проверен" />}
        </Link>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs c-ink2">
          {sponsor && <span className="c-ad font-semibold">Реклама</span>}
          {rating && (
            <span className="inline-flex items-center gap-1 font-mono tabular-nums">
              <Star className="size-3 fill-current" aria-hidden />
              {rating.value.toFixed(1)} · {rating.count} · {rating.source}
            </span>
          )}
          <span className="font-mono tabular-nums">{companyPriceLabel(company)}</span>
        </p>
      </div>
      {company.phone && (
        <a
          href={telHref(company.phone)}
          aria-label={`Позвонить: ${company.name}`}
          className="c-accent-bg grid size-11 shrink-0 place-items-center rounded-full transition-transform active:scale-[0.96]"
        >
          <Phone className="size-4" aria-hidden />
        </a>
      )}
    </li>
  );
}

/** Bento «Два пути» для выбранного протокола: чеклист самому и мастера Минска. */
export function ShowcaseTwoPaths({ solution, companies }: { solution: Solution | null; companies: Company[] }) {
  if (!solution) return null;
  const pro = buildProCompanies(companies, solution);

  return (
    <section aria-labelledby="paths-title" className="scroll-mt-24">
      <h2 id="paths-title" className="text-balance text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
        Два пути для задачи «{solution.title}»
      </h2>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <SpotlightCard className="p-5 sm:p-7">
          <p className="flex items-center gap-2 text-sm font-semibold c-link">
            <Hand className="size-4" aria-hidden /> Сделать самому
          </p>
          <ol className="mt-4 space-y-4">
            {solution.diySteps.slice(0, 3).map((step) => (
              <li key={step.order} className="grid grid-cols-[2rem_1fr] gap-3">
                <span className="font-mono text-lg font-semibold tabular-nums c-link">{String(step.order).padStart(2, "0")}</span>
                <span className="text-[15px] leading-relaxed">{step.instruction}</span>
              </li>
            ))}
          </ol>
          <Link
            href={`/solutions/${solution.slug}`}
            className="c-link mt-5 inline-flex min-h-11 items-center gap-1 text-sm font-semibold"
          >
            Полный протокол
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </SpotlightCard>

        <SpotlightCard className="p-5 sm:p-7">
          <p className="flex items-center gap-2 text-sm font-semibold c-link">
            <Wrench className="size-4" aria-hidden /> Вызвать мастера
          </p>
          <p className="mt-3 text-[13px] leading-relaxed c-ink2">{solution.whenToCallPro}</p>
          {pro.sponsor || pro.organic.length > 0 ? (
            <ul className="mt-4">
              {pro.sponsor && <CompanyRow company={pro.sponsor} sponsor />}
              {pro.organic.map((company) => (
                <CompanyRow key={company.id} company={company} />
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm c-ink2">В вашем городе компаний для этой задачи пока нет.</p>
          )}
        </SpotlightCard>
      </div>
    </section>
  );
}
