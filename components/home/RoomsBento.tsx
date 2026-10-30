import Image from "next/image";
import {
  Boxes,
  Building2,
  CookingPot,
  PaintRoller,
  ShowerHead,
  Wind,
  Wine,
  type LucideIcon,
} from "lucide-react";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { buildTaskShelves } from "@/lib/solutions/shelves";
import { pluralize } from "@/lib/format";
import type { Solution } from "@/lib/types";

const SHELF_ICONS: Record<string, LucideIcon> = {
  stains: Wine,
  odors: Wind,
  renovation: PaintRoller,
  kitchen: CookingPot,
  bathroom: ShowerHead,
  office: Building2,
};

/**
 * «По комнатам и поверхностям»: bento-сетка полок протоколов с фото-обложками.
 * Ячеек ровно столько, сколько полок собрал buildTaskShelves (пустые не рисуются).
 */
export function RoomsBento({ solutions }: { solutions: Solution[] }) {
  const shelves = buildTaskShelves(solutions);
  if (shelves.length === 0) return null;

  return (
    <section aria-labelledby="rooms-title">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-data text-xs font-semibold uppercase tracking-[0.16em] text-link">
            По комнатам и поверхностям
          </p>
          <h2
            id="rooms-title"
            className="mt-1.5 text-balance font-display text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl"
          >
            С чем чаще всего приходят
          </h2>
        </div>
      </div>

      <BentoGrid>
        {shelves.map((shelf) => (
          <BentoCard
            key={shelf.id}
            name={shelf.title}
            description={`${shelf.note} · ${pluralize(shelf.count, ["протокол", "протокола", "протоколов"])}`}
            href={shelf.href}
            cta="Открыть подборку"
            Icon={SHELF_ICONS[shelf.id] ?? Boxes}
            className={shelf.featured ? "sm:col-span-2 lg:col-span-2 lg:row-span-2" : undefined}
            background={
              <>
                <Image
                  src={shelf.img}
                  alt={shelf.imgAlt}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10"
                />
              </>
            }
          />
        ))}
      </BentoGrid>
    </section>
  );
}
