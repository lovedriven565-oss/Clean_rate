import Link from "next/link";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import type { Company } from "@/lib/types";
import { Badge } from "@/components/ui/primitives";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CompanyAvatar } from "@/components/CompanyAvatar";
import { CompanyContactActions } from "@/components/CompanyContactActions";
import { calculateOrganicScore, hasPublishedRating, ratingSourceLabel } from "@/lib/rating";
import { formatCompanyPriceFrom, formatNumber, formatRating } from "@/lib/format";
import { getCategoryName } from "@/lib/categories";
import { cn } from "@/lib/utils";

const rankTone: Record<number, string> = {
  1: "bg-sponsor text-sponsor-foreground",
  2: "bg-muted text-foreground border border-border/80",
  3: "bg-star/15 text-ad",
};

const ROW_GRID = "lg:grid-cols-[2.5rem_3rem_minmax(0,1fr)_5.5rem_8.5rem_auto]";

/**
 * Таблица компаний в духе gg.deals: моно-цифры, источник рейтинга у отзывов,
 * контакты справа. `ranked` нумерует позиции — передавать только для органического
 * порядка: платное размещение позицию не покупает и ранга не получает.
 */
export function CompanyTable({
  companies,
  ranked = true,
  className,
}: {
  companies: Company[];
  ranked?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("data-surface overflow-hidden rounded-panel", className)}>
      <div
        aria-hidden
        className={cn(
          "hidden items-center gap-5 border-b border-border bg-muted/50 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground lg:grid",
          ROW_GRID
        )}
      >
        <span>№</span>
        <span />
        <span>Компания</span>
        <span className="text-right">Балл</span>
        <span>Отзывы</span>
        <span className="text-right">Цена и контакты</span>
      </div>
      <ol className="divide-y divide-border">
        {companies.map((company, index) => (
          <CompanyTableRow key={company.id} company={company} rank={ranked ? index + 1 : undefined} />
        ))}
      </ol>
    </div>
  );
}

function CompanyTableRow({ company, rank }: { company: Company; rank?: number }) {
  const score = calculateOrganicScore(company);
  const published = hasPublishedRating(company);
  const categoryLabels = company.categories.map(getCategoryName).slice(0, 3);

  return (
    <li className="px-4 py-4 transition-colors hover:bg-muted/40 sm:px-5">
      <div className={cn("lg:grid lg:items-center lg:gap-5", ROW_GRID)}>
        {/* Ранг + аватар: на мобильных одна узкая колонка, на lg — две колонки сетки */}
        <div className="flex items-start gap-3 lg:contents">
          <div className="flex shrink-0 flex-col items-center gap-1.5 lg:contents">
            <span
              aria-label={rank ? `Место ${rank}` : "Вне органического ранжирования"}
              className={cn(
                "font-data flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                rank ? (rankTone[rank] ?? "bg-muted text-muted-foreground") : "text-muted-foreground/60"
              )}
            >
              {rank ?? "—"}
            </span>
            <CompanyAvatar id={company.id} name={company.name} size="md" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="font-display text-base font-semibold text-foreground">
                <Link href={`/companies/${company.slug}`} className="transition-colors hover:text-link">
                  {company.name}
                </Link>
              </h3>
              {company.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" aria-label="Проверено" />}
              {company.promoted && <StatusBadge variant="sponsor" />}
            </div>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              {company.address ? `${company.city}, ${company.address}` : company.city}
              {company.experienceYears ? ` · ${company.experienceYears} лет опыта` : ""}
            </p>
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground lg:text-sm">{company.description}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {categoryLabels.map((name) => (
                <Badge key={name} className="text-[10px]">
                  {name}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Метрики: на мобильных строкой, на lg — колонки «Балл» и «Отзывы» */}
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 lg:contents">
          <span className="flex items-baseline gap-1.5 lg:block lg:text-right">
            <span className="font-data text-base font-semibold text-foreground lg:text-lg">{score ?? "—"}</span>
            <span className="text-[10px] text-muted-foreground lg:hidden">балл</span>
            {score !== null && <span className="hidden text-[10px] text-muted-foreground lg:block">из 100</span>}
          </span>
          {published ? (
            <span className="flex items-center gap-1.5 lg:block">
              <span className="font-data inline-flex items-center gap-1 text-sm font-semibold text-foreground">
                <Star className="h-3.5 w-3.5 fill-star text-star" aria-hidden />
                {formatRating(company.baseRating)}
                <span className="font-normal text-muted-foreground">({formatNumber(company.reviewCount)})</span>
              </span>
              <span className="text-[10px] text-muted-foreground lg:block">{ratingSourceLabel(company.ratingSource)}</span>
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              {company.ratingSource === "new" ? "Новая компания" : "Пока нет отзывов"}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 lg:mt-0 lg:flex-col lg:items-end lg:justify-center lg:gap-1.5">
          <span className="font-data text-base font-semibold text-foreground">
            {company.priceFrom !== undefined ? `от ${formatCompanyPriceFrom(company.priceFrom, company)}` : "По запросу"}
          </span>
          <CompanyContactActions company={company} compact />
        </div>
      </div>
    </li>
  );
}
