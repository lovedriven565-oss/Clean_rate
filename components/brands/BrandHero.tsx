import { ExternalLink, Ticket } from "lucide-react";
import type { Brand } from "@/lib/types";
import { focusLabels, isLightColor } from "@/lib/brand-utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

export function BrandHero({ brand }: { brand: Brand }) {
  const light = isLightColor(brand.accent);
  return (
    <section className="bg-fresh relative overflow-hidden border-b border-border">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: brand.accent }}
      />

      <div className="container relative flex flex-col items-center gap-6 py-16 text-center sm:py-24">
        {brand.isSponsor && <StatusBadge variant="sponsor" size="md" />}
        <span
          className={cn(
            "flex h-20 w-20 items-center justify-center rounded-panel text-3xl font-bold shadow-xl",
            light ? "text-slate-900" : "text-white"
          )}
          style={{ backgroundColor: brand.accent }}
        >
          {brand.name.charAt(0)}
        </span>
        <div className="flex flex-col items-center gap-3">
          <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            {focusLabels[brand.focus]}
          </span>
          <h1 className="max-w-2xl font-display text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-5xl">
            {brand.name}
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">{brand.tagline}</p>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground/85">{brand.description}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {brand.discountCode && (
            <span className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-semibold text-foreground">
              <Ticket className="h-4 w-4" />
              Промокод: {brand.discountCode}
            </span>
          )}
          <a
            href={brand.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg transition hover:opacity-90",
              light ? "text-slate-900" : "text-white"
            )}
            style={{ backgroundColor: brand.accent }}
          >
            Открыть сайт бренда
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
