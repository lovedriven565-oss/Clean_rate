import * as React from "react";
import { cn } from "@/lib/utils";

type PanelVariant = "card" | "instrument" | "glass";

const variantClass: Record<PanelVariant, string> = {
  card: "border border-border bg-card",
  /** Поверхность прибора: хромированный градиент, внутренний блик, тонированная тень. */
  instrument: "data-surface border border-border",
  /** Матовое стекло — только ИИ-панель, поиск, навигация (см. .glass в globals.css). */
  glass: "glass",
};

/** Панель дизайн-системы: единый радиус (rounded-panel) и три типа поверхности. */
export function Panel({
  variant = "card",
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: PanelVariant }) {
  return <div className={cn("rounded-panel", variantClass[variant], className)} {...props} />;
}
