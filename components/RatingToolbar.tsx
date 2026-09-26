"use client";

import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Check,
  Grid3X3,
  List,
  ListFilter,
  MapPin,
  Search,
  SlidersHorizontal,
  Wallet,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/primitives";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import { categories } from "@/lib/mock-data";
import type { CategoryId } from "@/lib/types";

export type SortKey = "relevance" | "rating" | "reviews" | "price" | "experience";
export type ViewMode = "list" | "grid";

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "relevance", label: "По релевантности" },
  { key: "rating", label: "По рейтингу" },
  { key: "reviews", label: "По отзывам" },
  { key: "price", label: "По цене" },
  { key: "experience", label: "По опыту" },
];

function categoryIcon(name: string): LucideIcon {
  return (LucideIcons as unknown as Record<string, LucideIcon>)[name] ?? LucideIcons.Sparkles;
}

interface RatingToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  activeCategory: CategoryId | "all";
  onCategoryChange: (value: CategoryId | "all") => void;
  activeCity: string;
  onCityChange: (value: string) => void;
  cities: string[];
  sortKey: SortKey;
  onSortChange: (value: SortKey) => void;
  verifiedOnly: boolean;
  onVerifiedChange: (value: boolean) => void;
  viewMode: ViewMode;
  onViewModeChange: (value: ViewMode) => void;
  priceMax: number | "all";
  onPriceMaxChange: (value: number | "all") => void;
  priceOptions: { value: number; label: string }[];
  hasActiveFilters: boolean;
  onReset: () => void;
  count: number;
}

export function RatingToolbar({
  query,
  onQueryChange,
  activeCategory,
  onCategoryChange,
  activeCity,
  onCityChange,
  cities,
  sortKey,
  onSortChange,
  verifiedOnly,
  onVerifiedChange,
  viewMode,
  onViewModeChange,
  priceMax,
  onPriceMaxChange,
  priceOptions,
  hasActiveFilters,
  onReset,
  count,
}: RatingToolbarProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-border bg-card/50 py-4 backdrop-blur-sm sm:py-5">
      <div className="container">
        {/* Top: count + view toggle */}
        <div className="mb-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <ListFilter className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">{count}</span>
            <span>
              {" "}
              компан
              {count % 10 === 1 && count % 100 !== 11
                ? "ия"
                : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 > 20)
                ? "ии"
                : "ий"}
            </span>
          </span>

          <div className="inline-flex items-center rounded-full border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                viewMode === "list"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Список"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                viewMode === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Плитка"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Row 1: search + city + sort */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Найти компанию по названию..."
              className="h-11 pl-10"
            />
          </div>

          <Select
            value={activeCity}
            onChange={onCityChange}
            icon={<MapPin className="h-4 w-4" />}
            options={[
              { value: "all", label: "Все города" },
              ...cities.map((city) => ({ value: city, label: city })),
            ]}
            className="sm:w-52"
          />

          <Select
            value={sortKey}
            onChange={(v) => onSortChange(v as SortKey)}
            icon={<SlidersHorizontal className="h-4 w-4" />}
            options={sortOptions.map((opt) => ({
              value: opt.key,
              label: opt.label,
            }))}
            className="sm:w-48"
          />

          {priceOptions.length > 0 && (
            <Select
              value={priceMax === "all" ? "all" : String(priceMax)}
              onChange={(v) => onPriceMaxChange(v === "all" ? "all" : Number(v))}
              icon={<Wallet className="h-4 w-4" />}
              options={[
                { value: "all", label: "Любая цена" },
                ...priceOptions.map((opt) => ({ value: String(opt.value), label: opt.label })),
              ]}
              className="sm:w-44"
            />
          )}
        </div>

        {/* Row 2: category pills */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => onCategoryChange("all")}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              activeCategory === "all"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            Все
          </button>
          {categories.map((category) => {
            const Icon = categoryIcon(category.icon);
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  activeCategory === category.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {category.name}
              </button>
            );
          })}
        </div>

        {/* Row 3: verified + reset */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            onClick={() => onVerifiedChange(!verifiedOnly)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              verifiedOnly
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            <Check className={cn("h-3.5 w-3.5", !verifiedOnly && "opacity-0")} />
            Только проверенные
          </button>

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
              Сбросить
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
