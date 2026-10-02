"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Phone } from "lucide-react";
import type { Solution } from "@/lib/types";
import { cn } from "@/lib/utils";
import { demoProducts, demoCompany, demoAd } from "./demo-data";
import { heroExampleChips } from "./hero-search";
import { buildTaskShelves } from "./task-shelves";
import { TaskShelf } from "./TaskShelf";
import { VitrinaHero } from "./VitrinaHero";
import styles from "./VitrinaHero.module.css";

export default function VitrinaDemo({ solutions }: { solutions: Solution[] }) {
  const [dark, setDark] = useState(false);
  const chips = heroExampleChips(solutions);
  const shelves = buildTaskShelves(solutions);

  return (
    <div className={cn("va", dark && "va-dark", styles.scope, dark && styles.scopeDark, "min-h-screen bg-[hsl(var(--v-bg))] font-sans text-[hsl(var(--v-ink))] antialiased")}>
      <style>{`
        .va {
          --v-bg: 215 33% 98%;
          --v-surface: 0 0% 100%;
          --v-ink: 222 32% 13%;
          --v-ink2: 220 14% 42%;
          --v-line: 218 25% 88%;
          --v-accent: 221 70% 49%;
          --v-accent-ink: 0 0% 100%;
          --v-tint: 221 70% 96%;
          --v-ad: 38 92% 40%;
        }
        .va.va-dark {
          --v-bg: 216 32% 9%;
          --v-surface: 216 26% 14%;
          --v-ink: 214 32% 93%;
          --v-ink2: 215 16% 62%;
          --v-line: 215 20% 24%;
          --v-accent: 218 95% 76%;
          --v-accent-ink: 220 40% 12%;
          --v-tint: 216 28% 18%;
          --v-ad: 40 90% 60%;
        }
        .va img { display: block; }
      `}</style>

      {/* Шапка + первый экран (этап 1.3): реальные ссылки, локальный поиск по решениям */}
      <VitrinaHero
        solutions={solutions}
        chips={chips}
        dark={dark}
        onToggleDark={() => setDark((v) => !v)}
      />

      <main className="mx-auto max-w-6xl px-5">

        {/* Тематические полки (этап 1.4): обложки из published-решений,
            scroll-snap + стрелки + клавиатура, без демо-«популярности» */}
        <TaskShelf shelves={shelves} />

        {/* Products */}
        <section className="border-t border-[hsl(var(--v-line))] py-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-tight">Средства под задачу</h2>
            <span className="flex cursor-default items-center gap-1 text-sm font-medium text-[hsl(var(--v-accent))]">
              Каталог <ArrowRight className="size-4" />
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {demoProducts.map((p) => (
              <article key={p.name} className="group flex gap-4 rounded-2xl border border-[hsl(var(--v-line))] bg-[hsl(var(--v-surface))] p-4 transition-shadow hover:shadow-[0_16px_40px_-20px_hsl(222_40%_20%/0.3)]">
                <div className="relative aspect-square w-28 shrink-0 overflow-hidden rounded-xl bg-[hsl(var(--v-tint))] sm:w-32">
                  <Image src={p.img} alt={`Демо: ${p.name}`} fill sizes="128px" className="object-cover" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <h3 className="text-[15px] font-semibold leading-snug">{p.name}</h3>
                  <p className="mt-1 text-sm text-[hsl(var(--v-ink2))]">{p.purpose}</p>
                  <p className="mt-0.5 text-xs text-[hsl(var(--v-ink2))]">{p.constraint}</p>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
                    <span className="text-sm font-semibold">{p.price}</span>
                    <span className="flex cursor-default items-center gap-1 rounded-lg bg-[hsl(var(--v-tint))] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--v-accent))]">
                      Подробнее <ArrowUpRight className="size-3.5" />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Company + Ad */}
        <section className="grid grid-cols-1 gap-4 border-t border-[hsl(var(--v-line))] py-10 lg:grid-cols-2">
          <div>
            <h2 className="mb-5 text-2xl font-bold tracking-tight">Компании вашего города</h2>
            <article className="flex items-center gap-4 rounded-2xl border border-[hsl(var(--v-line))] bg-[hsl(var(--v-surface))] p-4">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-[hsl(var(--v-tint))]">
                <Image src={demoCompany.img} alt={`Демо: ${demoCompany.name}`} fill sizes="64px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-semibold">{demoCompany.name}</h3>
                <p className="text-xs text-[hsl(var(--v-ink2))]">{demoCompany.city} · {demoCompany.ratingSource}</p>
                <p className="mt-0.5 text-sm text-[hsl(var(--v-ink2))]">{demoCompany.price}</p>
              </div>
              <span className="flex cursor-default items-center gap-1.5 rounded-xl bg-[hsl(var(--v-accent))] px-4 py-2.5 text-sm font-semibold text-[hsl(var(--v-accent-ink))]">
                <Phone className="size-4" /> Позвонить
              </span>
            </article>
          </div>

          <div>
            <h2 className="mb-5 text-2xl font-bold tracking-tight">Рекламный слот</h2>
            <article className="rounded-2xl border border-dashed border-[hsl(var(--v-ad))]/50 bg-[hsl(var(--v-surface))] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--v-ad))]">Реклама</span>
                <span className="text-xs text-[hsl(var(--v-ink2))]">{demoAd.advertiser}</span>
              </div>
              <h3 className="text-[15px] font-semibold">{demoAd.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-[hsl(var(--v-ink2))]">{demoAd.description}</p>
              <span className="mt-3 inline-flex cursor-default items-center gap-1 text-sm font-semibold text-[hsl(var(--v-accent))]">
                {demoAd.cta} <ArrowUpRight className="size-4" />
              </span>
            </article>
          </div>
        </section>

        {/* States */}
        <section className="border-t border-[hsl(var(--v-line))] py-10">
          <h2 className="mb-5 text-2xl font-bold tracking-tight">Состояния</h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-[hsl(var(--v-line))] bg-[hsl(var(--v-surface))] p-4" aria-label="Загрузка">
              <div className="flex gap-4">
                <div className="size-16 animate-pulse rounded-xl bg-[hsl(var(--v-tint))]" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3.5 w-2/3 animate-pulse rounded bg-[hsl(var(--v-tint))]" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-[hsl(var(--v-tint))]" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-[hsl(var(--v-tint))]" />
                </div>
              </div>
            </div>
            <div className="grid place-items-center rounded-2xl border border-dashed border-[hsl(var(--v-line))] bg-[hsl(var(--v-surface))] p-8 text-center">
              <div>
                <p className="text-[15px] font-semibold">Ничего не нашлось</p>
                <p className="mt-1 text-sm text-[hsl(var(--v-ink2))]">Попробуйте описать задачу иначе или выберите полку ниже.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[hsl(var(--v-line))] py-6">
        <p className="mx-auto max-w-6xl px-5 text-xs text-[hsl(var(--v-ink2))]">
          Прототип A «Предметная витрина» · демо-данные ниже первого экрана · только для сравнения направлений.
          Материалы сайта носят справочный характер — не публичная оферта и не гарантия результата ·{" "}
          <Link href="/dev/design" className="underline underline-offset-2 hover:text-[hsl(var(--v-ink))]">← к витрине дизайна</Link>
          {" · "}
          <Link href="/dev/design/b-editorial" className="underline underline-offset-2 hover:text-[hsl(var(--v-ink))]">вариант B →</Link>
        </p>
      </footer>
    </div>
  );
}
