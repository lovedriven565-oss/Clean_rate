"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { Solution } from "@/lib/types";

interface SelectedSolutionContextValue {
  /** Явно выбранная пользователем задача витрины (не hover-превью). */
  solution: Solution | null;
  select: (solution: Solution) => void;
}

const noop = () => {};

const SelectedSolutionContext = createContext<SelectedSolutionContextValue>({
  solution: null,
  select: noop,
});

/**
 * Связь «выбранная задача → контекстные блоки ниже по странице» (мастера, сметы).
 * Контекст безопасен вне провайдера: вернёт null и no-op select, чтобы компоненты
 * можно было переиспользовать без обёртки.
 */
export function SelectedSolutionProvider({ children }: { children: React.ReactNode }) {
  const [solution, setSolution] = useState<Solution | null>(null);
  const value = useMemo(() => ({ solution, select: setSolution }), [solution]);
  return <SelectedSolutionContext.Provider value={value}>{children}</SelectedSolutionContext.Provider>;
}

export function useSelectedSolution(): SelectedSolutionContextValue {
  return useContext(SelectedSolutionContext);
}
