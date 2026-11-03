"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowUpRight, Play, Star } from "lucide-react";
import { useRegion } from "@/components/providers/RegionProvider";
import { formatMarketCurrency, pluralize } from "@/lib/format";
import { displayPrice, type ShelfProduct } from "@/lib/products/zone-shelf";
import { solutionCover } from "@/lib/solutions/covers";
import { howToTitle } from "@/lib/solutions/meta";
import type { Solution } from "@/lib/types";

// Сторис-плеер выделен из первоначального бандла: грузится по первому открытию.
const StoryModal = dynamic(() => import("./StoryPlayer"), { ssr: false });

const CARD_LIMIT = 5;

/**
 * «Видеолаборатория»: вертикальные карточки 9:16 с разборами протоколов.
 * По клику — сторис-плеер 9:16 в модалке: таймлайн «Не делайте» → шаги →
 * карточка протестированного средства с кнопкой покупки. Если у протокола есть
 * videoUrl, вместо слайдов встраивается сам ролик (YouTube/VK/Rutube/mp4).
 */
export function VideoLabSection({ solutions, products }: { solutions: Solution[]; products: ShelfProduct[] }) {
  const { market } = useRegion();
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const items = useMemo(() => solutions.filter((s) => s.status === "published").slice(0, CARD_LIMIT), [solutions]);
  const active = items.find((s) => s.slug === openSlug) ?? null;
  const testedProduct = active ? products.find((p) => p.solutionSlug === active.slug) : undefined;

  if (items.length === 0) return null;

  return (
    <section id="videolab" aria-labelledby="videolab-title" className="container scroll-mt-24 py-12 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-data text-[11px] font-bold uppercase tracking-[0.16em] text-teal">ChistoLab / Video</p>
          <h2 id="videolab-title" className="mt-2 max-w-xl text-balance font-display text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl">
            Видеолаборатория: разборы протоколов
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Короткие разборы: реальное пятно, реальное средство, честный результат.
          </p>
        </div>
        <Link href="/solutions" className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal hover:underline">
          Все протоколы
          <ArrowUpRight className="size-4" aria-hidden />
        </Link>
      </div>

      <ul className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((solution) => {
          const product = products.find((p) => p.solutionSlug === solution.slug);
          const price = product?.price !== undefined ? displayPrice(product.price, market.currency) : null;
          return (
            <li key={solution.id}>
              <button
                type="button"
                onClick={() => setOpenSlug(solution.slug)}
                className="group flex w-full flex-col overflow-hidden rounded-panel border border-border bg-card text-left transition-shadow hover:shadow-lg"
                aria-label={`Открыть разбор: ${howToTitle(solution)}`}
              >
                <span className="relative block aspect-[9/16] w-full bg-ink">
                  <Image
                    src={solutionCover(solution)}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 240px, (min-width: 640px) 33vw, 50vw"
                    className="object-cover opacity-85 transition-transform duration-500 group-hover:scale-105"
                  />
                  <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />

                  <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-[6px] bg-ink/80 px-2 py-1 font-data text-[10px] font-bold text-white">
                    <Play className="size-3 fill-white" aria-hidden />
                    {solution.videoUrl ? "Видео" : `Разбор · ${pluralize(solution.diySteps.length, ["шаг", "шага", "шагов"])}`}
                  </span>
                  {!solution.videoUrl && (
                    <span className="absolute right-2.5 top-2.5 rounded-[6px] bg-ink/80 px-2 py-1 font-data text-[10px] font-bold text-white">
                      Видео скоро
                    </span>
                  )}

                  <span className="absolute bottom-3 right-3 grid size-11 place-items-center rounded-full bg-lime text-ink shadow-lg transition-transform group-hover:scale-110">
                    <Play className="size-4 fill-ink" aria-hidden />
                  </span>
                  <span className="absolute inset-x-0 bottom-0 p-3.5 pr-16 text-ink-foreground">
                    <span className="line-clamp-3 block text-[13px] font-bold leading-snug">
                      {howToTitle(solution)}
                    </span>
                  </span>
                </span>

                {/* Товарная плашка под видео — протестированное средство */}
                <span className="flex w-full items-center gap-3 border-t border-border bg-card p-3">
                  {product ? (
                    <>
                      <span className="relative size-11 shrink-0 overflow-hidden rounded-control bg-muted">
                        <Image src="/lovable/spray.jpg" alt="" fill sizes="44px" className="object-cover" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold text-foreground">{product.name}</span>
                        <span className="mt-0.5 flex items-center gap-1.5 font-data text-[11px] text-muted-foreground">
                          {product.rating !== undefined && (
                            <span className="inline-flex items-center gap-0.5 font-bold text-foreground">
                              <Star className="size-3 fill-star text-star" aria-hidden />
                              {product.rating.toFixed(1)}
                            </span>
                          )}
                          {price && <span>{formatMarketCurrency(price.value, market.currency)}</span>}
                        </span>
                      </span>
                      <span className="shrink-0 rounded-control bg-ink px-2.5 py-1.5 text-[11px] font-semibold text-ink-foreground">
                        Смотреть
                      </span>
                    </>
                  ) : (
                    <span className="flex w-full items-center justify-between gap-2">
                      <span className="font-data text-[11px] text-muted-foreground">
                        {pluralize(solution.diySteps.length, ["шаг", "шага", "шагов"])} · протокол
                      </span>
                      <span className="shrink-0 rounded-control bg-ink px-2.5 py-1.5 text-[11px] font-semibold text-ink-foreground">
                        Смотреть
                      </span>
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <StoryModal
        solution={active}
        product={testedProduct}
        currency={market.currency}
        countryCode={market.countryCode}
        onClose={() => setOpenSlug(null)}
      />
    </section>
  );
}
