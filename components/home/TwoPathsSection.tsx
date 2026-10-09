"use client";

import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Hand, Star, Wrench } from "lucide-react";
import { PhoneButton } from "@/components/PhoneButton";
import { useRegion } from "@/components/providers/RegionProvider";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SpotlightCard } from "@/components/ui/fx";
import { buildProCompanies, companyPriceLabel, externalRating } from "@/lib/solutions/diagnostic";
import type { Company, Solution } from "@/lib/types";

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

/**
 * «Два пути» для протокола дня: чеклист самому и мастера региона посетителя.
 * Спонсор выводится отдельно помеченным слотом — без номера и вне органического порядка.
 */
export function TwoPathsSection({ solution, companies }: { solution: Solution | null; companies: Company[] }) {
  const { market } = useRegion();
  if (!solution) return null;
  const cityNames = market.cities.map((c) => c.name);
  const pro = buildProCompanies(companies, solution, { cities: cityNames });

  return (
    <section aria-labelledby="paths-title" className="scroll-mt-24">
      <h2 id="paths-title" className="text-balance font-display text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl">
        Два пути для задачи «{solution.title}»
      </h2>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <SpotlightCard className="p-5 sm:p-7">
          <p className="flex items-center gap-2 text-sm font-semibold text-link">
            <Hand className="size-4" aria-hidden /> Сделать самому
          </p>
          <ol className="mt-4 space-y-4">
            {solution.diySteps.slice(0, 3).map((step) => (
              <li key={step.order} className="grid grid-cols-[2rem_1fr] gap-3">
                <span className="font-data text-lg font-semibold text-link">
                  {String(step.order).padStart(2, "0")}
                </span>
                <span className="text-[15px] leading-relaxed text-foreground">{step.instruction}</span>
              </li>
            ))}
          </ol>
          <Link
            href={`/solutions/${solution.slug}`}
            className="mt-5 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-link"
          >
            Полный протокол
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </SpotlightCard>

        <SpotlightCard className="p-5 sm:p-7">
          <p className="flex items-center gap-2 text-sm font-semibold text-link">
            <Wrench className="size-4" aria-hidden /> Вызвать мастера
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{solution.whenToCallPro}</p>
          {pro.sponsor || pro.organic.length > 0 ? (
            <ul className="mt-4">
              {pro.sponsor && <CompanyRow key={pro.sponsor.id} company={pro.sponsor} sponsor />}
              {pro.organic.map((company) => (
                <CompanyRow key={company.id} company={company} />
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              В вашем регионе компаний для этой задачи пока нет.{" "}
              <Link href="/for-partners" className="font-semibold text-link">
                Разместить компанию
              </Link>
            </p>
          )}
          <Link
            href="/rating"
            className="mt-5 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-link"
          >
            Как считаем рейтинг
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </SpotlightCard>
      </div>
    </section>
  );
}
