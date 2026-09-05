import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, BarChart3, CircleDollarSign, Database } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Методология рейтинга | Клининг Рейтинг",
  description: "Как рассчитывается органический рейтинг компаний и почему платное размещение не влияет на оценку.",
};

const factors = [
  {
    icon: BarChart3,
    value: "75%",
    title: "Оценка источника",
    description: "Нормализованная оценка из опубликованного внешнего источника отзывов.",
  },
  {
    icon: Database,
    value: "15%",
    title: "Объём отзывов",
    description: "Логарифмический коэффициент доверия: первые отзывы важны, но количество не покупает лидерство автоматически.",
  },
  {
    icon: BadgeCheck,
    value: "10%",
    title: "Проверка и профиль",
    description: "До 5% за подтверждение компании и до 5% за полноту полезных данных.",
  },
];

export default function RatingMethodologyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="bg-fresh relative overflow-hidden border-b border-border">
          <div className="bg-grid-fade absolute inset-0" aria-hidden />
          <div className="container relative py-16 sm:py-24">
            <Link href="/rating" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <ArrowLeft className="h-4 w-4" />
              Вернуться к рейтингу
            </Link>
            <span className="mt-10 block text-xs font-bold uppercase tracking-[0.2em] text-primary">Открытая формула</span>
            <h1 className="mt-3 max-w-4xl font-display text-4xl font-extrabold tracking-[-0.045em] text-foreground sm:text-6xl">
              Рейтинг нельзя купить
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Органический балл формируется только для компаний с опубликованной оценкой и отзывами из указанного источника.
              Коммерческое размещение хранится отдельно и не участвует в вычислении.
            </p>
          </div>
        </section>

        <section className="container py-16 sm:py-24">
          <div className="grid gap-5 lg:grid-cols-3">
            {factors.map((factor) => (
              <article key={factor.title} className="data-surface rounded-[1.75rem] border border-border p-7">
                <div className="flex items-center justify-between gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <factor.icon className="h-5 w-5" />
                  </span>
                  <span className="font-display text-3xl font-extrabold text-primary">{factor.value}</span>
                </div>
                <h2 className="mt-8 font-display text-xl font-bold text-foreground">{factor.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{factor.description}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-[1.75rem] border border-border bg-card p-7 sm:p-10">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/12 text-accent">
                <CircleDollarSign className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">Что получает платный партнёр</h2>
                <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
                  Только явно маркированную видимость: рекламный блок, расширенный материал или кампанию. Партнёрство не меняет оценку,
                  число отзывов, статус источника и органический балл.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
