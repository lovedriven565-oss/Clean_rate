export type ClickType = "phone" | "website" | "telegram";
export type AnalyticsEntityType = "company" | "brand" | "supplier" | "product" | "page";
export type AnalyticsEventType = "impression" | "view" | "phone" | "website" | "telegram" | "lead" | "download";

export interface ClickPayload {
  companyId: string;
  categoryId?: string;
  clickType: ClickType;
  path?: string;
  campaignId?: string;
  countryCode?: string;
}

export interface AnalyticsPayload {
  entityType?: AnalyticsEntityType;
  entityId: string;
  eventType: AnalyticsEventType;
  campaignId?: string;
  path?: string;
  countryCode?: string;
  metadata?: Record<string, unknown>;
}

/**
 * ID одного отображения страницы: генерируется на каждый переход и связывает
 * действия внутри просмотра. Не является visitor-ID — между страницами
 * и сессиями идентификаторы не связаны.
 */
let currentPageViewId: string | undefined;
let currentPageViewPath: string | undefined;

function newId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/**
 * Открывает новый просмотр страницы и возвращает его ID.
 * Вызывается PageViewTracker при смене пути; повторный вызов для того же
 * пути возвращает существующий ID (защита от StrictMode double-mount).
 */
export function startPageView(pathname: string): string {
  if (currentPageViewPath !== pathname) {
    currentPageViewPath = pathname;
    currentPageViewId = newId();
  }
  return currentPageViewId!;
}

/**
 * Обезличенная аналитика взаимодействия с сущностями (компании, бренды, продукты, кампании).
 * Передаёт только идентификаторы и контекст страницы — без персональных данных, IP и cookies.
 * eventId — idempotency-ключ для дедупликации повторной доставки на сервере.
 */
export function trackEvent(payload: AnalyticsPayload) {
  if (typeof window === "undefined") return;

  const body = JSON.stringify({
    ...payload,
    eventId: newId(),
    pageViewId: currentPageViewId,
    path: payload.path ?? window.location.pathname,
  });

  const endpoint = payload.eventType === "impression" ? "/api/analytics/impression" : "/api/analytics/click";

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, new Blob([body], { type: "application/json" }));
    } else {
      void fetch(endpoint, {
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

/**
 * Обезличенная аналитика кликов по контактам компаний (обратная совместимость).
 */
export function trackClick(payload: ClickPayload) {
  trackEvent({
    entityType: "company",
    entityId: payload.companyId,
    eventType: payload.clickType,
    campaignId: payload.campaignId,
    path: payload.path,
    countryCode: payload.countryCode,
    metadata: payload.categoryId ? { categoryId: payload.categoryId } : undefined,
  });
}
