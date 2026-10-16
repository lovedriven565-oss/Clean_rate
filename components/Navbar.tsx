"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
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

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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

  return (
    <header className="glass sticky top-0 z-40 border-x-0 border-t-0">
      <div className="container flex h-17 items-center justify-between gap-3">
        <Link href="/" className="group flex min-w-0 items-center text-foreground" onClick={() => setOpen(false)}>
          <BrandLogo markClassName="transition-transform group-hover:scale-105" />
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-border/80 bg-card/65 p-1 text-sm lg:flex">
          {navLinks.map((link) => {
            const active = isActive(link.match);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-2 font-medium text-muted-foreground transition-colors hover:bg-muted/75 hover:text-foreground",
                  active && "bg-foreground text-background hover:bg-foreground hover:text-background"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <NavSearch />
          <RegionSelector className="hidden md:inline-flex" />
          <ThemeToggle className="hidden sm:inline-flex" />
          <Link
            href="/for-partners"
            aria-current={pathname === "/for-partners" ? "page" : undefined}
            className="hidden h-10 items-center gap-2 rounded-full bg-brand px-4 text-xs font-semibold text-brand-foreground shadow-sm shadow-brand/30 transition-transform hover:-translate-y-0.5 active:scale-[0.98] lg:inline-flex"
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

      {open && (
        <nav className="absolute inset-x-0 top-full max-h-[calc(100dvh-4.25rem)] overflow-y-auto border-t border-border/70 bg-card/95 backdrop-blur-xl lg:hidden">
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
