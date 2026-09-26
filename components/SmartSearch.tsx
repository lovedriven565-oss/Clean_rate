"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Home, Loader2, Search, Sparkles, Wrench } from "lucide-react";
import { Input } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import type { SearchIntent } from "@/lib/types";
import type { SearchResponse } from "@/app/api/search/route";

export type Segment = "auto" | SearchIntent;

export const SEGMENTS: { value: Segment; label: string; icon: typeof Home }[] = [
  { value: "b2c", label: "Для дома", icon: Home },
  { value: "b2b", label: "Для бизнеса", icon: Briefcase },
  { value: "pro", label: "Для профи", icon: Wrench },
];

export const QUICK_CHIPS = ["Диван", "Матрас", "После ремонта", "Окна", "Химия"];

const DEBOUNCE_MS = 200;

export function routeForIntent(intent: SearchIntent, query: string): string {
  if (intent === "b2b") return `/rating?q=${encodeURIComponent(query)}&intent=b2b`;
  if (intent === "pro") return `/brands?q=${encodeURIComponent(query)}`;
  return `/rating?q=${encodeURIComponent(query)}`;
}

export function routeForTarget(target: SearchResponse["target"], intent: SearchIntent, query: string): string {
  if (!target) return routeForIntent(intent, query);
  if (target.kind === "solution") return `/solutions/${target.slug}`;
  if (target.kind === "brand") return `/brands/${target.slug}`;
  if (target.kind === "category") {
    return intent === "b2b" ? `/rating?category=${target.slug}&intent=b2b` : `/rating?category=${target.slug}`;
  }
  return routeForIntent(intent, query);
}

/** Общая логика умного поиска — используется полноразмерным SmartSearch и компактным NavSearch */
export function useSmartSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState<Segment>("auto");
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        if (!response.ok) throw new Error("search failed");
        const data: SearchResponse = await response.json();
        setResult(data);
        setOpen(true);
        setHighlightedIndex(-1);
      } catch {
        setResult(null);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  const effectiveIntent: SearchIntent = segment === "auto" ? result?.intent ?? "b2c" : segment;

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      setHighlightedIndex(-1);
      router.push(href);
    },
    [router]
  );

  const showCompanies = effectiveIntent !== "pro" && (result?.companies.length ?? 0) > 0;
  const showBrands = (result?.brands.length ?? 0) > 0;
  const showSolutions = (result?.solutions.length ?? 0) > 0;
  const hasResults = showCompanies || showBrands || showSolutions;

  const flatItems = [
    ...(showSolutions ? result!.solutions.map((s) => ({ href: `/solutions/${s.slug}` })) : []),
    ...(showCompanies ? result!.companies.map((c) => ({ href: `/companies/${c.slug}` })) : []),
    ...(showBrands ? result!.brands.map((b) => ({ href: `/brands/${b.slug}` })) : []),
  ];

  function handleQueryChange(value: string) {
    setQuery(value);
    if (!value.trim()) {
      setResult(null);
      setLoading(false);
      setOpen(false);
      setHighlightedIndex(-1);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    if (highlightedIndex >= 0 && flatItems[highlightedIndex]) {
      navigate(flatItems[highlightedIndex].href);
      return;
    }
    navigate(routeForTarget(result?.target ?? null, effectiveIntent, trimmed));
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || flatItems.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((i) => (i + 1) % flatItems.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((i) => (i <= 0 ? flatItems.length - 1 : i - 1));
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return {
    query,
    setQuery,
    segment,
    setSegment,
    result,
    loading,
    open,
    setOpen,
    effectiveIntent,
    navigate,
    showCompanies,
    showBrands,
    showSolutions,
    hasResults,
    highlightedIndex,
    handleQueryChange,
    handleSubmit,
    handleKeyDown,
  };
}

export function SmartSearch() {
  const containerRef = useRef<HTMLDivElement>(null);
  const search = useSmartSearch();
  const { query, segment, setSegment, loading, open, setOpen, handleQueryChange, handleSubmit, handleKeyDown } = search;

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [setOpen]);

  function handleChip(chip: string) {
    handleQueryChange(chip);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="glass flex w-full flex-col gap-2 rounded-[1.35rem] p-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            onFocus={() => query.trim() && setOpen(true)}
            onKeyDown={handleKeyDown}
            type="search"
            aria-label="Умный поиск по платформе"
            placeholder="Опишите задачу: «пятно вина», «офис 500 м²», «Kiehl»"
            className="h-13 border-transparent bg-transparent pl-11 pr-11 shadow-none focus:border-transparent"
          />
          {loading && (
            <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 px-1 pb-1">
          {SEGMENTS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSegment((current) => (current === value ? "auto" : value))}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-full border border-border/70 px-3.5 text-xs font-semibold text-muted-foreground transition-colors",
                segment === value
                  ? "border-primary/40 bg-primary text-primary-foreground"
                  : "bg-card/70 hover:border-primary/30 hover:text-foreground"
              )}
              aria-pressed={segment === value}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </form>

      <div className="mt-2 flex flex-wrap gap-1.5 px-1">
        {QUICK_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => handleChip(chip)}
            className="h-8 rounded-full border border-border/70 bg-card/60 px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
          >
            {chip}
          </button>
        ))}
      </div>

      {open && query.trim() && <SearchSuggestions search={search} />}
    </div>
  );
}

/** Общая выпадающая панель подсказок — переиспользуется полноразмерным и компактным поиском */
export function SearchSuggestions({ search, className }: { search: ReturnType<typeof useSmartSearch>; className?: string }) {
  const { result, loading, hasResults, showSolutions, showCompanies, showBrands, navigate, highlightedIndex } = search;

  let cursor = 0;
  return (
    <div
      className={cn(
        "glass absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 max-h-[70vh] overflow-y-auto rounded-[1.1rem] p-2 shadow-lg",
        className
      )}
    >
      {!hasResults && !loading && (
        <p className="px-4 py-6 text-center text-sm text-muted-foreground">
          Ничего не нашли. Нажмите «Enter», чтобы посмотреть все результаты.
        </p>
      )}

      {showSolutions && (
        <SuggestionGroup title="Решения">
          {result!.solutions.map((s) => {
            const index = cursor++;
            return (
              <SuggestionItem
                key={s.slug}
                label={s.title}
                meta={s.audience === "b2b" ? "Для бизнеса" : s.audience === "b2c" ? "Сделай сам / мастер" : "Универсально"}
                icon={Sparkles}
                highlighted={index === highlightedIndex}
                onClick={() => navigate(`/solutions/${s.slug}`)}
              />
            );
          })}
        </SuggestionGroup>
      )}

      {showCompanies && (
        <SuggestionGroup title="Компании">
          {result!.companies.map((c) => {
            const index = cursor++;
            return (
              <SuggestionItem
                key={c.slug}
                label={c.name}
                meta={c.city}
                icon={Home}
                highlighted={index === highlightedIndex}
                onClick={() => navigate(`/companies/${c.slug}`)}
              />
            );
          })}
        </SuggestionGroup>
      )}

      {showBrands && (
        <SuggestionGroup title="Бренды">
          {result!.brands.map((b) => {
            const index = cursor++;
            return (
              <SuggestionItem
                key={b.slug}
                label={b.name}
                meta={b.tagline}
                icon={Wrench}
                highlighted={index === highlightedIndex}
                onClick={() => navigate(`/brands/${b.slug}`)}
              />
            );
          })}
        </SuggestionGroup>
      )}
    </div>
  );
}

function SuggestionGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-1 last:mb-0">
      <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/80">
        {title}
      </p>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function SuggestionItem({
  label,
  meta,
  icon: Icon,
  onClick,
  highlighted,
}: {
  label: string;
  meta?: string;
  icon: typeof Home;
  onClick: () => void;
  highlighted?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/70",
        highlighted && "bg-muted/70"
      )}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-foreground">{label}</span>
        {meta && <span className="block truncate text-xs text-muted-foreground">{meta}</span>}
      </span>
    </button>
  );
}
