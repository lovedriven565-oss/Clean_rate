import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { HeroStats, type HeroStatsData } from "@/components/home/HeroStats";

/**
 * Первый экран — светлая карточка по эталону Lovable: eyebrow, H1,
 * подзаголовок с ключевым запросом, два CTA-якоря и фото справа.
 * Серверный компонент: единственный клиентский островок — HeroStats
 * (регион-зависимые цифры на урезанных DTO).
 */
export function PlatformHero({ stats }: { stats: HeroStatsData }) {
  return (
    <section className="container pt-6 sm:pt-8">
      <div className="grid overflow-hidden rounded-panel border border-border bg-card lg:grid-cols-[1.02fr_0.98fr]">
        <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
          <p className="font-data text-[11px] font-bold uppercase tracking-[0.16em] text-teal">
            Чистота нового поколения
          </p>
          <h1 className="mt-4 max-w-xl text-balance font-display text-4xl font-bold leading-[1.04] tracking-[-0.04em] text-foreground sm:text-5xl lg:text-[3.4rem]">
            ChistoLab.
            <br />
            <span className="text-teal">Пятнам здесь не место.</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
            Пятновыводители, точные протоколы уборки и проверенные клинеры.
            Всё для чистоты — в одном месте.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#rescue"
              className="inline-flex min-h-12 items-center gap-2 rounded-control bg-lime px-6 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Подобрать средство
              <ArrowUpRight className="size-4" aria-hidden />
            </a>
            <a
              href="#cleaners"
              className="inline-flex min-h-12 items-center gap-2 rounded-control border border-border bg-card px-6 text-sm font-semibold text-foreground transition-colors hover:border-ink/40"
            >
              Найти клинера
              <ArrowUpRight className="size-4" aria-hidden />
            </a>
          </div>
        </div>

        <div className="relative min-h-[260px] bg-muted sm:min-h-[340px] lg:min-h-0">
          <Image
            src="/lovable/hero.jpg"
            alt="Профессиональная химия ChistoLab"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>

      <HeroStats stats={stats} />
    </section>
  );
}
