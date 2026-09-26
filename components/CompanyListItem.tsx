"use client";

import Link from "next/link";
import { useMemo } from "react";
import { BadgeCheck, MapPin } from "lucide-react";
import type { Company } from "@/lib/types";
import { Badge } from "@/components/ui/primitives";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CompanyAvatar } from "@/components/CompanyAvatar";
import { RankBadge, RatingBadge } from "@/components/CompanyBadges";
import { CompanyContactActions } from "@/components/CompanyContactActions";
import { CompanyEquipmentTags } from "@/components/CompanyEquipmentTags";
import { formatPriceFrom } from "@/lib/format";
import { categories } from "@/lib/mock-data";

export function CompanyListItem({
  company,
  rank,
}: {
  company: Company;
  index?: number;
  rank?: number;
}) {
  const categoryLabels = useMemo(
    () =>
      company.categories
        .map((id) => categories.find((c) => c.id === id)?.name ?? id)
        .slice(0, 3),
    [company.categories]
  );

  return (
    <article className="group relative rounded-2xl border border-border bg-card p-4 transition-[border-color,box-shadow] duration-200 hover:border-primary/20 hover:shadow-lg sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        {/* Left: rank + avatar */}
        <div className="flex items-start gap-3 sm:flex-col sm:items-center sm:gap-2">
          <RankBadge rank={rank} className="h-7 w-7 rounded-lg" />
          <CompanyAvatar id={company.id} name={company.name} size="md" />
        </div>

        {/* Middle: info */}
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="font-display text-lg font-semibold text-foreground">
                  <Link href={`/companies/${company.slug}`} className="transition-colors hover:text-primary">
                    {company.name}
                  </Link>
                </h3>
                {company.verified && (
                  <BadgeCheck className="h-4 w-4 shrink-0 text-primary" aria-label="Проверено" />
                )}
                {company.promoted && <StatusBadge variant="sponsor" />}
              </div>
              <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {company.address ? `${company.city}, ${company.address}` : company.city}
              </div>
            </div>

            <div className="mt-2 sm:mt-0">
              <RatingBadge company={company} />
            </div>
          </div>

          <p className="line-clamp-2 text-sm text-muted-foreground">{company.description}</p>

          <div className="flex flex-wrap items-center gap-2">
            {categoryLabels.map((name) => (
              <Badge key={name} className="text-[10px]">
                {name}
              </Badge>
            ))}
          </div>

          {(company.experienceYears || (company.guarantees && company.guarantees.length > 0)) && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {company.experienceYears && (
                <span className="rounded-full bg-muted px-2 py-1">{company.experienceYears} лет опыта</span>
              )}
              {company.guarantees?.slice(0, 2).map((g) => (
                <span key={g} className="rounded-full bg-primary/5 px-2 py-1 text-primary">
                  {g}
                </span>
              ))}
            </div>
          )}

          <CompanyEquipmentTags brandIds={company.equipment} />

          <div className="text-sm text-muted-foreground">
            {company.priceFrom !== undefined ? (
              <>
                от{" "}
                <span className="font-semibold text-foreground">
                  {formatPriceFrom(company.priceFrom, company.priceUnit)}
                </span>
              </>
            ) : (
              <span className="text-foreground">Цена по запросу</span>
            )}
          </div>
        </div>

        {/* Right: actions */}
        <CompanyContactActions company={company} compact className="sm:ml-auto sm:shrink-0" />
      </div>
    </article>
  );
}
