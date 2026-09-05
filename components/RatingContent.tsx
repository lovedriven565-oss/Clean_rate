"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CompanyCard } from "@/components/CompanyCard";
import { CompanyListItem } from "@/components/CompanyListItem";
import { RatingToolbar, type SortKey, type ViewMode } from "@/components/RatingToolbar";
import { RatingEmptyState } from "@/components/RatingEmptyState";
import { calculateOrganicScore, calculateRelevanceScore } from "@/lib/rating";
import type { Category, CategoryId, Company } from "@/lib/types";

interface RatingContentProps {
  companies: Company[];
  categories: Category[];
}

function RatingContentInner({ companies, categories }: RatingContentProps) {
  const searchParams = useSearchParams();

  const categoryParam = searchParams.get("category");
  const initialCategory = categories.some((category) => category.id === categoryParam)
    ? (categoryParam as CategoryId)
    : "all";
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [activeCategory, setActiveCategory] = useState<CategoryId | "all">(initialCategory);
  const [activeCity, setActiveCity] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("relevance");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const cities = useMemo(
    () => Array.from(new Set(companies.map((c) => c.city))).sort(),
    [companies]
  );

  const hasActiveFilters =
    activeCategory !== "all" || activeCity !== "all" || verifiedOnly || query.length > 0;

  const filtered = useMemo(() => {
    let list = companies.filter((c) => {
      const matchesQuery = c.name.toLowerCase().includes(query.trim().toLowerCase());
      const matchesCategory = activeCategory === "all" || c.categories.includes(activeCategory);
      const matchesCity = activeCity === "all" || c.city === activeCity;
      const matchesVerified = !verifiedOnly || c.verified;
      return matchesQuery && matchesCategory && matchesCity && matchesVerified;
    });

    list = [...list].sort((a, b) => {
      if (sortKey === "relevance") return calculateRelevanceScore(b) - calculateRelevanceScore(a);
      if (sortKey === "rating") {
        return (calculateOrganicScore(b) ?? -1) - (calculateOrganicScore(a) ?? -1) || b.reviewCount - a.reviewCount;
      }
      if (sortKey === "reviews") return b.reviewCount - a.reviewCount;
      if (sortKey === "experience") return (b.experienceYears ?? 0) - (a.experienceYears ?? 0);
      return (a.priceFrom ?? Infinity) - (b.priceFrom ?? Infinity);
    });

    return list;
  }, [companies, query, activeCategory, activeCity, sortKey, verifiedOnly]);

  function resetFilters() {
    setQuery("");
    setActiveCategory("all");
    setActiveCity("all");
    setVerifiedOnly(false);
    setSortKey("relevance");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1">
        <section className="bg-fresh relative overflow-hidden border-b border-border">
          <div className="bg-grid-fade absolute inset-0" aria-hidden />
          <div className="container relative py-12 sm:py-18">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Открытая методология</span>
            <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="max-w-3xl font-display text-3xl font-extrabold tracking-[-0.04em] text-foreground sm:text-5xl">
                  Рейтинг клининговых компаний
                </h1>
                <p className="mt-4 max-w-2xl text-muted-foreground">
                  Органическая оценка не зависит от оплаты. Источник рейтинга и коммерческая маркировка показываются отдельно.
                </p>
              </div>
              <Link href="/rating/methodology" className="inline-flex shrink-0 items-center justify-center rounded-full border border-primary/25 bg-card/80 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5">
                Как рассчитывается рейтинг
              </Link>
            </div>
          </div>
        </section>

        <RatingToolbar
          query={query}
          onQueryChange={setQuery}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          activeCity={activeCity}
          onCityChange={setActiveCity}
          cities={cities}
          sortKey={sortKey}
          onSortChange={setSortKey}
          verifiedOnly={verifiedOnly}
          onVerifiedChange={setVerifiedOnly}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          hasActiveFilters={hasActiveFilters}
          onReset={resetFilters}
          count={filtered.length}
        />

        <section className="container py-8 sm:py-12">
          {filtered.length === 0 ? (
            <RatingEmptyState onReset={resetFilters} />
          ) : viewMode === "list" ? (
            <div className="flex flex-col gap-4">
              {filtered.map((company, i) => (
                <CompanyListItem
                  key={company.id}
                  company={company}
                  index={i}
                  rank={sortKey === "relevance" ? i + 1 : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((company, i) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  index={i}
                  rank={sortKey === "relevance" ? i + 1 : undefined}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export function RatingContent(props: RatingContentProps) {
  return (
    <Suspense>
      <RatingContentInner {...props} />
    </Suspense>
  );
}
