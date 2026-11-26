import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { HeroStats, type HeroStatsData } from "@/components/home/HeroStats";
import { HeroAnswerSlot, HeroAnswerStatus, HeroAssistantProvider, HeroPhotoAssist } from "@/components/home/HeroAssistant";
import { HeroSearch } from "@/components/home/HeroSearch";

/**
 * Первый экран — светлая карточка: H1, умный поиск (тот же, что в шапке на
 * других страницах — на главной шапочный поиск скрыт, поэтому здесь он обязателен)
 * и два быстрых пути. По Enter поиск уходит ИИ-технологу, ответ разворачивается
 * в правой колонке (на мобильных — под полем) без ухода со страницы.
 * Серверный компонент: SmartSearch — единственный клиентский островок, HeroStats получает урезанные DTO.
 */
export function PlatformHero({ stats }: { stats: HeroStatsData }) {
  return (
    <HeroAssistantProvider>
      <PlatformHeroContent stats={stats} />
    </HeroAssistantProvider>
  );
}

function PlatformHeroContent({ stats }: { stats: HeroStatsData }) {
  return (
    <section className="container pt-6 sm:pt-8">
      <div className="grid overflow-hidden rounded-panel border border-border bg-card lg:grid-cols-[1.02fr_0.98fr]">
        <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
          <p className="font-data text-[11px] font-bold uppercase tracking-[0.16em] text-teal">
            ChistoLab · протоколы и клинеры
          </p>
          <h1 className="mt-4 max-w-xl text-balance font-display text-4xl font-bold leading-[1.04] tracking-[-0.04em] text-foreground sm:text-5xl lg:text-[3.4rem]">
            Уберите любое пятно —
            <br />
            <span className="text-teal">сами или с мастером</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
            Опишите, что и где испачкалось: технолог ответит по проверенным протоколам
            со средствами или подберёт клинера в вашем городе.
          </p>
          <HeroAnswerStatus />

          <div className="mt-7">
            <HeroSearch />
            <div className="mt-4">
              <HeroPhotoAssist />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href="#rescue"
              className="inline-flex min-h-12 items-center gap-2 rounded-control bg-lime px-6 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Убрать самому
              <ArrowUpRight className="size-4" aria-hidden />
            </a>
            <a
              href="#cleaners"
              className="inline-flex min-h-12 items-center gap-2 rounded-control border border-border bg-card px-6 text-sm font-semibold text-foreground transition-colors hover:border-ink/40"
            >
              Вызвать клинера
              <ArrowUpRight className="size-4" aria-hidden />
            </a>
          </div>
        </div>

        <HeroAnswerSlot>
          <Image
            src="/lovable/hero.jpg"
            alt="Профессиональная химия ChistoLab"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </HeroAnswerSlot>
      </div>

      <HeroStats stats={stats} />
    </section>
  );
}
