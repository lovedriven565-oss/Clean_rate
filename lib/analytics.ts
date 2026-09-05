export type ClickType = "phone" | "website" | "telegram";

export interface ClickPayload {
  companyId: string;
  categoryId?: string;
  clickType: ClickType;
  path?: string;
}

/**
 * Обезличенная аналитика кликов по контактам компаний.
 * Передаёт только companyId, тип клика и страницу — без имени, телефона, IP и cookies.
 */
export function trackClick(payload: ClickPayload) {
  if (typeof window === "undefined") return;

  const body = JSON.stringify({
    ...payload,
    path: payload.path ?? window.location.pathname,
    timestamp: new Date().toISOString(),
  });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/click", new Blob([body], { type: "application/json" }));
    } else {
      void fetch("/api/analytics/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      });
    }
  } catch {
    // Аналитика не должна ломать UX
  }
}
