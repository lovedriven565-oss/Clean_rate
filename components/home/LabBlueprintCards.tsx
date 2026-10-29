import Link from "next/link";
import { ArrowRight, FlaskConical, ShieldCheck, Sparkles } from "lucide-react";

/**
 * 3 крупные тёмные карточки с координатной сеткой и кастомной изометрической
 * пунктирной 3D-графикой (Blueprint SVG) в стиле нижнего промо-ряда Epic Games Store.
 */
export function LabBlueprintCards() {
  return (
    <section aria-label="Лаборатория и инструменты ChistoLab" className="grid gap-4 lg:grid-cols-3">
      {/* 1. ИИ-технолог и pH-анализ */}
      <article className="linear-beam group relative flex flex-col justify-between overflow-hidden rounded-panel bg-cta p-6 text-cta-foreground sm:p-7">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--cta-foreground)/0.06)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--cta-foreground)/0.06)_1px,transparent_1px)] bg-size-[28px_28px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-primary/35 blur-3xl transition-opacity duration-500 group-hover:opacity-90"
        />

        {/* Изометрический чертёж молекулярной сетки и колбы pH */}
        <div className="relative flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cta-foreground/15 bg-cta-foreground/10 px-3 py-1 font-data text-[11px] font-semibold uppercase tracking-wider text-brand">
            <Sparkles className="size-3.5" aria-hidden />
            AI · CHISTOLAB 01
          </span>
          <svg
            aria-hidden
            viewBox="0 0 140 96"
            className="h-20 w-28 shrink-0 text-brand transition-transform duration-500 group-hover:scale-105"
            fill="none"
          >
            {/* Изометрическая платформа */}
            <polygon
              points="70,12 126,40 70,68 14,40"
              stroke="currentColor"
              strokeOpacity="0.45"
              strokeWidth="1.25"
              strokeDasharray="3 3"
            />
            <polygon
              points="70,24 114,46 70,68 26,46"
              stroke="currentColor"
              strokeOpacity="0.85"
              strokeWidth="1.5"
            />
            {/* Гексагональное ядро pH */}
            <polygon
              points="70,26 90,36 90,54 70,64 50,54 50,36"
              fill="currentColor"
              fillOpacity="0.14"
              stroke="currentColor"
              strokeWidth="1.75"
            />
            <line x1="70" y1="8" x2="70" y2="88" stroke="currentColor" strokeOpacity="0.4" strokeDasharray="2 3" />
            <circle cx="70" cy="45" r="5" fill="currentColor" />
            <circle cx="50" cy="36" r="2.5" fill="currentColor" />
            <circle cx="90" cy="36" r="2.5" fill="currentColor" />
            <circle cx="70" cy="26" r="2.5" fill="currentColor" />
          </svg>
        </div>

        <div className="relative mt-4">
          <h3 className="font-display text-xl font-bold tracking-tight text-cta-foreground sm:text-2xl">
            ИИ-консультант по чистке
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-cta-foreground/75">
            Точечный триаж пятна за 1 клик: учитывает давность, замывание мылом и деликатность покрытия без риска сжечь ткань.
          </p>
        </div>

        <div className="relative mt-6 pt-2">
          <Link
            href="/assistant"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-5 text-xs font-semibold text-brand-foreground transition-transform group-hover:-translate-y-0.5 active:scale-[0.98]"
          >
            Запустить диагностику
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </article>

      {/* 2. Своими руками: экономия до 75% */}
      <article className="linear-beam group relative flex flex-col justify-between overflow-hidden rounded-panel bg-cta p-6 text-cta-foreground sm:p-7">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--cta-foreground)/0.06)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--cta-foreground)/0.06)_1px,transparent_1px)] bg-size-[28px_28px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-brand/25 blur-3xl transition-opacity duration-500 group-hover:opacity-90"
        />

        {/* Изометрический куб защиты слоёв материала */}
        <div className="relative flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cta-foreground/15 bg-cta-foreground/10 px-3 py-1 font-data text-[11px] font-semibold uppercase tracking-wider text-brand">
            <FlaskConical className="size-3.5" aria-hidden />
            DIY · ПРОТОКОЛЫ 02
          </span>
          <svg
            aria-hidden
            viewBox="0 0 140 96"
            className="h-20 w-28 shrink-0 text-brand transition-transform duration-500 group-hover:scale-105"
            fill="none"
          >
            {/* 3 изометрических слоя защиты покрытия */}
            <polygon
              points="70,10 118,32 70,54 22,32"
              fill="currentColor"
              fillOpacity="0.16"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <polygon
              points="70,26 118,48 70,70 22,48"
              stroke="currentColor"
              strokeOpacity="0.7"
              strokeWidth="1.4"
              strokeDasharray="4 3"
            />
            <polygon
              points="70,42 118,64 70,86 22,64"
              stroke="currentColor"
              strokeOpacity="0.45"
              strokeWidth="1.25"
            />
            <line x1="22" y1="32" x2="22" y2="64" stroke="currentColor" strokeOpacity="0.5" strokeDasharray="2 2" />
            <line x1="70" y1="54" x2="70" y2="86" stroke="currentColor" strokeOpacity="0.6" />
            <line x1="118" y1="32" x2="118" y2="64" stroke="currentColor" strokeOpacity="0.5" strokeDasharray="2 2" />
          </svg>
        </div>

        <div className="relative mt-4">
          <h3 className="font-display text-xl font-bold tracking-tight text-cta-foreground sm:text-2xl">
            Своими руками: экономия до 75%
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-cta-foreground/75">
            Пошаговые инструкции с предупреждениями «Не делайте» и средствами для изучения.
          </p>
        </div>

        <div className="relative mt-6 pt-2">
          <Link
            href="/solutions"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-cta-foreground/25 bg-cta-foreground/10 px-5 text-xs font-semibold text-cta-foreground transition-colors hover:bg-cta-foreground/20 active:scale-[0.98]"
          >
            Все 16 протоколов
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </article>

      {/* 3. Рейтинг мастеров и проф-химия */}
      <article className="linear-beam group relative flex flex-col justify-between overflow-hidden rounded-panel bg-cta p-6 text-cta-foreground sm:p-7">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--cta-foreground)/0.06)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--cta-foreground)/0.06)_1px,transparent_1px)] bg-size-[28px_28px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-sponsor/25 blur-3xl transition-opacity duration-500 group-hover:opacity-90"
        />

        {/* Изометрический чертёж оборудования и индекса доверия */}
        <div className="relative flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cta-foreground/15 bg-cta-foreground/10 px-3 py-1 font-data text-[11px] font-semibold uppercase tracking-wider text-sponsor">
            <ShieldCheck className="size-3.5" aria-hidden />
            PRO · РЕЙТИНГ 03
          </span>
          <svg
            aria-hidden
            viewBox="0 0 140 96"
            className="h-20 w-28 shrink-0 text-sponsor transition-transform duration-500 group-hover:scale-105"
            fill="none"
          >
            {/* Изометрическая призма рейтинга и контур экстрактора */}
            <polygon
              points="70,12 116,34 116,66 70,88 24,66 24,34"
              stroke="currentColor"
              strokeOpacity="0.6"
              strokeWidth="1.4"
              strokeDasharray="3 3"
            />
            <polygon
              points="70,22 102,38 70,54 38,38"
              fill="currentColor"
              fillOpacity="0.16"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <polyline
              points="38,38 38,62 70,78 102,62 102,38"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <line x1="70" y1="54" x2="70" y2="78" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="70" cy="38" r="4" fill="currentColor" />
          </svg>
        </div>

        <div className="relative mt-4">
          <h3 className="font-display text-xl font-bold tracking-tight text-cta-foreground sm:text-2xl">
            Рейтинг мастеров и проф-химия
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-cta-foreground/75">
            Прямые телефоны проверенных клининговых компаний и индекс доверия брендов профессиональной химии без накруток.
          </p>
        </div>

        <div className="relative mt-6 flex flex-wrap items-center gap-2.5 pt-2">
          <Link
            href="/rating"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-cta-foreground/25 bg-cta-foreground/10 px-5 text-xs font-semibold text-cta-foreground transition-colors hover:bg-cta-foreground/20 active:scale-[0.98]"
          >
            Рейтинг компаний
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link
            href="/brands"
            className="inline-flex min-h-11 items-center px-3 text-xs font-semibold text-brand hover:underline"
          >
            Индекс брендов →
          </Link>
        </div>
      </article>
    </section>
  );
}
