"use client";

import Link from "next/link";
import { BadgeCheck, Crown, Globe, MapPin, MessageCircle, Phone, Star, TrendingUp } from "lucide-react";
import type { Company } from "@/lib/types";
import { Badge } from "@/components/ui/primitives";
import { CompanyAvatar } from "@/components/CompanyAvatar";
import { CompanyEquipmentTags } from "@/components/CompanyEquipmentTags";
import { formatNumber, formatPriceFrom, formatRating } from "@/lib/format";
import { categories } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { trackClick } from "@/lib/analytics";

const rankClass: Record<number, string> = {
  1: "bg-amber-100 text-amber-700",
  2: "bg-slate-100 text-slate-600",
  3: "bg-orange-100 text-orange-700",
};

function RankBadge({ rank }: { rank?: number }) {
  if (!rank || rank > 3) return null;
  return (
    <span
      className={cn(
        "absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shadow-sm",
        rankClass[rank]
      )}
    >
      {rank === 1 ? <Crown className="h-4 w-4" /> : rank}
    </span>
  );
}

function RatingBadge({ company }: { company: Company }) {
  const hasVerified =
    company.reviewCount > 0 &&
    (company.ratingSource === "google" || company.ratingSource === "yandex");

  if (hasVerified) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
        {formatRating(company.baseRating)}
        <span className="text-amber-600/70">({formatNumber(company.reviewCount)})</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">
      <TrendingUp className="h-3 w-3" />
      {company.ratingSource === "new" ? "Новый партнёр" : "Пока нет отзывов"}
    </span>
  );
}

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
      <RankBadge rank={rank} />

      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-muted/50">
        <CompanyAvatar id={company.id} name={company.name} size="xl" />
        {company.promoted && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-accent/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
            Партнёр
          </span>
        )}
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
              {company.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}
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

        <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
          {company.phone && (
            <a
              href={`tel:${company.phone.replace(/[^\d+]/g, "")}`}
              onClick={(e) => {
                e.stopPropagation();
                trackClick({ companyId: company.id, categoryId: company.categories[0], clickType: "phone" });
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Phone className="h-3.5 w-3.5" />
              {company.phone}
            </a>
          )}
          {company.websiteUrl && (
            <a
              href={company.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                trackClick({ companyId: company.id, categoryId: company.categories[0], clickType: "website" });
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Globe className="h-3.5 w-3.5" />
              Сайт
            </a>
          )}
          {company.telegramUrl && (
            <a
              href={company.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                trackClick({ companyId: company.id, categoryId: company.categories[0], clickType: "telegram" });
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Telegram
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
