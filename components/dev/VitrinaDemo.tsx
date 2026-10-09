"use client";

import { useState } from "react";
import Link from "next/link";
import type { Brand, Company, PriceEstimate, Solution } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AdStrip } from "./AdStrip";
import { CardsShowcase } from "./CardsShowcase";
import { resolveSelection, type DiagnosticSelection } from "./diagnostic-model";
import { heroExampleChips } from "./hero-search";
import { IndependenceBlock } from "./IndependenceBlock";
import { buildTaskShelves } from "./task-shelves";
import { TaskShelf } from "./TaskShelf";
import { TwoPaths } from "./TwoPaths";
import { VitrinaHero } from "./VitrinaHero";
import styles from "./VitrinaHero.module.css";

interface VitrinaDemoProps {
  solutions: Solution[];
  companies: Company[];
  estimates: PriceEstimate[];
  brands: Brand[];
}

export default function VitrinaDemo({ solutions, companies, estimates, brands }: VitrinaDemoProps) {
  const [dark, setDark] = useState(false);
  // Выбор диагностики общий для hero и секции «Два пути»: один источник правды.
  const [selection, setSelection] = useState<DiagnosticSelection>({});
  const chips = heroExampleChips(solutions);
  const shelves = buildTaskShelves(solutions);
  const { solution } = resolveSelection(solutions, selection);

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
          --v-raise: 0 0% 100%;
          --v-ad: 38 92% 40%;
          --v-r-panel: 24px;
          --v-r-card: 20px;
          --v-r-field: 16px;
          --v-r-ctl: 12px;
          --v-r-inner: 8px;
        }
        .va.va-dark {
          --v-bg: 216 32% 9%;
          --v-surface: 216 26% 14%;
          --v-ink: 214 32% 93%;
          --v-ink2: 215 16% 62%;
          --v-line: 215 20% 24%;
          --v-accent: 217 72% 68%;
          --v-accent-ink: 220 40% 12%;
          --v-tint: 216 28% 18%;
          --v-raise: 216 24% 27%;
          --v-ad: 40 90% 60%;
        }
        .va img { display: block; }
      `}</style>

      {/* Шапка + первый экран (этапы 1.3 и 1.6): реальные ссылки, локальный поиск, диагностика вместо фото */}
      <VitrinaHero
        solutions={solutions}
        estimates={estimates}
        chips={chips}
        dark={dark}
        onToggleDark={() => setDark((v) => !v)}
        selection={selection}
        onSelectionChange={setSelection}
      />

      <main className="mx-auto max-w-6xl px-5">
        {/* Два пути (этап 1.6): чеклист и мастера Минска для выбранного протокола */}
        <TwoPaths solution={solution} companies={companies} estimates={estimates} brands={brands} />

        {/* Образец платного формата: отдельно от органики, без событий и ссылок */}
        <AdStrip />

        {/* Тематические полки (этап 1.4): обложки из published-решений,
            scroll-snap + стрелки + клавиатура, без демо-«популярности» */}
        <TaskShelf shelves={shelves} />

        <IndependenceBlock />

        {/* Карточки и быстрый просмотр (этап 1.5) */}
        <section
          aria-labelledby="component-lab-title"
          data-component-lab
          className="mb-12 mt-4 rounded-[var(--v-r-panel)] border border-dashed border-[hsl(var(--v-line))] bg-[hsl(var(--v-tint)/0.45)] px-4 pt-8 sm:px-8"
        >
          <h2 id="component-lab-title" className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
            Витрина компонентов
          </h2>
          <p className="mt-2 max-w-2xl text-pretty text-[15px] leading-relaxed text-[hsl(var(--v-ink2))]">
            Образцы карточек и их состояний для согласования. Это не часть главной: на рабочем сайте раздела не будет.
          </p>
          <CardsShowcase solutions={solutions} companies={companies} />
        </section>
      </main>

      <footer className="border-t border-[hsl(var(--v-line))] py-6">
        <p className="mx-auto max-w-6xl px-5 text-xs text-[hsl(var(--v-ink2))]">
          Прототип A «Предметная витрина» · диагностика, «Два пути» и образцы карточек · только для сравнения направлений.
          Материалы сайта носят справочный характер — не публичная оферта и не гарантия результата ·{" "}
          <Link href="/dev/design" className="underline underline-offset-2 hover:text-[hsl(var(--v-ink))]">← к витрине дизайна</Link>
          {" · "}
          <Link href="/dev/design/b-editorial" className="underline underline-offset-2 hover:text-[hsl(var(--v-ink))]">вариант B →</Link>
        </p>
      </footer>
    </div>
  );
}
