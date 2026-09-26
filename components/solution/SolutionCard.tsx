import Link from "next/link";
import { ArrowRight, Hand, Sparkles } from "lucide-react";
import type { Solution } from "@/lib/types";
import { AUDIENCE_LABELS, PROBLEM_TYPE_LABELS, SEVERITY_LABELS, SURFACE_LABELS, solutionSummary } from "@/lib/solutions/meta";
import { pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";

export function SolutionCard({ solution, className }: { solution: Solution; className?: string }) {
  return (
    <Link
      href={`/solutions/${solution.slug}`}
      className={cn(
        "group flex h-full flex-col rounded-panel border border-border bg-card p-5 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl sm:p-6",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">{PROBLEM_TYPE_LABELS[solution.problemType]}</span>
        <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">{SURFACE_LABELS[solution.surface]}</span>
        <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">{SEVERITY_LABELS[solution.severity]}</span>
      </div>

      <h3 className="mt-4 font-display text-lg font-bold leading-snug tracking-[-0.02em] text-foreground group-hover:text-primary">
        {solution.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{solutionSummary(solution, 140)}</p>

      <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <Hand className="h-3.5 w-3.5" />
            {pluralize(solution.diySteps.length, ["шаг", "шага", "шагов"])}
          </span>
          <span className="inline-flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            {AUDIENCE_LABELS[solution.audience]}
          </span>
        </span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
      </div>
    </Link>
  );
}
