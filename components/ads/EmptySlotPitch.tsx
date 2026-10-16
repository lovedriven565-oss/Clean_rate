import Link from "next/link";
import { ArrowUpRight, FlaskConical, ShieldCheck } from "lucide-react";
import { buildEmptySlotPitch } from "@/lib/ads/presentation";
import type { SolutionSurface } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Компактная ненавязчивая карточка свободного слота `solution.sponsored_product`.
 * Показывается производителям и дилерам химии под протоколом решения, когда активной
 * кампании ещё нет, и ведёт на предзаполненную заявку `/for-brands?solution=...&surface=...`.
 */
export function EmptySlotPitch({
  solutionSlug,
  surface,
  className,
}: {
  solutionSlug?: string;
  surface?: SolutionSurface | string;
  className?: string;
}) {
  const pitch = buildEmptySlotPitch({ solutionSlug, surface });

  return (
    <aside
      aria-label="Свободный слот для производителей и дилеров химии"
      data-nosnippet
      className={cn(
        "no-print rounded-panel border border-dashed border-border bg-muted/35 p-5 sm:p-6",
        className
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground">
              <FlaskConical className="h-3.5 w-3.5 text-primary" aria-hidden />
              {pitch.eyebrow}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Допуск по паспорту безопасности
            </span>
          </div>

          <p className="mt-2.5 text-sm leading-6 text-muted-foreground">
            Производители и официальные дилеры профессиональной химии могут разместить здесь проверенный состав для поверхности «{pitch.surfaceLabel.toLowerCase()}» с прямой ссылкой на покупку или дилера.
          </p>
        </div>

        <Link
          href={pitch.href}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary active:scale-[0.98]"
        >
          {pitch.ctaLabel}
          <ArrowUpRight className="h-4 w-4 text-primary" aria-hidden />
        </Link>
      </div>
    </aside>
  );
}
