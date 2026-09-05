"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  BadgeCheck,
  Crown,
  Globe,
  MapPin,
  MessageCircle,
  Phone,
  Star,
  TrendingUp,
} from "lucide-react";
import type { Company } from "@/lib/types";
import { Badge } from "@/components/ui/primitives";
import { CompanyAvatar } from "@/components/CompanyAvatar";
import { CompanyEquipmentTags } from "@/components/CompanyEquipmentTags";
import { formatNumber, formatPriceFrom, formatRating } from "@/lib/format";
import { categories } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { trackClick } from "@/lib/analytics";

const rankMedal: Record<
  number,
  { bg: string; icon?: React.ReactNode; label?: string }
> = {
  1: { bg: "bg-amber-100 text-amber-700", icon: <Crown className="h-3.5 w-3.5" />, label: "1" },
  2: { bg: "bg-slate-100 text-slate-600", label: "2" },
  3: { bg: "bg-orange-100 text-orange-700", label: "3" },
};

function rankClass(rank?: number) {
  if (!rank || rank > 3) return "bg-muted text-muted-foreground";
  return rankMedal[rank].bg;
}

function RankBadge({ rank }: { rank?: number }) {
  if (!rank) return null;
  const medal = rank <= 3 ? rankMedal[rank] : undefined;
  return (
    <span
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
        rankClass(rank)
      )}
    >
      {medal?.icon ?? rank}
    </span>
  );
}

function RatingBadge({ company }: { company: Company }) {
  const hasVerified =
    company.reviewCount > 0 &&
    (company.ratingSource === "google" || company.ratingSource === "yandex");

  if (hasVerified) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        {formatRating(company.baseRating)}
        <span className="text-amber-600/70">({formatNumber(company.reviewCount)})</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
      <TrendingUp className="h-3 w-3" />
      {company.ratingSource === "new" ? "Новый партнёр" : "Пока нет отзывов"}
    </span>
  );
}

function ContactAction({
  href,
  icon: Icon,
  onClick,
  children,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
    >
      <Icon className="h-3.5 w-3.5" />
      {children}
    </a>
  );
}

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
          <RankBadge rank={rank} />
          <CompanyAvatar id={company.id} name={company.name} size="md" />
        </div>

        {/* Middle: info */}
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-display text-lg font-semibold text-foreground">
                  <Link href={`/companies/${company.slug}`} className="transition-colors hover:text-primary">
                    {company.name}
                  </Link>
                </h3>
                {company.verified && (
                  <BadgeCheck className="h-4 w-4 shrink-0 text-primary" aria-label="Проверено" />
                )}
                {company.promoted && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
                    Партнёр
                  </span>
                )}
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
        <div className="flex flex-row flex-wrap items-center gap-2 sm:ml-auto sm:flex-col sm:items-stretch sm:gap-2">
          {company.phone && (
            <ContactAction
              href={`tel:${company.phone.replace(/[^\d+]/g, "")}`}
              icon={Phone}
              onClick={() => trackClick({ companyId: company.id, categoryId: company.categories[0], clickType: "phone" })}
            >
              {company.phone}
            </ContactAction>
          )}
          {company.websiteUrl && (
            <ContactAction
              href={company.websiteUrl}
              icon={Globe}
              onClick={() => trackClick({ companyId: company.id, categoryId: company.categories[0], clickType: "website" })}
            >
              Сайт
            </ContactAction>
          )}
          {company.telegramUrl && (
            <ContactAction
              href={company.telegramUrl}
              icon={MessageCircle}
              onClick={() => trackClick({ companyId: company.id, categoryId: company.categories[0], clickType: "telegram" })}
            >
              Telegram
            </ContactAction>
          )}
        </div>
      </div>
    </article>
  );
}
