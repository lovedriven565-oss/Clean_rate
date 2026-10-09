"use client";

import { Suspense, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchX } from "lucide-react";
import { PillTabs } from "@/components/ui/fx";
import type { Solution, SolutionProblemType, SolutionSurface } from "@/lib/types";
import {
  PROBLEM_TYPES,
  PROBLEM_TYPE_LABELS,
  SURFACES,
  SURFACE_LABELS,
  isProblemType,
  isSurface,
} from "@/lib/solutions/meta";
import { SolutionCard } from "./SolutionCard";

const TABS_CLASS = "no-scrollbar -mx-4 flex-nowrap overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0";

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
        <PillTabs
          label="Тип задачи"
          className={TABS_CLASS}
          value={activeType}
          onChange={(id) => update("type", id === "all" ? null : id)}
          options={[
            { id: "all", label: "Все задачи", meta: String(solutions.length) },
            ...availableTypes.map((type) => ({
              id: type,
              label: PROBLEM_TYPE_LABELS[type],
              meta: String(solutions.filter((s) => s.problemType === type).length),
            })),
          ]}
        />
        <PillTabs
          label="Поверхность"
          className={TABS_CLASS}
          value={activeSurface}
          onChange={(id) => update("surface", id === "all" ? null : id)}
          options={[
            { id: "all", label: "Любая поверхность" },
            ...availableSurfaces.map((surface) => ({
              id: surface,
              label: SURFACE_LABELS[surface],
              meta: String(solutions.filter((s) => s.surface === surface).length),
            })),
          ]}
        />
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
        <div className="mt-4 flex flex-col items-center gap-3 rounded-panel border border-dashed border-border bg-card/50 p-12 text-center">
          <SearchX className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Для этой комбинации решений пока нет.</p>
          <button
            type="button"
            onClick={() => router.replace(pathname, { scroll: false })}
            className="text-sm font-semibold text-link hover:underline"
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
    <Suspense fallback={<div className="h-64 animate-pulse rounded-panel bg-muted/50" />}>
      <ExplorerInner solutions={solutions} />
    </Suspense>
  );
}
