import Link from "next/link";
import { Megaphone } from "lucide-react";
import { isSurface, SURFACE_LABELS } from "@/lib/solutions/meta";
import { cn } from "@/lib/utils";
import type { SlotPlaceholderMeta } from "@/lib/ads/presentation";

/**
 * Заглушка свободного рекламного слота: «место свободно» + цена и CTA на форму.
 * Не рекламный контент — не требует маркировки и трекинга показов;
 * data-nosnippet — не попадает в сниппеты поиска.
 *
 * variant:
 *  - "strip"   — компактная полоса (категория на /rating, посадочные);
 *  - "card"    — карточка с мини-макетом (спонсор клинера, дилер в протоколе);
 *  - "poster"  — вертикальная плашка 9:16 (видеохаб).
 */
export function AdSlotPlaceholder({
  meta,
  variant = "card",
  className,
}: {
  meta: SlotPlaceholderMeta;
  variant?: "strip" | "card" | "poster";
  className?: string;
}) {
  const surfaceKey = meta.surface;
  const surfaceLabel = surfaceKey && isSurface(surfaceKey) ? SURFACE_LABELS[surfaceKey] : null;

  const cta = (
    <Link
      href={meta.href}
      className="inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-ink px-4 text-xs font-semibold text-ink-foreground transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
    >
      {meta.ctaLabel}
    </Link>
  );

  const badge = (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border bg-muted/50 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
      <Megaphone className="size-3" aria-hidden />
      Реклама · место свободно
    </span>
  );

  if (variant === "strip") {
    return (
      <aside
        data-nosnippet
        aria-label={`Свободный рекламный слот: ${meta.label}`}
        className={cn("no-print flex flex-wrap items-center justify-between gap-3 rounded-panel border border-dashed border-border bg-muted/30 px-4 py-3 sm:px-5", className)}
      >
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
          {badge}
          <p className="text-sm text-foreground">
            <span className="font-semibold">{meta.label}</span>
            {meta.priceLabel && <span className="text-muted-foreground"> · {meta.priceLabel}</span>}
          </p>
        </div>
        {cta}
      </aside>
    );
  }

  if (variant === "poster") {
    return (
      <li data-nosnippet className={cn("list-none", className)}>
        <Link
          href={meta.href}
          className="group flex aspect-[9/16] w-full flex-col justify-between overflow-hidden rounded-panel border-2 border-dashed border-border bg-muted/50 p-4 text-left transition-colors hover:border-ink/40"
          aria-label={`Забронировать рекламный слот: ${meta.label}`}
        >
          <div className="flex items-center justify-between gap-2">
            {badge}
            <span className="rounded-[6px] bg-ink/80 px-2 py-1 font-data text-[10px] font-bold text-white">9:16</span>
          </div>
          <div>
            <p className="font-display text-lg font-bold leading-tight text-foreground">{meta.label}</p>
            {meta.priceLabel && <p className="mt-2 font-data text-sm font-bold text-teal">{meta.priceLabel}</p>}
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-control bg-ink px-4 py-2 text-xs font-semibold text-ink-foreground">
              {meta.ctaLabel}
            </p>
          </div>
        </Link>
      </li>
    );
  }

  return (
    <aside
      data-nosnippet
      aria-label={`Свободный рекламный слот: ${meta.label}`}
      className={cn("no-print rounded-panel border-2 border-dashed border-border bg-muted/30 p-5 sm:p-6", className)}
    >
      <div className="flex items-start gap-4">
        {/* Мини-макет будущего креатива */}
        <div aria-hidden className="hidden size-14 shrink-0 place-items-center rounded-control border border-dashed border-border bg-card sm:grid">
          <Megaphone className="size-6 text-muted-foreground/60" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">{badge}</div>
          <p className="mt-2.5 font-display text-base font-bold text-foreground sm:text-lg">{meta.label}</p>
          {surfaceLabel && (
            <p className="mt-1 text-xs text-muted-foreground">Совместимость: {surfaceLabel}</p>
          )}
          {meta.priceLabel && <p className="mt-2 font-data text-sm font-bold text-teal">{meta.priceLabel}</p>}
        </div>
        {cta}
      </div>
    </aside>
  );
}
