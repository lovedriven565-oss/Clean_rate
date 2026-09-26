"use client";

import Link from "next/link";
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

export function CompanyCard({
  company,
  rank,
}: {
  company: Company;
  index?: number;
  rank?: number;
}) {
  const categoryNames = company.categories
    .map((id) => categories.find((c) => c.id === id)?.name ?? id)
    .slice(0, 3);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl">
      <RankBadge rank={rank} onlyTop className="absolute left-3 top-3 z-10 h-8 w-8 rounded-full text-sm shadow-sm" />

      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-muted/50">
        <CompanyAvatar id={company.id} name={company.name} size="xl" />
        {company.promoted && <StatusBadge variant="sponsor" className="absolute bottom-3 left-3" />}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-foreground">
                <Link href={`/companies/${company.slug}`} className="transition-colors hover:text-primary">
                  {company.name}
                </Link>
              </h3>
              {company.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" aria-label="Проверено" />}
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {company.address ? `${company.city}, ${company.address}` : company.city}
            </div>
          </div>
          <RatingBadge company={company} />
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">{company.description}</p>

        <div className="flex flex-wrap gap-1.5">
          {categoryNames.map((name) => (
            <Badge key={name} className="text-[10px]">
              {name}
            </Badge>
          ))}
        </div>

        <CompanyEquipmentTags brandIds={company.equipment} />

        <div className="mt-auto flex items-center justify-between gap-2 pt-2 text-sm text-muted-foreground">
          {company.priceFrom !== undefined ? (
            <>
              от <span className="font-semibold text-foreground">{formatPriceFrom(company.priceFrom, company.priceUnit)}</span>
            </>
          ) : (
            <span className="text-foreground">Цена по запросу</span>
          )}
        </div>

        <div className="border-t border-border/60 pt-3">
          <CompanyContactActions company={company} compact />
        </div>
      </div>
    </article>
  );
}
