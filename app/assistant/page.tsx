import type { Metadata } from "next";
import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AssistantPanel } from "@/components/assistant/AssistantPanel";
import { pageAlternates } from "@/lib/site";

export const metadata: Metadata = {
  title: "AI-консультант по чистке",
  description:
    "Опишите пятно или загрязнение — консультант ответит по проверенным протоколам: шаги, безопасные средства, когда вызвать мастера.",
  alternates: pageAlternates("/assistant"),
};

export default function AssistantPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
          <header className="max-w-xl">
            <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Консультант по чистке
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Отвечает только по проверенным протоколам. Если ответа в базе нет —
              скажет об этом прямо, а не выдумает рецепт.
            </p>
          </header>
          <Suspense>
            <AssistantPanel />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
