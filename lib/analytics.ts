export type ClickType = "phone" | "website" | "telegram";
export type AnalyticsEntityType = "company" | "brand" | "supplier" | "product" | "page";
export type AnalyticsEventType = "impression" | "view" | "phone" | "website" | "telegram" | "lead" | "download" | "share" | "feedback";

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

/** ID счётчика Яндекс Метрики (инлайнится при сборке). Пусто — Метрика не подключена. */
export const YM_ID = process.env.NEXT_PUBLIC_YM_ID ? Number(process.env.NEXT_PUBLIC_YM_ID) : undefined;

/** События, которые дублируются целями в Метрику (конверсии, а не просмотры/показы). */
const YM_GOALS = new Set<AnalyticsEventType>(["phone", "telegram", "website", "lead", "share", "feedback"]);

type YmFn = (id: number, method: string, ...args: unknown[]) => void;

function ym(method: string, ...args: unknown[]) {
  if (!YM_ID || typeof window === "undefined") return;
  const fn = (window as unknown as { ym?: YmFn }).ym;
  try {
    fn?.(YM_ID, method, ...args);
  } catch {
    // Метрика не должна ломать UX
  }
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
export function startPageView(pathname: string): { id: string; isNew: boolean } {
  const isNew = currentPageViewPath !== pathname;
  if (isNew) {
    currentPageViewPath = pathname;
    currentPageViewId = newId();
  }
  return { id: currentPageViewId!, isNew };
}

/** Хит Метрики при SPA-переходе (счётчик инициализируется с defer: true). */
export function ymHit(url: string, referrer?: string) {
  ym("hit", url, referrer ? { referer: referrer } : undefined);
}

/** Цель Метрики для событий, которые не пишутся в D1 (например, лид пишется сервером). */
export function reachGoal(goal: AnalyticsEventType, params?: Record<string, unknown>) {
  ym("reachGoal", goal, params);
}

/**
 * Обезличенная аналитика взаимодействия с сущностями (компании, бренды, продукты, кампании).
 * Передаёт только идентификаторы и контекст страницы — без персональных данных, IP и cookies.
 * eventId — idempotency-ключ для дедупликации повторной доставки на сервере.
 */
export function trackEvent(payload: AnalyticsPayload) {
  if (typeof window === "undefined") return;

  if (YM_GOALS.has(payload.eventType)) {
    reachGoal(payload.eventType, { entityType: payload.entityType, entityId: payload.entityId });
  }

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
