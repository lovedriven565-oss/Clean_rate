"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useRegion } from "@/components/providers/RegionProvider";
import { formatEstimate, pickEstimate } from "@/lib/solutions/diagnostic";
import { solutionCover } from "@/lib/solutions/covers";
import { howToTitle } from "@/lib/solutions/meta";
import { pluralize } from "@/lib/format";
import { scrollBehavior } from "@/lib/utils";
import type { PriceEstimate, Solution } from "@/lib/types";

const LIMIT = 8;

/**
 * «Как убрать: частые задачи» — единственный каталог главной.
 * Вертикальные карточки 3:4: арт сверху, название и цена под ним (текст не лежит поверх картинки).
 */
export function TaskRibbon({ solutions, estimates }: { solutions: Solution[]; estimates: PriceEstimate[] }) {
  const { market, city } = useRegion();
  const trackRef = useRef<HTMLUListElement>(null);
  const ctx = { countryCode: market.countryCode, city: city.name };
  const items = solutions.filter((s) => s.status === "published").slice(0, LIMIT);
  if (items.length === 0) return null;

  function scrollBy(dir: 1 | -1) {
    const track = trackRef.current;
    if (track) track.scrollBy({ left: dir * track.clientWidth * 0.8, behavior: scrollBehavior() });
  }

  return (
    <section aria-labelledby="ribbon-title" className="container py-10 sm:py-14">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <h2
          id="ribbon-title"
          className="text-balance font-display text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl"
        >
          Как убрать: частые задачи
        </h2>
        <div className="flex items-center gap-3">
          <Link href="/solutions" className="inline-flex items-center gap-1.5 text-sm font-semibold text-link hover:underline">
            Все задачи
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <div className="hidden gap-1.5 sm:flex">
            {([-1, 1] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                aria-label={dir < 0 ? "Назад" : "Вперёд"}
                onClick={() => scrollBy(dir)}
                className="grid size-10 place-items-center rounded-full border border-border bg-card transition-colors hover:border-primary/40"
              >
                {dir < 0 ? <ChevronLeft className="size-5" aria-hidden /> : <ChevronRight className="size-5" aria-hidden />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ul
        ref={trackRef}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] sm:-mx-6 sm:px-6 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((solution) => {
          const estimate = pickEstimate(estimates, solution, ctx);
          const price = estimate ? formatEstimate(estimate, ctx) : null;
          return (
            <li key={solution.id} className="w-[11.5rem] shrink-0 snap-start sm:w-[13.5rem] lg:w-[15rem]">
              <Link href={`/solutions/${solution.slug}`} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-panel bg-muted shadow-sm ring-1 ring-inset ring-border">
                  <Image
                    src={solutionCover(solution)}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 240px, (min-width: 640px) 216px, 184px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-3 line-clamp-2 text-[15px] font-semibold leading-snug text-foreground group-hover:text-link">
                  {howToTitle(solution)}
                </h3>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                  <span className="font-data">{pluralize(solution.diySteps.length, ["шаг", "шага", "шагов"])}</span>
                  {price && (
                    <span>
                      мастер от <b className="font-data font-bold text-success">{price.min}</b>
                    </span>
                  )}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
