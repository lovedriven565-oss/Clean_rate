"use client";

import { useState } from "react";
import Link from "next/link";
import type { Company, Solution } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CardsShowcase } from "./CardsShowcase";
import { heroExampleChips } from "./hero-search";
import { buildTaskShelves } from "./task-shelves";
import { TaskShelf } from "./TaskShelf";
import { VitrinaHero } from "./VitrinaHero";
import styles from "./VitrinaHero.module.css";

export default function VitrinaDemo({ solutions, companies }: { solutions: Solution[]; companies: Company[] }) {
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

        {/* Карточки и быстрый просмотр (этап 1.5) */}
        <CardsShowcase solutions={solutions} companies={companies} />
      
      </main>

      <footer className="border-t border-[hsl(var(--v-line))] py-6">
        <p className="mx-auto max-w-6xl px-5 text-xs text-[hsl(var(--v-ink2))]">
          Прототип A «Предметная витрина» · образцы карточек ниже полок · только для сравнения направлений.
          Материалы сайта носят справочный характер — не публичная оферта и не гарантия результата ·{" "}
          <Link href="/dev/design" className="underline underline-offset-2 hover:text-[hsl(var(--v-ink))]">← к витрине дизайна</Link>
          {" · "}
          <Link href="/dev/design/b-editorial" className="underline underline-offset-2 hover:text-[hsl(var(--v-ink))]">вариант B →</Link>
        </p>
      </footer>
    </div>
  );
}
