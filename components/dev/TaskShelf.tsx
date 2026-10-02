"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskShelfCover } from "./task-shelves";
import { TaskCover } from "./TaskCover";
import styles from "./TaskShelf.module.css";

/**
 * Тематическая полка (этап 1.4): CSS scroll-snap, стрелки с честными
 * disabled-состояниями, стрелки клавиатуры на области прокрутки,
 * свайп — нативный touch-scroll. Без autoplay и без «карусельной»
 * точечной навигации.
 */
export function TaskShelf({
  shelves,
  allHref = "/solutions",
}: {
  shelves: TaskShelfCover[];
  allHref?: string;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const raf = requestAnimationFrame(update);
    const observer = new ResizeObserver(update);
    observer.observe(el);
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scrollByCards = (dir: 1 | -1) => {
    trackRef.current?.scrollBy({ left: dir * Math.round(trackRef.current.clientWidth * 0.8) });
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    if (event.key === "ArrowRight") scrollByCards(1);
    else if (event.key === "ArrowLeft") scrollByCards(-1);
    else return;
    event.preventDefault();
  };

  if (shelves.length === 0) return null;

  return (
    <section aria-labelledby="task-shelf-title" className="border-t border-[hsl(var(--v-line))] py-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 id="task-shelf-title" className="text-2xl font-bold tracking-tight">
            Темы задач
          </h2>
          <p className="mt-1 text-sm text-[hsl(var(--v-ink2))]">
            Полки собраны из опубликованных протоколов — без учёта рекламы.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={allHref}
            className="hidden items-center gap-1 text-sm font-medium text-[hsl(var(--v-accent))] hover:underline sm:flex"
          >
            Все решения <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <div className="hidden gap-2 sm:flex">
            <button
              type="button"
              aria-label="Листать назад"
              disabled={!canPrev}
              onClick={() => scrollByCards(-1)}
              className="grid size-11 place-items-center rounded-full border border-[hsl(var(--v-line))] bg-[hsl(var(--v-surface))] text-[hsl(var(--v-ink))] transition-colors hover:border-[hsl(var(--v-accent))]/50 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ArrowLeft className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Листать вперёд"
              disabled={!canNext}
              onClick={() => scrollByCards(1)}
              className="grid size-11 place-items-center rounded-full border border-[hsl(var(--v-line))] bg-[hsl(var(--v-surface))] text-[hsl(var(--v-ink))] transition-colors hover:border-[hsl(var(--v-accent))]/50 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ArrowRight className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <ul
        ref={trackRef}
        onKeyDown={onKeyDown}
        tabIndex={0}
        aria-label="Темы задач: листайте стрелками влево и вправо"
        className={cn(
          styles.track,
          "-mx-5 flex gap-4 overflow-x-auto px-5 pb-2 lg:mx-0 lg:px-0",
          "snap-x snap-mandatory",
        )}
      >
        {shelves.map((cover) => (
          <TaskCover key={cover.id} cover={cover} />
        ))}
      </ul>

      <Link
        href={allHref}
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[hsl(var(--v-accent))] hover:underline sm:hidden"
      >
        Все решения <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
