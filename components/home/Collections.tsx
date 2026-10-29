"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { solutionCover } from "@/lib/solutions/covers";
import { pluralize } from "@/lib/format";
import type { TaskShelfCover } from "@/lib/solutions/shelves";
import type { Solution } from "@/lib/types";

const CARDS_PER_BOX = 4;
const BOX_COUNT = 2;

/**
 * Тематические подборки 2×2 с фото. Карточка выбирает задачу в витрине
 * (тот же сценарий, что и клик по строке списка), ссылка «Все» ведёт
 * на реальный фильтр /solutions темы.
 */
export function Collections({
  shelves,
  solutions,
  onPick,
}: {
  shelves: TaskShelfCover[];
  solutions: Solution[];
  onPick: (slug: string) => void;
}) {
  const bySlug = new Map(solutions.map((s) => [s.slug, s]));
  const boxes = shelves.slice(0, BOX_COUNT);
  if (boxes.length === 0) return null;

  return (
    <div className="mt-12" id="collections">
      <div className="mb-5">
        <p className="font-data text-xs font-semibold uppercase tracking-[0.16em] text-link">Подборки</p>
        <h3 className="mt-1.5 text-balance font-display text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
          Популярные темы
        </h3>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Карточка открывает ту же витрину решений выше — повторной логики нет.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {boxes.map((box) => (
          <div key={box.id} className="data-surface rounded-panel p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h4 className="font-display text-lg font-bold tracking-tight text-foreground">{box.title}</h4>
                <p className="mt-0.5 text-xs text-muted-foreground">{box.note}</p>
              </div>
              <Link
                href={box.href}
                className="inline-flex items-center gap-1 text-sm font-semibold text-link hover:underline"
              >
                Все {box.count} {pluralize(box.count, ["решение", "решения", "решений"])}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {box.slugs.slice(0, CARDS_PER_BOX).map((slug) => {
                const solution = bySlug.get(slug);
                if (!solution) return null;
                return (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => onPick(slug)}
                    className="group/card relative isolate flex aspect-[4/3] items-end overflow-hidden rounded-control text-left transition-transform duration-300 hover:-translate-y-0.5 active:scale-[0.99]"
                  >
                    <Image
                      src={solutionCover(solution)}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 280px, 45vw"
                      className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                    />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent"
                    />
                    <span className="relative z-10 line-clamp-2 p-2.5 text-[13px] font-semibold leading-snug text-white">
                      {solution.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
