import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Hand, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SolutionsExplorer } from "@/components/solution/SolutionsExplorer";
import { getAllSolutions } from "@/lib/db/queries";
import { pageAlternates } from "@/lib/site";

export const metadata: Metadata = {
  title: "Решения задач чистоты: пятна, запахи, налёт, после ремонта",
  description:
    "База решений «Два пути»: пошаговый протокол, чтобы справиться самому, и честная смета с компаниями вашего города, если нужен мастер. Пятна на диване и матрасе, налёт, жир, последствия ремонта.",
  alternates: pageAlternates("/solutions"),
};

export default async function SolutionsPage() {
  const solutions = await getAllSolutions();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <section className="bg-fresh relative overflow-hidden border-b border-border">
          <div className="container relative py-12 sm:py-16">
            <nav aria-label="Хлебные крошки" className="text-xs text-muted-foreground">
              <ol className="flex items-center gap-2">
                <li>
                  <Link href="/" className="hover:text-foreground">Главная</Link>
                </li>
                <li aria-hidden>/</li>
                <li className="font-medium text-foreground">Решения</li>
              </ol>
            </nav>
            <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-[-0.04em] text-foreground sm:text-5xl">
              Решения задач чистоты
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Каждая задача: два пути. Пошаговый протокол, если хотите справиться сами, и честная смета
              с компаниями вашего города, если нужен мастер.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1.5">
                <Hand className="h-3.5 w-3.5 text-primary" />
                Сделать самому
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Вызвать мастера
              </span>
            </div>
          </div>
        </section>

        <section className="container py-10 sm:py-14">
          <SolutionsExplorer solutions={solutions} />
        </section>

        <section className="container pb-16 sm:pb-24">
          <div className="rounded-panel border border-border bg-card p-6 sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-8">
            <div className="max-w-2xl">
              <h2 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Не нашли свою задачу?
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Опишите её консультанту — он ответит по проверенным протоколам или честно скажет, что данных нет.
                Можно приложить фото.
              </p>
            </div>
            <div className="mt-5 flex shrink-0 flex-wrap gap-3 lg:mt-0">
              <Link
                href="/assistant"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                Спросить консультанта
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/rating"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-semibold text-foreground transition-colors hover:border-primary/40"
              >
                Открыть рейтинг
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
