"use client";

import { useEffect, useState } from "react";
import { Check, Lightbulb, Printer, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface DiyStep {
  order: number;
  instruction: string;
  tip?: string;
}

/**
 * Интерактивный чек-лист протокола: шаги отмечаются, прогресс сохраняется
 * в localStorage по slug решения и переживает перезагрузку. Кнопка печати
 * отдаёт чистый чек-лист без шапки и футера (@media print в globals.css).
 */
export function DiyChecklist({ slug, steps }: { slug: string; steps: DiyStep[] }) {
  const storageKey = `ch_diy:${slug}`;
  const [done, setDone] = useState<number[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Чтение localStorage отложено за гидрацию: синхронный setState в теле
    // эффекта запрещён правилом react-hooks/set-state-in-effect.
    const id = setTimeout(() => {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) setDone(JSON.parse(raw));
      } catch {
        // Повреждённое хранилище — начинаем с чистого листа
      }
      setHydrated(true);
    }, 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(done));
    } catch {
      // Приватный режим — прогресс просто не сохранится
    }
  }, [done, hydrated, storageKey]);

  function toggle(order: number) {
    setDone((current) => (current.includes(order) ? current.filter((o) => o !== order) : [...current, order]));
  }

  const progress = steps.length > 0 ? Math.round((done.length / steps.length) * 100) : 0;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {done.length} из {steps.length} шагов · прогресс сохраняется на этом устройстве
          </p>
        </div>
        <div className="flex items-center gap-1">
          {done.length > 0 && (
            <button
              type="button"
              onClick={() => setDone([])}
              aria-label="Сбросить прогресс"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => window.print()}
            aria-label="Распечатать чек-лист"
            className="no-print inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
          >
            <Printer className="h-3.5 w-3.5" />
            Распечатать
          </button>
        </div>
      </div>

      <ol className="mt-6 space-y-5">
        {steps.map((step) => {
          const checked = done.includes(step.order);
          return (
            <li key={step.order} className="grid grid-cols-[2.25rem_1fr] gap-4">
              <button
                type="button"
                role="checkbox"
                aria-checked={checked}
                aria-label={`Шаг ${step.order}`}
                onClick={() => toggle(step.order)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full font-data text-sm font-semibold transition-colors",
                  checked ? "bg-brand text-brand-foreground" : "bg-foreground text-background hover:bg-foreground/85"
                )}
              >
                {checked ? <Check className="h-4 w-4" /> : String(step.order).padStart(2, "0")}
              </button>
              <div className="pt-1.5">
                <p className={cn("text-[15px] leading-7 text-foreground", checked && "text-muted-foreground line-through decoration-muted-foreground/40")}>
                  {step.instruction}
                </p>
                {step.tip && (
                  <p className="mt-2 flex gap-2 text-sm leading-6 text-muted-foreground">
                    <Lightbulb className="mt-1 h-3.5 w-3.5 shrink-0 text-star" />
                    {step.tip}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
