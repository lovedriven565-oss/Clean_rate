"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Moon, Sun, ArrowRight, ArrowUpRight, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { demoTasks, demoProducts, demoCompany, demoAd, demoNav, demoChips, demoHeroImg } from "./demo-data";

const audiences = ["Для дома", "Для бизнеса", "Для профи"];

export default function EditorialDemo() {
  const [dark, setDark] = useState(false);
  const [audience, setAudience] = useState(0);

  return (
    <div className={cn("vb", dark && "vb-dark", "min-h-screen bg-[hsl(var(--v-bg))] font-sans text-[hsl(var(--v-ink))] antialiased")}>
      <style>{`
        .vb {
          --v-bg: 60 14% 97%;
          --v-surface: 60 24% 99%;
          --v-ink: 165 9% 12%;
          --v-ink2: 150 6% 40%;
          --v-line: 60 8% 85%;
          --v-accent: 168 39% 30%;
          --v-accent-ink: 0 0% 100%;
          --v-tint: 75 12% 93%;
          --v-ad: 38 92% 36%;
        }
        .vb.vb-dark {
          --v-bg: 165 10% 8%;
          --v-surface: 165 8% 12%;
          --v-ink: 90 10% 92%;
          --v-ink2: 120 5% 60%;
          --v-line: 160 7% 22%;
          --v-accent: 165 35% 62%;
          --v-accent-ink: 165 25% 10%;
          --v-tint: 160 8% 16%;
          --v-ad: 40 85% 62%;
        }
        .vb img { display: block; }
      `}</style>

      {/* Demo header */}
      <header className="border-b border-[hsl(var(--v-line))]">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center gap-8 px-5">
          <Link href="/dev/design" className="text-lg tracking-tight">
            <span className="font-bold italic">Клининг</span>{" "}
            <span className="font-light">Рейтинг</span>
          </Link>
          <nav className="ml-auto hidden items-center gap-7 md:flex">
            {demoNav.map((item, i) => (
              <span
                key={item}
                className={cn(
                  "cursor-default text-sm transition-colors hover:text-[hsl(var(--v-ink))]",
                  i === 0 ? "font-medium text-[hsl(var(--v-ink))] underline decoration-[hsl(var(--v-accent))] decoration-2 underline-offset-8" : "text-[hsl(var(--v-ink2))]"
                )}
              >
                {item}
              </span>
            ))}
          </nav>
          <div className="flex items-center gap-4 md:ml-0 ml-auto">
            <span className="hidden text-xs uppercase tracking-[0.14em] text-[hsl(var(--v-ink2))] sm:block">Минск</span>
            <button
              type="button"
              onClick={() => setDark((v) => !v)}
              aria-label="Переключить тему прототипа"
              className="grid size-9 place-items-center rounded-md border border-[hsl(var(--v-line))] text-[hsl(var(--v-ink2))] transition-colors hover:text-[hsl(var(--v-ink))]"
            >
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5">
        {/* Hero — wide headline, image below offset */}
        <section className="pb-16 pt-14">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[hsl(var(--v-accent))]">Независимый выбор средств, техники и клининга</p>
          <h1 className="mt-5 max-w-4xl text-balance text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-[4.25rem]">
            Чистота начинается с <em className="not-italic text-[hsl(var(--v-accent))]">правильного</em> выбора
          </h1>

          <div className="mt-12 grid gap-10 lg:grid-cols-12">
            <div className="relative lg:col-span-7">
              <div className="relative aspect-[16/9] overflow-hidden rounded-md">
                <Image src={demoHeroImg} alt="Демо: предметная сцена уборки" fill sizes="(min-width: 1024px) 56vw, 92vw" className="object-cover" />
              </div>
              <p className="mt-2 text-xs text-[hsl(var(--v-ink2))]">Демонстрационное фото. Финальные иллюстрации — после согласования активов.</p>
            </div>

            <div className="flex flex-col justify-center lg:col-span-5 lg:pt-6">
              <p className="max-w-sm text-base leading-relaxed text-[hsl(var(--v-ink2))]">
                Опишите задачу — покажем подходящие средства, технику и компании вашего города с источником каждой оценки.
              </p>

              <div className="mt-6 flex gap-5 border-b border-[hsl(var(--v-line))]" role="group" aria-label="Аудитория">
                {audiences.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setAudience(i)}
                    className={cn(
                      "-mb-px border-b-2 pb-3 text-sm font-medium transition-colors",
                      i === audience
                        ? "border-[hsl(var(--v-accent))] text-[hsl(var(--v-ink))]"
                        : "border-transparent text-[hsl(var(--v-ink2))] hover:text-[hsl(var(--v-ink))]"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex h-14 items-center gap-3 border border-[hsl(var(--v-ink))]/20 bg-[hsl(var(--v-surface))] px-4">
                <Search className="size-5 shrink-0 text-[hsl(var(--v-ink2))]" />
                <input
                  type="text"
                  placeholder="Что нужно очистить?"
                  aria-label="Что нужно очистить?"
                  className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-[hsl(var(--v-ink2))]"
                />
                <button type="button" className="shrink-0 bg-[hsl(var(--v-accent))] px-5 py-2 text-sm font-semibold text-[hsl(var(--v-accent-ink))] transition-opacity hover:opacity-90">
                  Найти
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
                {demoChips.map((chip) => (
                  <span key={chip} className="cursor-default text-sm text-[hsl(var(--v-ink2))] underline decoration-[hsl(var(--v-line))] underline-offset-4 transition-colors hover:text-[hsl(var(--v-accent))] hover:decoration-[hsl(var(--v-accent))]">
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Task index — editorial asymmetric grid */}
        <section className="border-t border-[hsl(var(--v-line))] py-14">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="text-3xl font-bold tracking-tight">Выберите задачу</h2>
            <span className="flex cursor-default items-center gap-1.5 text-sm font-medium text-[hsl(var(--v-accent))]">
              Все задачи <ArrowRight className="size-4" />
            </span>
          </div>
          <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {demoTasks.map((task, i) => (
              <article key={task.slug} className={cn("group", i === 0 && "sm:col-span-2 lg:row-span-1")}>
                <div className={cn("relative overflow-hidden rounded-md bg-[hsl(var(--v-tint))]", i === 0 ? "aspect-[2/1]" : "aspect-[4/3]")}>
                  <Image
                    src={task.img}
                    alt={`Демо: ${task.title}`}
                    fill
                    sizes={i === 0 ? "(min-width: 1024px) 44vw, 92vw" : "(min-width: 1024px) 20vw, 44vw"}
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <h3 className={cn("mt-4 font-semibold tracking-tight", i === 0 ? "text-xl" : "text-lg")}>{task.title}</h3>
                <p className="mt-0.5 text-sm text-[hsl(var(--v-ink2))]">{task.note}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Products — editorial rows with hairlines */}
        <section className="border-t border-[hsl(var(--v-line))] py-14">
          <h2 className="mb-8 text-3xl font-bold tracking-tight">Средства под задачу</h2>
          <div className="divide-y divide-[hsl(var(--v-line))] border-y border-[hsl(var(--v-line))]">
            {demoProducts.map((p, i) => (
              <article key={p.name} className="group grid items-center gap-5 py-6 sm:grid-cols-[140px_1fr_auto]">
                <div className={cn("relative aspect-[4/3] w-full overflow-hidden rounded-md bg-[hsl(var(--v-tint))] sm:w-[140px]", i === 1 && "sm:order-1")}>
                  <Image src={p.img} alt={`Демо: ${p.name}`} fill sizes="140px" className="object-cover" />
                </div>
                <div className={cn(i === 1 && "sm:order-2")}>
                  <h3 className="text-lg font-semibold tracking-tight">{p.name}</h3>
                  <p className="mt-1 text-sm text-[hsl(var(--v-ink2))]">{p.purpose}</p>
                  <p className="mt-0.5 text-xs text-[hsl(var(--v-ink2))]">{p.constraint}</p>
                </div>
                <div className={cn("flex items-center gap-5 sm:flex-col sm:items-end sm:gap-2", i === 1 && "sm:order-3")}>
                  <span className="text-base font-semibold">{p.price}</span>
                  <span className="flex cursor-default items-center gap-1 text-sm font-semibold text-[hsl(var(--v-accent))]">
                    Подробнее <ArrowUpRight className="size-4" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Company + Ad */}
        <section className="grid gap-10 border-t border-[hsl(var(--v-line))] py-14 lg:grid-cols-2">
          <div>
            <h2 className="mb-8 text-3xl font-bold tracking-tight">Компании вашего города</h2>
            <article className="flex items-center gap-5 border-y border-[hsl(var(--v-line))] py-5">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-[hsl(var(--v-tint))]">
                <Image src={demoCompany.img} alt={`Демо: ${demoCompany.name}`} fill sizes="80px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold tracking-tight">{demoCompany.name}</h3>
                <p className="text-xs text-[hsl(var(--v-ink2))]">{demoCompany.city} · {demoCompany.ratingSource}</p>
                <p className="mt-1 text-sm text-[hsl(var(--v-ink2))]">{demoCompany.price}</p>
              </div>
              <span className="flex cursor-default items-center gap-1.5 bg-[hsl(var(--v-accent))] px-5 py-2.5 text-sm font-semibold text-[hsl(var(--v-accent-ink))]">
                <Phone className="size-4" /> Позвонить
              </span>
            </article>
          </div>

          <div>
            <h2 className="mb-8 text-3xl font-bold tracking-tight">Рекламный слот</h2>
            <article className="relative border border-[hsl(var(--v-line))] bg-[hsl(var(--v-surface))] p-5 pl-14">
              <span className="absolute left-0 top-0 flex h-full w-10 items-center justify-center border-r border-[hsl(var(--v-line))]">
                <span className="rotate-180 text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(var(--v-ad))] [writing-mode:vertical-rl]">Реклама</span>
              </span>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold tracking-tight">{demoAd.title}</h3>
                <span className="text-xs text-[hsl(var(--v-ink2))]">{demoAd.advertiser}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--v-ink2))]">{demoAd.description}</p>
              <span className="mt-3 inline-flex cursor-default items-center gap-1 text-sm font-semibold text-[hsl(var(--v-accent))]">
                {demoAd.cta} <ArrowUpRight className="size-4" />
              </span>
            </article>
          </div>
        </section>

        {/* States */}
        <section className="border-t border-[hsl(var(--v-line))] py-14">
          <h2 className="mb-8 text-3xl font-bold tracking-tight">Состояния</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="border border-[hsl(var(--v-line))] bg-[hsl(var(--v-surface))] p-5" aria-label="Загрузка">
              <div className="flex gap-5">
                <div className="size-20 animate-pulse rounded-md bg-[hsl(var(--v-tint))]" />
                <div className="flex-1 space-y-2.5 py-1.5">
                  <div className="h-4 w-2/3 animate-pulse bg-[hsl(var(--v-tint))]" />
                  <div className="h-3.5 w-1/2 animate-pulse bg-[hsl(var(--v-tint))]" />
                  <div className="h-3.5 w-1/3 animate-pulse bg-[hsl(var(--v-tint))]" />
                </div>
              </div>
            </div>
            <div className="grid place-items-center border border-dashed border-[hsl(var(--v-line))] p-10 text-center">
              <div>
                <p className="text-lg font-semibold tracking-tight">Ничего не нашлось</p>
                <p className="mt-1 text-sm text-[hsl(var(--v-ink2))]">Попробуйте описать задачу иначе или выберите задачу из списка выше.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[hsl(var(--v-line))] py-8">
        <p className="mx-auto max-w-6xl px-5 text-xs text-[hsl(var(--v-ink2))]">
          Прототип B «Редакционный навигатор» · демо-данные и фото · только для сравнения направлений ·{" "}
          <Link href="/dev/design" className="underline underline-offset-2 hover:text-[hsl(var(--v-ink))]">← к витрине дизайна</Link>
          {" · "}
          <Link href="/dev/design/a-vitrina" className="underline underline-offset-2 hover:text-[hsl(var(--v-ink))]">вариант A →</Link>
        </p>
      </footer>
    </div>
  );
}
