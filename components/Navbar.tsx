"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight, ArrowUpRight, Loader2, Menu, Search, Sparkles, X } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { NavSearch } from "@/components/NavSearch";
import { RegionSelector } from "@/components/RegionSelector";
import { useRegion } from "@/components/providers/RegionProvider";
import { SearchSuggestions, useSmartSearch } from "@/components/SmartSearch";
import { Input } from "@/components/ui/primitives";
import { isAdVisibleInCountry } from "@/lib/ads/presentation";
import { cn } from "@/lib/utils";
import type { CountryCode } from "@/lib/markets";
import type { EligibleAd } from "@/lib/types";

/**
 * Шапка в стиле Lovable: тонкий промо-бар, первый этаж с широкой строкой поиска,
 * второй этаж — полоса разделов платформы (на десктопе). Консультант доступен
 * и из поиска («Спросить ИИ-консультанта»), и отдельной кнопкой.
 */
const navLinks = [
  { href: "/solutions", label: "Как убрать", match: ["/solutions"] },
  { href: "/#shelf", label: "Средства", match: [] },
  { href: "/#cleaners", label: "Клинеры рядом", match: [] },
  { href: "/rating", label: "Рейтинг", match: ["/rating", "/companies"] },
  { href: "/brands", label: "Бренды", match: ["/brands", "/for-brands"] },
];

function subscribeScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

function formatEndsAt(ts: number): string {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(new Date(ts));
}

export function Navbar({ promoAds }: { promoAds?: Partial<Record<CountryCode, EligibleAd | null>> }) {
  const pathname = usePathname();
  const { countryCode } = useRegion();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const scrolled = useSyncExternalStore(subscribeScroll, () => window.scrollY > 24, () => false);

  const promo = pathname === "/" ? promoAds?.[countryCode] : null;

  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [open]);

  function isActive(match: string[]) {
    return match.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  }

  const compact = scrolled && !open;

  return (
    <header className="sticky top-0 z-40">
      {/* Промо-бар — только при активной кампании home.editorial_partner с датой конца */}
      {promo && promo.endsAt && isAdVisibleInCountry(promo, countryCode) && (
        <div className="bg-ink text-ink-foreground">
          <div className="container flex h-9 items-center justify-between gap-3 text-xs">
            <p className="flex min-w-0 items-center gap-2">
              <span aria-hidden className="relative flex size-1.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-lime" />
              </span>
              <span className="truncate">
                <span className="font-semibold text-lime">{promo.badgeText}:</span>{" "}
                <span className="text-ink-foreground/80">{promo.title} · до {formatEndsAt(promo.endsAt)}</span>
              </span>
            </p>
            <a href="#special" className="hidden shrink-0 items-center gap-1 font-semibold text-lime hover:underline sm:inline-flex">
              Смотреть акцию
              <ArrowRight className="size-3.5" aria-hidden />
            </a>
          </div>
        </div>
      )}

      {/* Первый этаж: логотип, широкий поиск, регион, ИИ-технолог, CTA */}
      <div className="glass border-x-0 border-t-0">
        <div className="container flex h-16 items-center justify-between gap-3">
          <Link href="/" className="group flex min-w-0 shrink-0 items-center text-foreground" onClick={() => setOpen(false)}>
            <BrandLogo markClassName="transition-transform group-hover:scale-105" />
          </Link>

          {pathname !== "/" && <HeaderSearch />}

          <div className="flex items-center gap-2">
            <div className="lg:hidden">
              <NavSearch />
            </div>
            <RegionSelector className="hidden md:inline-flex" />
            <Link
              href="/assistant"
              aria-current={pathname === "/assistant" ? "page" : undefined}
              aria-label="ИИ-технолог"
              className="inline-flex h-11 items-center gap-1.5 rounded-control bg-ink px-3.5 text-xs font-semibold text-ink-foreground transition-transform hover:-translate-y-0.5 active:scale-[0.98] sm:px-4"
            >
              <Sparkles className="size-3.5 text-lime" aria-hidden />
              <span className="hidden sm:inline">ИИ-технолог</span>
            </Link>
            <Link
              href="/for-partners"
              aria-current={pathname === "/for-partners" ? "page" : undefined}
              className="hidden h-11 items-center gap-1.5 text-sm font-semibold text-foreground transition-colors hover:text-teal xl:inline-flex"
            >
              Для бизнеса
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={open}
              className="inline-flex h-11 w-11 items-center justify-center rounded-control border border-border bg-card text-foreground lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Второй этаж: полоса разделов */}
      <div
        className={cn(
          "hidden overflow-hidden border-b border-border/70 bg-card/80 backdrop-blur-xl transition-[max-height,opacity] duration-300 lg:block",
          compact ? "max-h-0 border-transparent opacity-0" : "max-h-14 opacity-100"
        )}
      >
        <nav onPointerLeave={() => setHovered(null)} className="container flex h-12 items-center gap-1 text-sm" aria-label="Основная навигация">
          {navLinks.map((link) => {
            const active = isActive(link.match);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                tabIndex={compact ? -1 : undefined}
                onPointerEnter={() => setHovered(link.href)}
                onFocus={() => setHovered(link.href)}
                onBlur={() => setHovered(null)}
                className={cn(
                  "relative isolate rounded-control px-4 py-1.5 font-medium text-muted-foreground transition-colors hover:text-foreground",
                  active && "bg-ink text-ink-foreground hover:text-ink-foreground"
                )}
              >
                {hovered === link.href && !active && (
                  <motion.span
                    layoutId="nav-hover-pill"
                    aria-hidden
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className="absolute inset-0 -z-10 rounded-control bg-muted"
                  />
                )}
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {open && (
        <nav className="absolute inset-x-0 top-full max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-t border-border/70 bg-card/95 backdrop-blur-xl lg:hidden">
          <div className="container flex flex-col gap-1 py-4">
            <div className="mb-3 flex items-center justify-between gap-3 md:hidden">
              <div className="min-w-0 flex-1">
                <span className="mb-1.5 block px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Ваш регион</span>
                <RegionSelector variant="block" />
              </div>
            </div>
            {navLinks.map((link) => {
              const active = isActive(link.match);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-control px-4 py-3.5 text-base font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    active && "bg-teal/10 font-semibold text-teal"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/for-partners"
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex h-13 items-center justify-center gap-2 rounded-control bg-lime px-4 text-base font-semibold text-ink"
            >
              Подключить компанию
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

/**
 * Широкая строка поиска в шапке (десктоп ≥lg): та же логика и подсказки, что у
 * SmartSearch на главной, но без чипов — инпут + кнопка «Найти».
 */
function HeaderSearch() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const search = useSmartSearch();
  const { query, loading, open, setOpen, handleQueryChange, handleSubmit, handleKeyDown } = search;

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [setOpen]);

  return (
    <div ref={containerRef} className="relative mx-4 hidden min-w-0 max-w-xl flex-1 lg:block">
      <form onSubmit={handleSubmit} role="search" className="flex w-full items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            ref={inputRef}
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            onFocus={() => query.trim() && setOpen(true)}
            onKeyDown={handleKeyDown}
            type="search"
            aria-label="Поиск по платформе"
            placeholder="Вино на диване, обезжириватель, клинер…"
            className="h-11 rounded-control pl-10 pr-4"
          />
          {loading && (
            <Loader2 className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden />
          )}
        </div>
        <button
          type="submit"
          className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-control bg-ink px-5 text-sm font-semibold text-ink-foreground transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
        >
          Найти
        </button>
      </form>

      {open && query.trim() && <SearchSuggestions search={search} className="shadow-xl" />}
    </div>
  );
}
