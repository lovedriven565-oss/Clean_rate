"use client";

import { Suspense, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchX } from "lucide-react";
import type { Solution, SolutionProblemType, SolutionSurface } from "@/lib/types";
import {
  PROBLEM_TYPES,
  PROBLEM_TYPE_LABELS,
  SURFACES,
  SURFACE_LABELS,
  isProblemType,
  isSurface,
} from "@/lib/solutions/meta";
import { cn } from "@/lib/utils";
import { SolutionCard } from "./SolutionCard";

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-10 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card text-muted-foreground hover:border-primary/35 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function ExplorerInner({ solutions }: { solutions: Solution[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const typeParam = searchParams.get("type");
  const surfaceParam = searchParams.get("surface");
  const activeType: SolutionProblemType | "all" = isProblemType(typeParam) ? typeParam : "all";
  const activeSurface: SolutionSurface | "all" = isSurface(surfaceParam) ? surfaceParam : "all";

  const availableTypes = useMemo(() => PROBLEM_TYPES.filter((t) => solutions.some((s) => s.problemType === t)), [solutions]);
  const availableSurfaces = useMemo(() => SURFACES.filter((s) => solutions.some((sol) => sol.surface === s)), [solutions]);

  const filtered = useMemo(
    () =>
      solutions.filter(
        (s) => (activeType === "all" || s.problemType === activeType) && (activeSurface === "all" || s.surface === activeSurface)
      ),
    [solutions, activeType, activeSurface]
  );

  function update(key: "type" | "surface", value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <div>
      <div className="space-y-3">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <FilterChip active={activeType === "all"} onClick={() => update("type", null)}>
            Все задачи
          </FilterChip>
          {availableTypes.map((type) => (
            <FilterChip key={type} active={activeType === type} onClick={() => update("type", activeType === type ? null : type)}>
              {PROBLEM_TYPE_LABELS[type]}
            </FilterChip>
          ))}
        </div>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <FilterChip active={activeSurface === "all"} onClick={() => update("surface", null)}>
            Любая поверхность
          </FilterChip>
          {availableSurfaces.map((surface) => (
            <FilterChip
              key={surface}
              active={activeSurface === surface}
              onClick={() => update("surface", activeSurface === surface ? null : surface)}
            >
              {SURFACE_LABELS[surface]}
            </FilterChip>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
        {filtered.length} из {solutions.length} решений
      </p>

      {filtered.length > 0 ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((solution) => (
            <SolutionCard key={solution.id} solution={solution} />
          ))}
        </div>
      ) : (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-[1.5rem] border border-dashed border-border p-12 text-center">
          <SearchX className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Для этой комбинации решений пока нет.</p>
          <button
            type="button"
            onClick={() => router.replace(pathname, { scroll: false })}
            className="text-sm font-semibold text-primary"
          >
            Сбросить фильтры
          </button>
        </div>
      )}
    </div>
  );
}

export function SolutionsExplorer({ solutions }: { solutions: Solution[] }) {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-[1.5rem] bg-muted/50" />}>
      <ExplorerInner solutions={solutions} />
    </Suspense>
  );
}
