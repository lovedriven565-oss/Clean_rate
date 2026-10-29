"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

/**
 * SSR-безопасный prefers-reduced-motion: сервер и гидрация всегда видят `false`,
 * реальное значение применяется синхронным ререндером до первого кадра.
 * В отличие от useReducedMotion() из motion, не даёт hydration mismatch
 * у пользователей с выключенной анимацией на уровне ОС.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  );
}
