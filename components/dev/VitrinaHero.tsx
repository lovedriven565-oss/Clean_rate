"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Menu, Moon, Sun, X } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import type { Solution } from "@/lib/types";
import { cn } from "@/lib/utils";
import { HeroSearch } from "./HeroSearch";
import styles from "./VitrinaHero.module.css";

const navLinks = [
  { href: "/solutions", label: "Решения" },
  { href: "/rating", label: "Рейтинг" },
  { href: "/brands", label: "Бренды" },
  { href: "/for-partners", label: "Компаниям" },
];

interface VitrinaHeroProps {
  solutions: Solution[];
  chips: string[];
  dark: boolean;
  onToggleDark: () => void;
}

/**
 * Шапка + первый экран прототипа A. Навигация ведёт на реальные разделы
 * рабочего сайта; регион — контекст прототипа (cookie ch_region не пишется),
 * переключатель темы локальный (ch_theme и html.dark не затрагиваются).
 */
export function VitrinaHero({ solutions, chips, dark, onToggleDark }: VitrinaHeroProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* data-hydrated ставится ref-колбэком после гидрации — маркер интерактивности для тестов. */}
      <header
        ref={(el) => {
          el?.setAttribute("data-hydrated", "true");
        }}
        className={cn(
          "sticky top-0 z-20 border-b border-[hsl(var(--v-line))] bg-[hsl(var(--v-bg))]/85 backdrop-blur-md",
          styles.glassBar,
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5 sm:h-[68px]">
          <Link href="/" aria-label="Клининг Рейтинг — на главную" className="flex min-w-0 items-center">
            <BrandLogo
              markClassName="h-8 w-8 rounded-lg bg-[hsl(var(--v-accent))] text-[hsl(var(--v-accent-ink))]"
              nameClassName="text-[15px]"
            />
          </Link>

          <nav aria-label="Основная навигация" className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-[hsl(var(--v-ink2))] transition-colors hover:bg-[hsl(var(--v-tint))] hover:text-[hsl(var(--v-ink))]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <span
              title="Регион показан как контекст прототипа — выбор не сохраняется"
              className="hidden rounded-full border border-[hsl(var(--v-line))] bg-[hsl(var(--v-surface))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--v-ink2))] md:block"
            >
              Минск · BY
            </span>
            <button
              type="button"
              onClick={onToggleDark}
              aria-label={dark ? "Светлая тема прототипа" : "Тёмная тема прототипа"}
              aria-pressed={dark}
              className="grid size-11 place-items-center rounded-full border border-[hsl(var(--v-line))] bg-[hsl(var(--v-surface))] text-[hsl(var(--v-ink2))] transition-colors hover:text-[hsl(var(--v-ink))]"
            >
              {dark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={menuOpen}
              className="grid size-11 place-items-center rounded-full border border-[hsl(var(--v-line))] bg-[hsl(var(--v-surface))] text-[hsl(var(--v-ink))] lg:hidden"
            >
              {menuOpen ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav
            aria-label="Мобильная навигация"
            className="border-t border-[hsl(var(--v-line))] bg-[hsl(var(--v-bg))] lg:hidden"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-4 py-3.5 text-base font-medium text-[hsl(var(--v-ink))] transition-colors hover:bg-[hsl(var(--v-tint))]"
                >
                  {link.label}
                </Link>
              ))}
              <p className="px-4 pb-2 pt-1 text-xs text-[hsl(var(--v-ink2))]">
                Регион: Минск · BY — контекст прототипа, выбор не сохраняется.
              </p>
            </div>
          </nav>
        )}
      </header>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-5 pb-12 pt-10 sm:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
        <div className="min-w-0">
          <h1 className="text-balance text-4xl font-bold leading-[1.06] tracking-tight sm:text-5xl">
            Пятно, запах, налёт?
            <span className="mt-2 block text-[0.6em] font-semibold leading-snug tracking-tight text-[hsl(var(--v-ink2))]">
              Подскажем, как убрать — или кого позвать.
            </span>
          </h1>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-[hsl(var(--v-ink2))]">
            Справочник типовых протоколов и независимый каталог исполнителей. Материалы носят
            справочный характер: решение и ответственность за применение — за вами.
          </p>
          <div className="mt-6">
            <HeroSearch solutions={solutions} chips={chips} />
          </div>
        </div>

        <figure className="relative min-w-0">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-[hsl(var(--v-line))] bg-[hsl(var(--v-tint))]">
            <Image
              src="/dev/a-hero/hero-main.jpg"
              alt="Прозрачный спрей для уборки и синяя губка на светлой поверхности"
              fill
              priority
              sizes="(min-width: 1024px) 44vw, 92vw"
              className="object-cover object-[50%_58%]"
            />
          </div>
          <Link
            href="/solutions/vodny-kamen-dushevaya"
            className="absolute bottom-3 left-3 inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[hsl(var(--v-line))] bg-[hsl(var(--v-surface))]/95 px-4 text-sm font-semibold text-[hsl(var(--v-ink))] shadow-sm backdrop-blur-sm transition-colors hover:text-[hsl(var(--v-accent))]"
          >
            Стекло без налёта — протокол
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
          <figcaption className="mt-2.5 text-xs text-[hsl(var(--v-ink2))]">
            Фото: Pexels №28576627, свободная лицензия для коммерческого использования.
          </figcaption>
        </figure>
      </section>
    </>
  );
}
