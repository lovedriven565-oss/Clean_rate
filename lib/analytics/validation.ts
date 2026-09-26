import { z } from "zod";

/**
 * Серверная валидация аналитических событий.
 * Граница доверия — HTTP: принимаем только примитивные поля с лимитами,
 * нормализованный path (без query/hash — там может быть текст запроса)
 * и metadata из фиксированного списка ключей. Время всегда серверное.
 */

export const ANALYTICS_ENTITY_TYPES = ["company", "brand", "supplier", "product", "page"] as const;

/** Типы, которые клиенту разрешено присылать в /api/analytics/click.
 *  impression — только через свой endpoint; lead — только серверная запись после сохранения заявки. */
export const CLIENT_CLICK_TYPES = ["phone", "website", "telegram", "view", "download"] as const;

export type AnalyticsEntity = (typeof ANALYTICS_ENTITY_TYPES)[number];
export type ClientClickType = (typeof CLIENT_CLICK_TYPES)[number];

const METADATA_VALUE = z.union([z.string().max(160), z.number().finite(), z.boolean()]);

/** Разрешённые ключи metadata — всё остальное молча отбрасывается. */
const METADATA_ALLOWLIST = new Set([
  "placement",
  "ctaType",
  "brandId",
  "productId",
  "categoryId",
  "solutionId",
  "supplierId",
  "surface",
  "intent",
  "targetKind",
  "result",
  "reason",
  "source",
  "step",
  "variant",
  "role",
]);

export type AnalyticsMetadata = Record<string, string | number | boolean>;

export interface ValidatedAnalyticsEvent {
  eventId?: string;
  pageViewId?: string;
  campaignId?: string;
  entityType: AnalyticsEntity;
  entityId: string;
  eventType: ClientClickType | "impression" | "lead";
  path?: string;
  countryCode?: string;
  metadata?: AnalyticsMetadata;
}

/** Оставляет только pathname: отсекает query/hash (PII-риск) и чужие origin-строки. */
export function sanitizePath(raw?: string): string | undefined {
  if (!raw) return undefined;
  const cut = raw.split(/[?#]/, 1)[0];
  if (!cut.startsWith("/") || cut.startsWith("//")) return undefined;
  return cut.slice(0, 200);
}

export function sanitizeMetadata(raw?: Record<string, unknown>): AnalyticsMetadata | undefined {
  if (!raw) return undefined;
  const clean: AnalyticsMetadata = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!METADATA_ALLOWLIST.has(key)) continue;
    if (typeof value === "string" && value.length <= 160) clean[key] = value;
    else if (typeof value === "number" && Number.isFinite(value)) clean[key] = value;
    else if (typeof value === "boolean") clean[key] = value;
  }
  return Object.keys(clean).length > 0 ? clean : undefined;
}

const sharedFields = {
  eventId: z.uuid().optional(),
  pageViewId: z.uuid().optional(),
  campaignId: z.string().trim().min(1).max(128).optional(),
  path: z.string().max(400).optional(),
  countryCode: z.string().regex(/^[A-Z]{2}$/).optional(),
  metadata: z.record(z.string().max(48), METADATA_VALUE).optional(),
};

const clickPayloadSchema = z.object({
  ...sharedFields,
  entityType: z.enum(ANALYTICS_ENTITY_TYPES).optional(),
  entityId: z.string().trim().min(1).max(160).optional(),
  /** legacy-поля прежнего клиента */
  companyId: z.string().trim().min(1).max(160).optional(),
  clickType: z.enum(CLIENT_CLICK_TYPES).optional(),
  categoryId: z.string().trim().max(64).optional(),
  eventType: z.enum(CLIENT_CLICK_TYPES).optional(),
});

const impressionPayloadSchema = z.object({
  ...sharedFields,
  entityType: z.enum(ANALYTICS_ENTITY_TYPES).optional(),
  entityId: z.string().trim().min(1).max(160),
});

export function parseClickEvent(raw: unknown): ValidatedAnalyticsEvent | null {
  const parsed = clickPayloadSchema.safeParse(raw);
  if (!parsed.success) return null;
  const p = parsed.data;

  const entityId = p.entityId ?? p.companyId;
  if (!entityId) return null;

  const entityType = p.entityType ?? "company";
  // Для page-событий entityId — это нормализованный путь страницы.
  if (entityType === "page" && !entityId.startsWith("/")) return null;

  const metadata = sanitizeMetadata({
    ...p.metadata,
    ...(p.categoryId ? { categoryId: p.categoryId } : {}),
  });

  return {
    eventId: p.eventId,
    pageViewId: p.pageViewId,
    campaignId: p.campaignId,
    entityType,
    entityId,
    eventType: p.eventType ?? p.clickType ?? "website",
    path: sanitizePath(p.path),
    countryCode: p.countryCode,
    metadata,
  };
}

export function parseImpressionEvent(raw: unknown): ValidatedAnalyticsEvent | null {
  const parsed = impressionPayloadSchema.safeParse(raw);
  if (!parsed.success) return null;
  const p = parsed.data;

  const entityType = p.entityType ?? "brand";
  if (entityType === "page" && !p.entityId.startsWith("/")) return null;

  return {
    eventId: p.eventId,
    pageViewId: p.pageViewId,
    campaignId: p.campaignId,
    entityType,
    entityId: p.entityId,
    eventType: "impression",
    path: sanitizePath(p.path),
    countryCode: p.countryCode,
    metadata: sanitizeMetadata(p.metadata),
  };
}
