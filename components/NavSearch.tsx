"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/primitives";
import { SearchSuggestions, useSmartSearch } from "@/components/SmartSearch";
import { cn } from "@/lib/utils";

/**
 * Компактный умный поиск для Navbar — доступен на всех страницах, не только на главной.
 * Переиспользует ту же логику и подсказки (решения/компании/бренды), что и SmartSearch на hero.
 */
export function NavSearch({ className }: { className?: string }) {
  const [panelOpen, setPanelOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const search = useSmartSearch();
  const { query, loading, open, setOpen, handleQueryChange, handleSubmit, handleKeyDown } = search;

  useEffect(() => {
    if (panelOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [panelOpen]);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setPanelOpen(false);
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [setOpen]);

  function closePanel() {
    setPanelOpen(false);
    setOpen(false);
    handleQueryChange("");
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setPanelOpen((v) => !v)}
        aria-label={panelOpen ? "Закрыть поиск" : "Поиск по платформе"}
        aria-expanded={panelOpen}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary/35 hover:text-primary"
      >
        {panelOpen ? <X className="h-4.5 w-4.5" /> : <Search className="h-4.5 w-4.5" />}
      </button>

      {panelOpen && (
        <div className="glass absolute right-0 top-[calc(100%+0.75rem)] z-40 w-[min(92vw,26rem)] rounded-[1.1rem] p-3 shadow-xl">
          <form
            onSubmit={(event) => {
              handleSubmit(event);
              closePanel();
            }}
            className="relative"
          >
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(event) => handleQueryChange(event.target.value)}
              onFocus={() => query.trim() && setOpen(true)}
              onKeyDown={handleKeyDown}
              type="search"
              aria-label="Умный поиск по платформе"
              placeholder="Диван, офис 500 м², Kiehl..."
              className="h-11 pl-10 pr-4"
            />
            {loading && (
              <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </form>

          {open && query.trim() && (
            <SearchSuggestions search={search} className="static mt-2 shadow-none" />
          )}
        </div>
      )}
    </div>
  );
}
