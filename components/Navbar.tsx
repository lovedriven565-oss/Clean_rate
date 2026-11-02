"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { ArrowUpRight, Menu, Sparkles, X } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { NavSearch } from "@/components/NavSearch";
import { RegionSelector } from "@/components/RegionSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

/**
 * Шапка держит три основных раздела и бизнес-CTA. Консультант живёт в поиске
 * (подсказка «Спросить ИИ-консультанта»).
 * `match` — разделы, которые подсвечивают пункт (профиль компании относится к рейтингу,
 * а `/for-brands` — к брендам).
 */
const navLinks = [
  { href: "/solutions", label: "Решения", match: ["/solutions"] },
  { href: "/brands", label: "Бренды", match: ["/brands", "/for-brands"] },
  { href: "/rating", label: "Рейтинг компаний", match: ["/rating", "/companies"] },
];

function subscribeScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const scrolled = useSyncExternalStore(subscribeScroll, () => window.scrollY > 24, () => false);

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
    <header className="glass sticky top-0 z-40 border-x-0 border-t-0">
      <div className="container flex h-14 items-center justify-between gap-3 sm:h-16">
        <Link href="/" className="group flex min-w-0 items-center text-foreground" onClick={() => setOpen(false)}>
          <BrandLogo markClassName="transition-transform group-hover:scale-105" />
        </Link>

        <div className="flex items-center gap-2">
          <NavSearch />
          <RegionSelector className="hidden md:inline-flex" />
          <ThemeToggle className="hidden sm:inline-flex" />
          <Link
            href="/assistant"
            aria-current={pathname === "/assistant" ? "page" : undefined}
            aria-label="ИИ-технолог"
            className="inline-flex h-11 items-center gap-1.5 rounded-full bg-ink px-3.5 text-xs font-semibold text-ink-foreground transition-transform hover:-translate-y-0.5 active:scale-[0.98] sm:px-4"
          >
            <Sparkles className="size-3.5 text-lime" aria-hidden />
            <span className="hidden sm:inline">ИИ-технолог</span>
          </Link>
          <Link
            href="/for-partners"
            aria-current={pathname === "/for-partners" ? "page" : undefined}
            className="hidden h-11 items-center gap-2 rounded-full bg-brand px-4 text-xs font-semibold text-brand-foreground transition-transform hover:-translate-y-0.5 active:scale-[0.98] xl:inline-flex"
          >
            Подключить компанию
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={open}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "hidden overflow-hidden border-t border-border/70 transition-[max-height,opacity] duration-300 lg:block",
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
                  "relative isolate rounded-full px-4 py-1.5 font-medium text-muted-foreground transition-colors hover:text-foreground",
                  active && "bg-ink text-ink-foreground hover:text-ink-foreground"
                )}
              >
                {hovered === link.href && !active && (
                  <motion.span
                    layoutId="nav-hover-pill"
                    aria-hidden
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className="absolute inset-0 -z-10 rounded-full bg-muted"
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
              <div className="pt-5">
                <ThemeToggle className="h-12 w-12" />
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
                    active && "bg-primary/10 font-semibold text-primary"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/for-partners"
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex h-13 items-center justify-center gap-2 rounded-full bg-brand px-4 text-base font-semibold text-brand-foreground"
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
