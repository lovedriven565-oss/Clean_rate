import type { Metadata } from "next";
import { BarChart3, Boxes, FileText, MousePointerClick, Network, Presentation, Target, Users } from "lucide-react";
import { BrandLeadForm } from "@/components/BrandLeadForm";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { brands, companies } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Брендам и поставщикам | Клининг Рейтинг",
  description: "Пилотные интеграции для производителей, импортёров и дилеров индустрии чистоты с прозрачной аналитикой.",
};

const outcomes = [
  { icon: Target, title: "Профессиональный контекст", text: "Размещение рядом с релевантной услугой, технологией и аудиторией, а не случайный массовый показ." },
  { icon: MousePointerClick, title: "Измеримое действие", text: "Переход к дилеру, запрос демонстрации, скачивание материала или регистрация на обучение." },
  { icon: BarChart3, title: "Прозрачный отчёт", text: "Только фактические показы и действия. На старте мы не обещаем охват, которого ещё нет." },
];

const formats = [
  { icon: Boxes, title: "Профиль решения", text: "Бренд, продукты, дилеры, сервис и подтверждённые сценарии применения." },
  { icon: FileText, title: "Экспертный материал", text: "Практический разбор технологии с открытой рекламной маркировкой." },
  { icon: Presentation, title: "Демо и обучение", text: "Регистрация профессионалов на вебинар, тест-драйв или запрос образца." },
  { icon: Network, title: "Исследование рынка", text: "Спонсорство отраслевого отчёта без влияния на его выводы и рейтинг компаний." },
];

export default function ForBrandsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="bg-fresh relative overflow-hidden border-b border-border">
          <div className="bg-grid-fade absolute inset-0" aria-hidden />
          <div className="container relative grid gap-12 py-16 lg:grid-cols-[1fr_0.82fr] lg:items-center lg:py-24">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Брендам и поставщикам</span>
              <h1 className="mt-4 max-w-4xl font-display text-4xl font-extrabold tracking-[-0.05em] text-foreground sm:text-6xl">
                Не покупать баннер. Стать частью инфраструктуры рынка.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                Создаём пилотные интеграции для техники, профессиональной химии и инвентаря. Связываем бренд с задачей,
                дилером и измеримым действием — отдельно от органического рейтинга компаний.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <span className="rounded-full border border-border bg-card/80 px-4 py-2 text-sm font-semibold text-foreground">{companies.length} компаний в текущем каталоге</span>
                <span className="rounded-full border border-border bg-card/80 px-4 py-2 text-sm font-semibold text-foreground">{brands.length} профилей решений</span>
                <span className="rounded-full border border-border bg-card/80 px-4 py-2 text-sm font-semibold text-foreground">Пилотная стадия</span>
              </div>
            </div>
            <div className="data-surface rounded-[2rem] border border-border p-7 sm:p-9">
              <Users className="h-7 w-7 text-primary" />
              <h2 className="mt-8 font-display text-2xl font-bold text-foreground">Сначала — полезная аудитория</h2>
              <p className="mt-3 leading-7 text-muted-foreground">
                На старте предложение строится вокруг экспертного контента, профиля и пилотной активации. CPM и массовый охват появятся только после накопления реальной статистики.
              </p>
            </div>
          </div>
        </section>

        <section className="container py-16 sm:py-24">
          <div className="grid gap-5 lg:grid-cols-3">
            {outcomes.map((outcome) => (
              <article key={outcome.title} className="rounded-[1.75rem] border border-border bg-card p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><outcome.icon className="h-5 w-5" /></span>
                <h2 className="mt-7 font-display text-xl font-bold text-foreground">{outcome.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{outcome.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-muted/35 py-16 sm:py-24">
          <div className="container">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Форматы пилота</span>
            <h2 className="mt-3 max-w-3xl font-display text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-5xl">Реклама, которая добавляет рынку полезность</h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {formats.map((format) => (
                <article key={format.title} className="data-surface flex gap-5 rounded-[1.5rem] border border-border p-6">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><format.icon className="h-5 w-5" /></span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground">{format.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{format.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="container grid gap-10 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:py-24">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Первый запуск</span>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">Соберём формат под один проверяемый результат</h2>
            <p className="mt-5 max-w-xl leading-7 text-muted-foreground">
              Не публикуем выдуманный медиакит и не продаём место в рейтинге. Определим аудиторию, действие и отчёт до запуска пилота.
            </p>
          </div>
          <BrandLeadForm />
        </section>
      </main>
      <Footer />
    </div>
  );
}
