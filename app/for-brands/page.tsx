import { Suspense } from "react";
import type { Metadata } from "next";
import { BarChart3, Boxes, FileText, MousePointerClick, Network, Presentation, Target, Users } from "lucide-react";
import { BrandLeadForm } from "@/components/BrandLeadForm";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { getSolutionBySlug } from "@/lib/db/queries";
import { absoluteUrl, pageAlternates } from "@/lib/site";
import { cn } from "@/lib/utils";

const title = "Брендам и поставщикам";
const description =
  "Пилотные интеграции для производителей, импортёров и дилеров индустрии чистоты: размещение рядом с задачей, открытая маркировка и отчёт по фактическим действиям.";

export const metadata: Metadata = {
  title,
  description,
  alternates: pageAlternates("/for-brands"),
  openGraph: { title, description, url: absoluteUrl("/for-brands"), type: "website" },
};

/** Принципы вместо счётчиков каталога: на пилотной стадии цифры охвата ещё не аргумент. */
const principles = ["Маркировка «Реклама» на каждом размещении", "Отчёт только по фактическим действиям", "Пилотная стадия"];

const outcomes = [
  { icon: Target, title: "Профессиональный контекст", text: "Размещение рядом с релевантной услугой, технологией и аудиторией, а не случайный массовый показ." },
  { icon: MousePointerClick, title: "Измеримое действие", text: "Переход к дилеру, запрос демонстрации, скачивание материала или регистрация на обучение." },
  { icon: BarChart3, title: "Прозрачный отчёт", text: "Только фактические показы и действия. На старте мы не обещаем охват, которого ещё нет." },
];

const formats = [
  { icon: Boxes, title: "Профиль решения", text: "Бренд, продукты, дилеры, сервис и подтверждённые сценарии применения.", featured: true },
  { icon: FileText, title: "Экспертный материал", text: "Практический разбор технологии с открытой рекламной маркировкой." },
  { icon: Presentation, title: "Демо и обучение", text: "Регистрация профессионалов на вебинар, тест-драйв или запрос образца." },
  { icon: Network, title: "Исследование рынка", text: "Спонсорство отраслевого отчёта без влияния на его выводы и рейтинг компаний." },
];

export default async function ForBrandsPage({
  searchParams,
}: {
  searchParams?: Promise<{ solution?: string; surface?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const solutionSlug = typeof resolvedParams?.solution === "string" ? resolvedParams.solution.trim() : undefined;
  const surface = typeof resolvedParams?.surface === "string" ? resolvedParams.surface.trim() : undefined;
  const matchedSolution = solutionSlug ? await getSolutionBySlug(solutionSlug) : null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="bg-fresh relative overflow-hidden border-b border-border">
          <div className="container relative grid gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
            <div>
              <span className="inline-flex items-center gap-2 data-surface rounded-full px-3.5 py-1.5 text-xs font-semibold text-primary">
                <Boxes className="h-3.5 w-3.5" />
                Брендам и поставщикам
              </span>
              <h1 className="mt-5 max-w-4xl font-display text-4xl font-bold tracking-[-0.04em] text-foreground sm:text-6xl">
                Не покупать баннер. Стать частью инфраструктуры рынка.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                Создаём пилотные интеграции для техники, профессиональной химии и инвентаря. Связываем бренд с задачей,
                дилером и измеримым действием: отдельно от органического рейтинга компаний.
              </p>
              <div className="mt-8 flex flex-wrap gap-2.5">
                {principles.map((item, index) => (
                  <span
                    key={item}
                    className={cn(
                      "data-surface rounded-full px-3.5 py-1.5 text-xs font-semibold",
                      index === principles.length - 1 ? "text-primary" : "text-foreground"
                    )}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="data-surface rounded-panel p-7 sm:p-9">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-control bg-primary/10 text-primary">
                <Users className="h-6 w-6" />
              </span>
              <h2 className="mt-6 font-display text-2xl font-bold text-foreground">Сначала: полезная аудитория</h2>
              <p className="mt-3 leading-7 text-muted-foreground">
                На старте предложение строится вокруг экспертного контента, профиля и пилотной активации. Массовые рекламные форматы появятся только после накопления подтверждённой статистики.
              </p>
            </div>
          </div>
        </section>

        {/* Outcomes: Editorial List with Dividers instead of 3 identical boxes */}
        <section className="container py-16 sm:py-24">
          <div className="mb-12 max-w-2xl">
            <h2 className="font-display text-3xl font-bold tracking-[-0.035em] text-foreground sm:text-4xl">
              Что даёт интеграция в платформу
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {outcomes.map((outcome) => (
              <div key={outcome.title} className="border-t border-border pt-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-control bg-primary/10 text-primary">
                  <outcome.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-display text-xl font-bold text-foreground">{outcome.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{outcome.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Formats */}
        <section className="border-y border-border bg-muted/30 py-16 sm:py-24">
          <div className="container">
            <h2 className="max-w-3xl font-display text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-5xl">
              Реклама, которая добавляет рынку полезность
            </h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {formats.map((format) => (
                <article
                  key={format.title}
                  className="data-surface rounded-panel p-7 transition-[border-color,box-shadow] hover:border-brand/50"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-primary/10 text-primary">
                    <format.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-bold text-foreground">{format.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{format.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Lead Form */}
        <section id="brand-lead-form" className="container grid gap-10 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:py-24">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">
              Соберём формат под один проверяемый результат
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
              Не публикуем выдуманный медиакит и не продаём место в рейтинге. Определим аудиторию, действие и отчёт до запуска пилота.
            </p>
          </div>
          <Suspense fallback={<div className="min-h-96 rounded-panel border border-border bg-card p-6 sm:p-8" />}>
            <BrandLeadForm
              initialSolutionSlug={solutionSlug}
              initialSolutionTitle={matchedSolution?.title}
              initialSurface={surface ?? matchedSolution?.surface}
            />
          </Suspense>
        </section>
      </main>
      <Footer />
    </div>
  );
}
