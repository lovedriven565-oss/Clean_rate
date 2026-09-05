import { ExternalLink, Ticket } from "lucide-react";
import type { Brand } from "@/lib/types";
import { focusLabels } from "@/lib/brand-utils";
import { SponsoredBadge } from "@/components/ui/SponsoredBadge";

export function BrandHero({ brand }: { brand: Brand }) {
  return (
    <section className="bg-fresh relative overflow-hidden border-b border-border">
      <div className="bg-grid-fade absolute inset-0" aria-hidden />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: brand.accent }}
      />

      <div className="container relative flex flex-col items-center gap-6 py-16 text-center sm:py-24">
        {brand.isSponsor && <SponsoredBadge label="Партнёрский материал" />}
        <span
          className="flex h-20 w-20 items-center justify-center rounded-3xl text-3xl font-bold text-white shadow-xl"
          style={{ backgroundColor: brand.accent }}
        >
          {brand.name.charAt(0)}
        </span>
        <div className="flex flex-col items-center gap-3">
          <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            {focusLabels[brand.focus]}
          </span>
          <h1 className="max-w-2xl font-display text-3xl font-extrabold tracking-[-0.04em] text-foreground sm:text-5xl">
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
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
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
