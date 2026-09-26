"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CompanyCard } from "@/components/CompanyCard";
import { CompanyListItem } from "@/components/CompanyListItem";
import { RatingToolbar, type SortKey, type ViewMode } from "@/components/RatingToolbar";
import { RatingEmptyState } from "@/components/RatingEmptyState";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AdCreative } from "@/components/ads/AdCreative";
import { useRegion } from "@/components/providers/RegionProvider";
import { calculateOrganicScore, calculateRelevanceScore } from "@/lib/rating";
import { formatMarketCurrency } from "@/lib/format";
import type { Market } from "@/lib/markets";
import type { Category, CategoryId, Company, EligibleAd } from "@/lib/types";

/** Строит 3-4 порога цены из реальных данных рынка, чтобы не хардкодить суммы в валютах */
function buildPriceThresholds(companies: Company[], market: Market): { value: number; label: string }[] {
  const prices = companies.map((c) => c.priceFrom).filter((p): p is number => p !== undefined).sort((a, b) => a - b);
  if (prices.length < 2) return [];
  const max = prices[prices.length - 1];
  const rawSteps = [0.25, 0.5, 0.75, 1].map((fraction) => max * fraction);
  const rounded = Array.from(new Set(rawSteps.map((v) => Math.ceil(v / 5) * 5 || Math.ceil(v))));
  return rounded.map((value) => ({ value, label: `до ${formatMarketCurrency(value, market)}` }));
}

interface RatingContentProps {
  companies: Company[];
  categories: Category[];
  /** Партнёры категорий, одобренные сервером (Eligibility Gate); null — слот схлопывается */
  categoryAds?: Record<string, EligibleAd | null>;
}

const SORT_KEYS: SortKey[] = ["relevance", "rating", "reviews", "price", "experience"];

function RatingContentInner({ companies, categories, categoryAds }: RatingContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { market } = useRegion();

  const categoryParam = searchParams.get("category");
  const initialCategory = categories.some((category) => category.id === categoryParam)
    ? (categoryParam as CategoryId)
    : "all";
  const sortParam = searchParams.get("sort");
  const cityParam = searchParams.get("city");
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [activeCategory, setActiveCategory] = useState<CategoryId | "all">(initialCategory);
  const [activeCity, setActiveCity] = useState<string>(cityParam ?? "all");
  const [sortKey, setSortKey] = useState<SortKey>(
    sortParam && SORT_KEYS.includes(sortParam as SortKey) ? (sortParam as SortKey) : "relevance"
  );
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get("verified") === "1");
  const [viewMode, setViewMode] = useState<ViewMode>(searchParams.get("view") === "grid" ? "grid" : "list");
  const [priceMax, setPriceMax] = useState<number | "all">("all");

  // Компании только рынка текущего региона (BY/RU/KZ) — так /rating остаётся согласован
  // с переключателем региона в шапке и на страницах решений (ProPanel).
  const marketCompanies = useMemo(() => {
    const marketCities = new Set(market.cities.map((city) => city.name));
    return companies.filter((c) => marketCities.has(c.city));
  }, [companies, market]);

  const cities = useMemo(
    () => Array.from(new Set(marketCompanies.map((c) => c.city))).sort(),
    [marketCompanies]
  );

  const priceOptions = useMemo(() => buildPriceThresholds(marketCompanies, market), [marketCompanies, market]);

  // Отражаем активные фильтры в URL, чтобы ссылку можно было скопировать/открыть заново.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (activeCategory !== "all") params.set("category", activeCategory);
    if (activeCity !== "all") params.set("city", activeCity);
    if (sortKey !== "relevance") params.set("sort", sortKey);
    if (verifiedOnly) params.set("verified", "1");
    if (viewMode !== "list") params.set("view", viewMode);
    const search = params.toString();
    router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
  }, [query, activeCategory, activeCity, sortKey, verifiedOnly, viewMode, pathname, router]);

  const hasActiveFilters =
    activeCategory !== "all" || activeCity !== "all" || verifiedOnly || query.length > 0 || priceMax !== "all";

  const filtered = useMemo(() => {
    let list = marketCompanies.filter((c) => {
      const matchesQuery = c.name.toLowerCase().includes(query.trim().toLowerCase());
      const matchesCategory = activeCategory === "all" || c.categories.includes(activeCategory);
      const matchesCity = activeCity === "all" || c.city === activeCity;
      const matchesVerified = !verifiedOnly || c.verified;
      const matchesPrice = priceMax === "all" || (c.priceFrom !== undefined && c.priceFrom <= priceMax);
      return matchesQuery && matchesCategory && matchesCity && matchesVerified && matchesPrice;
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
  }, [marketCompanies, query, activeCategory, activeCity, sortKey, verifiedOnly, priceMax]);

  function resetFilters() {
    setQuery("");
    setActiveCategory("all");
    setActiveCity("all");
    setVerifiedOnly(false);
    setSortKey("relevance");
    setPriceMax("all");
  }

  // Партнёр категории показывается только при выбранной категории и не участвует в сортировке
  // списка — органический порядок компаний остаётся нетронутым.
  const categoryAd = activeCategory !== "all" ? categoryAds?.[activeCategory] ?? null : null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1">
        <section className="bg-fresh relative overflow-hidden border-b border-border">
          <div className="container relative py-12 sm:py-18">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Рейтинг компаний" }]} />
            <span className="mt-4 block text-xs font-bold uppercase tracking-[0.2em] text-primary">Открытая методология</span>
            <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="max-w-3xl font-display text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-5xl">
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
          priceMax={priceMax}
          onPriceMaxChange={setPriceMax}
          priceOptions={priceOptions}
          hasActiveFilters={hasActiveFilters}
          onReset={resetFilters}
          count={filtered.length}
        />

        <section className="container py-8 sm:py-12">
          {categoryAd && <AdCreative key={categoryAd.campaignId} ad={categoryAd} className="mb-6" />}

          {filtered.length === 0 ? (
            <RatingEmptyState
              onReset={resetFilters}
              noCompaniesInRegion={marketCompanies.length === 0}
              regionName={market.name}
            />
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
