import { Crown, Star, TrendingUp } from "lucide-react";
import type { Company } from "@/lib/types";
import { formatNumber, formatRating } from "@/lib/format";
import { cn } from "@/lib/utils";

const rankClass: Record<number, string> = {
  1: "bg-sponsor text-sponsor-foreground",
  2: "bg-muted text-foreground border border-border/80",
  3: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
};

/** Медаль позиции в органическом рейтинге. `onlyTop` скрывает места ниже третьего. */
export function RankBadge({ rank, onlyTop = false, className }: { rank?: number; onlyTop?: boolean; className?: string }) {
  if (!rank || (onlyTop && rank > 3)) return null;
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center text-xs font-bold",
        rankClass[rank] ?? "bg-muted text-muted-foreground",
        className
      )}
    >
      {rank === 1 ? <Crown className="h-3.5 w-3.5" /> : rank}
    </span>
  );
}

export function hasVerifiedRating(company: Company) {
  return company.reviewCount > 0 && (company.ratingSource === "google" || company.ratingSource === "yandex");
}

/** Оценка с открытым источником или честная заглушка, если отзывов ещё нет. */
export function RatingBadge({ company, className }: { company: Company; className?: string }) {
  if (hasVerifiedRating(company)) {
    return (
      <span className={cn("inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/70 dark:text-amber-200", className)}>
        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        {formatRating(company.baseRating)}
        <span className="text-amber-700/80 dark:text-amber-300/80">({formatNumber(company.reviewCount)})</span>
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground", className)}>
      <TrendingUp className="h-3 w-3" />
      {company.ratingSource === "new" ? "Новая компания" : "Пока нет отзывов"}
    </span>
  );
}
