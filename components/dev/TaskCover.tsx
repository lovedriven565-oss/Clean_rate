import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/format";
import type { TaskShelfCover } from "./task-shelves";
import styles from "./TaskShelf.module.css";

/**
 * Обложка темы на полке (этап 1.4). Вся карточка — одна ссылка
 * на реальный фильтр /solutions; счётчик приходит вычисленным
 * из published-решений.
 */
export function TaskCover({ cover }: { cover: TaskShelfCover }) {
  return (
    <li
      className={cn(
        "shrink-0 snap-start",
        cover.featured ? "w-[76vw] max-w-[320px] sm:w-[300px]" : "w-[60vw] max-w-[224px] sm:w-[212px]",
      )}
    >
      <Link
        href={cover.href}
        className={cn(
          "group relative block overflow-hidden rounded-2xl bg-[hsl(var(--v-tint))]",
          cover.featured ? "aspect-[4/5]" : "aspect-[3/4]",
        )}
      >
        <Image
          src={cover.img}
          alt={cover.imgAlt}
          fill
          sizes={
            cover.featured
              ? "(min-width: 640px) 300px, 76vw"
              : "(min-width: 640px) 212px, 60vw"
          }
          loading="lazy"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
        />
        <div className={cn("absolute inset-0", styles.coverShade)} aria-hidden="true" />
        <span className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors group-hover:bg-white/25">
          <ArrowUpRight className="size-5" aria-hidden="true" />
        </span>
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <span className="mb-2 inline-block rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm">
            {pluralize(cover.count, ["решение", "решения", "решений"])}
          </span>
          <h3 className="text-lg font-bold leading-tight">{cover.title}</h3>
          <p className="mt-0.5 text-[13px] leading-snug text-white/80">{cover.note}</p>
        </div>
      </Link>
    </li>
  );
}
