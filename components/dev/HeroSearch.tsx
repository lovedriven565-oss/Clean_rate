"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Search, X } from "lucide-react";
import type { Solution } from "@/lib/types";
import { cn } from "@/lib/utils";
import styles from "./VitrinaHero.module.css";
import {
  heroSubmitTarget,
  normalizeHeroQuery,
  searchHeroSolutions,
  type HeroAudience,
} from "./hero-search";

const AUDIENCES: { id: HeroAudience; label: string }[] = [
  { id: "b2c", label: "Для дома" },
  { id: "b2b", label: "Для бизнеса" },
  { id: "pro", label: "Для профи" },
];

/**
 * Локальный поиск первого экрана прототипа A: combobox по props-решеніям
 * без /api/search и сетевых вызовов. Submit ведёт на реальное решение,
 * no-match честно сообщает об отсутствии и даёт ссылку на /solutions.
 */
export function HeroSearch({ solutions, chips }: { solutions: Solution[]; chips: string[] }) {
  const router = useRouter();
  const listboxId = useId();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [audience, setAudience] = useState<HeroAudience>("b2c");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const items = searchHeroSolutions(query, audience, solutions);
  const hasQuery = normalizeHeroQuery(query).length > 0;
  // Для «pro» локальная выдачи нет по определению — показываем
  // честную границу под переключателем, а не no-match панель.
  const showPanel = open && hasQuery && audience !== "pro";

  function optionId(index: number) {
    return `${listboxId}-opt-${index}`;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const target = heroSubmitTarget(items);
    if (target) {
      router.push(target);
    } else if (hasQuery && audience !== "pro") {
      setOpen(true);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (items.length === 0) return;
      setOpen(true);
      setActiveIndex((i) =>
        e.key === "ArrowDown" ? (i + 1) % items.length : (i - 1 + items.length) % items.length,
      );
    } else if (e.key === "Enter" && open && activeIndex >= 0 && items[activeIndex]) {
      e.preventDefault();
      router.push(items[activeIndex].href);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  function clearQuery() {
    setQuery("");
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  }

  return (
    <div
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setOpen(false);
          setActiveIndex(-1);
        }
      }}
    >
      <div
        role="group"
        aria-label="Аудитория"
        className="flex w-fit max-w-full flex-wrap gap-1 rounded-xl border border-[hsl(var(--v-line))] bg-[hsl(var(--v-surface))] p-1"
      >
        {AUDIENCES.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            aria-pressed={audience === id}
            onClick={() => {
              setAudience(id);
              setActiveIndex(-1);
            }}
            className={cn(
              "min-h-11 flex-1 whitespace-nowrap rounded-lg px-4 text-sm font-medium transition-colors",
              audience === id
                ? "bg-[hsl(var(--v-accent))] text-[hsl(var(--v-accent-ink))]"
                : "text-[hsl(var(--v-ink2))] hover:text-[hsl(var(--v-ink))]",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {audience === "pro" && (
        <p className="mt-3 max-w-xl text-sm leading-6 text-[hsl(var(--v-ink2))]">
          Локальный прототип не подбирает профессиональную химию — смотрите{" "}
          <Link href="/brands" className="font-semibold text-[hsl(var(--v-accent))] underline-offset-2 hover:underline">
            каталог брендов
          </Link>
          .
        </p>
      )}

      <form role="search" onSubmit={onSubmit} className="relative mt-3 max-w-xl">
        <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-[hsl(var(--v-ink))]">
          Что нужно убрать?
        </label>
        <div
          className={cn(
            "flex h-14 items-center gap-2 rounded-2xl border border-[hsl(var(--v-line))] bg-[hsl(var(--v-surface))] pl-5 pr-2 transition-shadow",
            styles.searchBox,
          )}
        >
          <Search className="size-5 shrink-0 text-[hsl(var(--v-ink2))]" aria-hidden />
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            role="combobox"
            aria-expanded={showPanel}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
            autoComplete="off"
            value={query}
            placeholder="Например: вино на диване, жир на вытяжке"
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => hasQuery && setOpen(true)}
            onKeyDown={onKeyDown}
            className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-[hsl(var(--v-ink2))]"
          />
          {hasQuery && (
            <button
              type="button"
              onClick={clearQuery}
              aria-label="Очистить запрос"
              className="grid size-9 shrink-0 place-items-center rounded-full text-[hsl(var(--v-ink2))] transition-colors hover:bg-[hsl(var(--v-tint))] hover:text-[hsl(var(--v-ink))]"
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
          <button
            type="submit"
            className="h-11 shrink-0 rounded-xl bg-[hsl(var(--v-accent))] px-6 text-sm font-semibold text-[hsl(var(--v-accent-ink))] transition-colors hover:brightness-105 active:brightness-95"
          >
            Найти
          </button>
        </div>

        {showPanel && (
          <div
            id={listboxId}
            className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-[hsl(var(--v-line))] bg-[hsl(var(--v-surface))] shadow-[0_24px_48px_-20px_hsl(222_40%_20%/0.35)]"
          >
            {items.length > 0 ? (
              <ul role="listbox" aria-label="Подсказки решений" className="max-h-72 overflow-y-auto p-1.5">
                {items.map((item, i) => (
                  <li
                    key={item.slug}
                    id={optionId(i)}
                    role="option"
                    aria-selected={i === activeIndex}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={cn("rounded-xl", i === activeIndex && "bg-[hsl(var(--v-tint))]")}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center justify-between gap-3 px-3.5 py-3 text-sm font-medium text-[hsl(var(--v-ink))]"
                    >
                      <span className="truncate">{item.title}</span>
                      <ArrowUpRight className="size-4 shrink-0 text-[hsl(var(--v-ink2))]" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-sm">
                <p className="font-medium text-[hsl(var(--v-ink))]">В локальном образце такого протокола нет</p>
                <p className="mt-1 leading-6 text-[hsl(var(--v-ink2))]">
                  Поиск прототипа работает без сервера по ограниченному набору решений.
                </p>
                <Link
                  href="/solutions"
                  className="mt-2 inline-flex items-center gap-1 font-semibold text-[hsl(var(--v-accent))] underline-offset-2 hover:underline"
                >
                  Все решения
                  <ArrowUpRight className="size-4" aria-hidden />
                </Link>
              </div>
            )}
          </div>
        )}

        <div role="status" aria-live="polite" className="sr-only">
          {showPanel
            ? items.length > 0
              ? `Найдено решений: ${items.length}. Стрелки для выбора, Enter — открыть.`
              : "Совпадений нет — доступна ссылка на все решения."
            : ""}
        </div>
      </form>

      <div className="mt-3 flex flex-wrap gap-2" aria-label="Примеры задач">
        {chips.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => {
              setQuery(chip);
              setOpen(true);
              setActiveIndex(-1);
              inputRef.current?.focus();
            }}
            className="inline-flex h-11 items-center rounded-full border border-[hsl(var(--v-line))] bg-[hsl(var(--v-surface))] px-4 text-sm text-[hsl(var(--v-ink2))] transition-colors hover:border-[hsl(var(--v-accent))]/50 hover:text-[hsl(var(--v-ink))]"
          >
            {chip}
          </button>
        ))}
      </div>

      <p className="mt-3 max-w-xl text-xs leading-5 text-[hsl(var(--v-ink2))]">
        Поиск по локальному образцу протоколов — прототип без сервера. Перед применением средства
        проверяйте его на незаметном участке и сверяйтесь с инструкцией производителя на упаковке.
      </p>
    </div>
  );
}
