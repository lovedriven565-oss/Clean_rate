"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Menu, Moon, Sun, X } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import type { PriceEstimate, Solution } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { DiagnosticSelection } from "./diagnostic-model";
import { DiagnosticStage } from "./DiagnosticStage";
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
  estimates: PriceEstimate[];
  chips: string[];
  dark: boolean;
  onToggleDark: () => void;
  selection: DiagnosticSelection;
  onSelectionChange: (next: DiagnosticSelection) => void;
}

/**
 * Шапка + первый экран прототипа A. Навигация ведёт на реальные разделы
 * рабочего сайта; регион — контекст прототипа (cookie ch_region не пишется),
 * переключатель темы локальный (ch_theme и html.dark не затрагиваются).
 * Правая колонка (этап 1.6) — интерактивная диагностика; предметное фото
 * (Pexels 10566514, Ron Lach, Pexels License) — слева под поиском.
 */
export function VitrinaHero({
  solutions,
  estimates,
  chips,
  dark,
  onToggleDark,
  selection,
  onSelectionChange,
}: VitrinaHeroProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* data-hydrated ставится ref-колбэком после гидрации: маркер интерактивности для тестов. */}
      <header
        ref={(el) => {
          el?.setAttribute("data-hydrated", "true");
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape" && menuOpen) setMenuOpen(false);
        }}
        className={cn(
          "sticky top-0 z-20 border-b border-[hsl(var(--v-line))] bg-[hsl(var(--v-bg))]/85 backdrop-blur-md",
          styles.glassBar,
        )}
      >
        <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto] items-center gap-4 px-5 sm:h-[68px] lg:grid-cols-[1fr_auto_1fr]">
          <Link href="/" aria-label="Клининг Рейтинг, на главную" className="flex min-w-0 items-center justify-self-start">
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
                className="rounded-full px-4 py-2 text-sm font-medium text-[hsl(var(--v-ink2))] transition-colors hover:bg-[hsl(var(--v-tint))] hover:text-[hsl(var(--v-ink))]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 justify-self-end">
            <span
              title="Регион показан как контекст прототипа, выбор не сохраняется"
              className="hidden items-center gap-1.5 rounded-full border border-[hsl(var(--v-line))] bg-[hsl(var(--v-surface))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--v-ink2))] md:inline-flex"
            >
              <MapPin className="size-3.5" aria-hidden />
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
                Регион: Минск · BY. Контекст прототипа, выбор не сохраняется.
              </p>
            </div>
          </nav>
        )}
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-12 pt-8 sm:pt-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-x-14">
          <div className="min-w-0 lg:col-start-1 lg:row-start-1">
            <h1 className="text-balance text-4xl font-bold leading-[1.06] tracking-tight sm:text-5xl">
              Пятно, запах, налёт?
              <span className="mt-2 block text-[0.5em] font-semibold leading-snug tracking-tight text-[hsl(var(--v-ink2))]">
                Подскажем, как убрать, или кого позвать.
              </span>
            </h1>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[hsl(var(--v-ink2))]">
              Справочник типовых протоколов и независимый каталог исполнителей. Справочная
              информация, не оферта: решение и ответственность за применение за вами.
            </p>
            <div className="mt-6">
              <HeroSearch solutions={solutions} chips={chips} />
            </div>
          </div>

          <figure
            className={cn(
              "relative isolate aspect-[16/10] overflow-hidden rounded-[var(--v-r-card)] bg-[hsl(var(--v-tint))] lg:col-start-1 lg:row-start-2 lg:aspect-auto lg:h-full lg:max-h-[460px] lg:min-h-[240px] lg:self-end",
              styles.photo,
            )}
          >
            <Image
              src="/dev/a-hero/hero-scene.jpg"
              alt="Бытовая химия и щётка в светлой комнате: распылитель, флаконы и канистра на фоне белой стены с лучом света"
              fill
              sizes="(min-width: 1152px) 560px, (min-width: 1024px) 46vw, 100vw"
              loading="eager"
              className="object-cover object-[50%_88%]"
            />
          </figure>

          <div className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <DiagnosticStage
              solutions={solutions}
              estimates={estimates}
              selection={selection}
              onSelectionChange={onSelectionChange}
            />
          </div>
        </div>
      </section>
    </>
  );
}
