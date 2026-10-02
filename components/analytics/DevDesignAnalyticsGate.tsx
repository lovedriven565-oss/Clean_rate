"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * Вне production не монтирует внешние счётчики на /dev/design/* —
 * чистое прямое открытие дизайн-прототипа не поднимает YM/CF скрипты.
 * Уже загруженный при SPA-переходе с публичной страницы скрипт не выгружается:
 * критерий изоляции — новая вкладка/контекст на dev-маршруте.
 */
export function DevDesignAnalyticsGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/dev/design")) return null;
  return <>{children}</>;
}
