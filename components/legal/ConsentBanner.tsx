"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { readConsent, writeConsent, type ConsentValue } from "@/lib/consent";

/**
 * Баннер согласия на внешнюю аналитику. До выбора загружаются только технически
 * необходимые (Zero-PII) события платформы; Яндекс Метрика и Cloudflare Web
 * Analytics подключаются только после «Принять».
 */
export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setVisible(readConsent() === null));
  }, []);

  if (!visible) return null;

  const choose = (value: ConsentValue) => {
    writeConsent(value);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Согласие на аналитику"
      className="fixed inset-x-0 bottom-0 z-[70] border-t border-border bg-card/95 shadow-[0_-12px_32px_hsl(var(--shadow-tint)/0.12)] backdrop-blur-lg"
    >
      <div className="container flex flex-col items-start gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-teal" aria-hidden />
          <p className="text-sm leading-6 text-muted-foreground">
            Мы используем обезличенную статистику без cookies и идентификаторов.
            Внешние счётчики (Яндекс Метрика, Cloudflare Web Analytics) включаются только
            с вашего согласия.{" "}
            <Link href="/privacy" className="font-semibold text-teal hover:underline">
              Подробнее
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => choose("essential")}
            className="inline-flex min-h-11 items-center rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:border-ink/40"
          >
            Только необходимые
          </button>
          <button
            type="button"
            onClick={() => choose("all")}
            className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-semibold text-ink-foreground transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
          >
            Принять
          </button>
        </div>
      </div>
    </div>
  );
}
