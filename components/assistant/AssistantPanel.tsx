"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ImagePlus, Loader2, ShieldCheck, Sparkles, X } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { PhScale } from "@/components/ui/PhScale";
import { Input } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import type { AssistantAnswer } from "@/lib/assistant/engine";

const MAX_IMAGE_BYTES = 1_500_000;

/** Панель AI-консультанта: вопрос + опциональное фото → ответ по протоколам. */
export function AssistantPanel() {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<AssistantAnswer | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Вход «по фото» из главной строки поиска: сразу открываем выбор файла.
  useEffect(() => {
    if (params.get("photo") === "1") fileRef.current?.click();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFile(file: File | undefined) {
    setImageError(null);
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("Фото больше 1,5 МБ — уменьшите его и попробуйте снова.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(typeof reader.result === "string" ? reader.result : null);
      setImageName(file.name);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = query.trim();
    if (!message || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, image: image ?? undefined }),
      });
      if (!res.ok) throw new Error("assistant failed");
      setAnswer(await res.json());
    } catch {
      setAnswer({
        mode: "empty",
        text: "Не удалось получить ответ. Попробуйте ещё раз чуть позже.",
        products: [],
        warnings: [],
        confidence: 0,
        imageUsed: false,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8">
      <Panel variant="glass" className="p-3 sm:p-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="relative">
            <Sparkles className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Опишите задачу: «запах в холодильнике», «кофе на ковре»…"
              aria-label="Вопрос консультанту по чистке"
              className="h-12 border-transparent bg-transparent pl-11 pr-12 shadow-none focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label="Приложить фото поверхности или пятна"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-control p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ImagePlus className="h-4 w-4" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>

          {imageName && (
            <div className="flex items-center justify-between gap-3 rounded-control border border-border bg-card px-3 py-2 text-xs">
              <span className="truncate text-muted-foreground">
                {imageName} — обрабатывается в памяти, не сохраняется
              </span>
              <button
                type="button"
                aria-label="Убрать фото"
                onClick={() => {
                  setImage(null);
                  setImageName(null);
                }}
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          {imageError && (
            <p role="alert" className="px-1 text-xs text-danger">
              {imageError}
            </p>
          )}

          <div className="flex items-center justify-between gap-3 px-1">
            <p className="text-xs text-muted-foreground">
              Ответ строится по проверенным протоколам, средства проходят проверку совместимости.
            </p>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className={cn(
                "inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition",
                "hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Спросить
            </button>
          </div>
        </form>
      </Panel>

      {answer && (
        <Panel variant="card" className="mt-5 p-5 sm:p-6">
          <p className="whitespace-pre-line text-sm leading-relaxed sm:text-base">{answer.text}</p>

          {answer.warnings.length > 0 && (
            <div className="mt-4 rounded-control border border-danger/30 bg-danger/5 p-3">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-danger">
                <AlertTriangle className="h-3.5 w-3.5" /> Осторожно
              </p>
              <ul className="mt-2 space-y-1 text-xs text-foreground/90">
                {answer.warnings.map((w) => (
                  <li key={w}>— {w}</li>
                ))}
              </ul>
            </div>
          )}

          {answer.products.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Средства из протокола
              </p>
              <ul className="mt-2 space-y-3">
                {answer.products.map((p) => (
                  <li key={p.id ?? p.note} className="rounded-control border border-border p-3">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="font-medium">{[p.brandName, p.note].filter(Boolean).join(": ")}</span>
                      {p.verified && (
                        <span className="inline-flex items-center gap-1 text-xs text-primary">
                          <ShieldCheck className="h-3.5 w-3.5" /> Совместимость проверена
                        </span>
                      )}
                    </div>
                    {p.ph !== undefined && (
                      <PhScale compact className="mt-2" ph={p.ph} />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {answer.solution && (
            <Link
              href={`/solutions/${answer.solution.slug}`}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Полный протокол: {answer.solution.title}
            </Link>
          )}
        </Panel>
      )}
    </div>
  );
}
