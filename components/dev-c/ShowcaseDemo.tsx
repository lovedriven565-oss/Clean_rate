"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Menu, Moon, ShieldCheck, Sun, X } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { resolveSelection, type DiagnosticSelection } from "@/components/dev/diagnostic-model";
import { heroExampleChips } from "@/components/dev/hero-search";
import type { Brand, Company, PriceEstimate, Solution } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ShowcaseHero } from "./ShowcaseHero";
import { ShowcasePrices } from "./ShowcasePrices";
import { ShowcaseShelves } from "./ShowcaseShelves";
import { ShowcaseTwoPaths } from "./ShowcaseTwoPaths";
import "./showcase.css";

const NAV = [
  { href: "/solutions", label: "Решения" },
  { href: "/rating", label: "Рейтинг" },
  { href: "/brands", label: "Бренды" },
  { href: "/for-partners", label: "Компаниям" },
];

interface ShowcaseDemoProps {
  solutions: Solution[];
  companies: Company[];
  estimates: PriceEstimate[];
  brands: Brand[];
}

export default function ShowcaseDemo({ solutions, companies, estimates, brands }: ShowcaseDemoProps) {
  const [dark, setDark] = useState(false);
  const [menu, setMenu] = useState(false);
  const [selection, setSelection] = useState<DiagnosticSelection>({});
  const { solution } = resolveSelection(solutions, selection);
  const published = solutions.filter((s) => s.status === "published");

  return (
    <div className={cn("vc min-h-screen font-sans antialiased", dark && "vc-dark")}>
      <header
        onKeyDown={(e) => e.key === "Escape" && setMenu(false)}
        className="c-glass c-line sticky top-0 z-40 border-b bg-[hsl(var(--c-bg)/0.8)] backdrop-blur-xl"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-5">
          <Link href="/" aria-label="Клининг Рейтинг, на главную" className="shrink-0">
            <BrandLogo
              markClassName="h-8 w-8 rounded-lg bg-[hsl(var(--c-accent))] text-[hsl(var(--c-accent-ink))]"
              nameClassName="text-[15px]"
            />
          </Link>
          <nav aria-label="Основная навигация" className="ml-4 hidden items-center gap-1 lg:flex">
            {NAV.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-full px-4 py-2 text-sm font-medium c-ink2 transition-colors hover:bg-[hsl(var(--c-raise))] hover:text-[hsl(var(--c-ink))]"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <span className="c-line c-surface hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium c-ink2 md:inline-flex">
              <MapPin className="size-3.5" aria-hidden />
              Минск · BY
            </span>
            <button
              type="button"
              onClick={() => setDark((v) => !v)}
              aria-pressed={dark}
              aria-label={dark ? "Светлая тема" : "Тёмная тема"}
              className="c-line c-surface grid size-11 place-items-center rounded-full border transition-colors hover:border-[hsl(var(--c-accent))]"
            >
              {dark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
            </button>
            <button
              type="button"
              onClick={() => setMenu((v) => !v)}
              aria-expanded={menu}
              aria-label={menu ? "Закрыть меню" : "Открыть меню"}
              className="c-line c-surface grid size-11 place-items-center rounded-full border lg:hidden"
            >
              {menu ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
            </button>
          </div>
        </div>
        {menu && (
          <nav aria-label="Мобильная навигация" className="c-line border-t bg-[hsl(var(--c-bg))] lg:hidden">
            <div className="mx-auto flex max-w-7xl flex-col px-5 py-2">
              {NAV.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setMenu(false)} className="rounded-lg px-3 py-3.5 text-base font-medium">
                  {l.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>

      <ShowcaseHero
        solutions={solutions}
        estimates={estimates}
        chips={heroExampleChips(solutions)}
        stats={[
          { label: "протоколов", value: published.length },
          { label: "компаний", value: companies.length },
          { label: "брендов", value: brands.length },
        ]}
        selection={selection}
        onSelectionChange={setSelection}
      />

      <main className="mx-auto max-w-7xl space-y-20 px-5 pb-20 pt-4 sm:space-y-28">
        <ShowcaseShelves solutions={solutions} estimates={estimates} />
        <ShowcasePrices solutions={solutions} estimates={estimates} activeSlug={solution?.slug ?? null} onSelect={setSelection} />
        <ShowcaseTwoPaths solution={solution} companies={companies} />

        <section aria-label="Принципы" className="c-card flex flex-wrap items-center gap-x-8 gap-y-3 rounded-[14px] p-5 sm:p-6">
          <ShieldCheck className="size-6 shrink-0 c-link" aria-hidden />
          <p className="min-w-0 flex-1 basis-72 text-[15px] leading-relaxed">
            Платный охват возможен, покупка оценки нет: размещение маркируется «Реклама» и не меняет порядок рейтинга.
          </p>
          <Link href="/rating" className="c-link inline-flex min-h-11 items-center gap-1 text-sm font-semibold">
            Как считаем рейтинг
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </section>

        <section className="relative overflow-hidden rounded-[14px] bg-[hsl(160_20%_8%)] p-7 text-[hsl(150_16%_94%)] sm:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-[hsl(var(--c-accent)/0.28)] blur-3xl"
          />
          <div className="relative flex flex-wrap items-end justify-between gap-6">
            <h2 className="max-w-2xl text-balance text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
              Вы клининговая компания или бренд? Займите место на карте рынка.
            </h2>
            <Link
              href="/for-partners"
              className="c-accent-bg inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold transition-transform active:scale-[0.98]"
            >
              Разместить бизнес
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </section>
      </main>

      <footer className="c-line border-t py-6">
        <p className="mx-auto max-w-7xl px-5 text-xs c-ink2">
          Прототип C «Витрина» · только для сравнения направлений. Материалы носят справочный характер: не оферта и не гарантия результата ·{" "}
          <Link href="/dev/design" className="underline underline-offset-2">← к витрине дизайна</Link>
        </p>
      </footer>
    </div>
  );
}
