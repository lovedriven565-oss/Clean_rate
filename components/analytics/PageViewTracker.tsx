"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { startPageView, trackEvent, ymHit } from "@/lib/analytics";

/**
 * Открывает просмотр страницы на каждый переход и пишет событие view.
 * Здесь же ручной хит Метрики (счётчик инитится с defer) — CF Web Analytics
 * с spa:true ловит переходы сама.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (lastPath.current === pathname) return;
    const prevPath = lastPath.current;
    lastPath.current = pathname;
    const { isNew } = startPageView(pathname);
    if (!isNew) return;
    ymHit(pathname, prevPath);
    trackEvent({ entityType: "page", entityId: pathname, eventType: "view" });
  }, [pathname]);

  return null;
}
