"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RotateCw, TriangleAlert } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app:error]", error.digest ?? error.message);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center bg-background">
      <section className="container py-20">
        <div role="alert" className="data-surface mx-auto max-w-xl rounded-panel p-8 text-center sm:p-12">
          <TriangleAlert className="mx-auto h-8 w-8 text-danger" aria-hidden />
          <h1 className="mt-5 font-display text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
            Что-то пошло не так
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Страница не загрузилась. Попробуйте ещё раз или вернитесь на главную.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-brand-foreground transition-transform active:scale-[0.98]"
            >
              <RotateCw className="h-4 w-4" />
              Повторить
            </button>
            <Link href="/" className="inline-flex h-12 items-center px-4 text-sm font-semibold text-link hover:underline">
              На главную
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
