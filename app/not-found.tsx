import Link from "next/link";
import { ArrowRight, SearchX } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex flex-1 items-center">
        <section className="container py-20 sm:py-28">
          <div className="data-surface mx-auto max-w-xl rounded-panel p-8 text-center sm:p-12">
            <SearchX className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden />
            <p className="font-data mt-6 text-5xl font-medium text-muted-foreground/40">404</p>
            <h1 className="mt-4 font-display text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
              Такой страницы нет
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Ссылка устарела или адрес набран с ошибкой. Найдите решение задачи в каталоге или откройте рейтинг компаний.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/solutions"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-brand-foreground transition-transform active:scale-[0.98]"
              >
                Все решения
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/rating" className="inline-flex h-12 items-center px-4 text-sm font-semibold text-link hover:underline">
                Рейтинг компаний
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
