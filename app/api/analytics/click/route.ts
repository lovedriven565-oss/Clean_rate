import { NextResponse } from "next/server";
import { getAllCampaigns, getProductsSafetyMap } from "@/lib/ads/queries";
import { getAllBrands, getAllCompanies, recordAnalyticsEvent, supplierExists } from "@/lib/db/queries";
import { parseClickEvent, type ValidatedAnalyticsEvent } from "@/lib/analytics/validation";
import { checkRateLimit, tooManyRequests } from "@/lib/security/guard";

const MAX_BODY_BYTES = 8 * 1024;

/**
 * Существование сущности: отсекает события по выдуманным id.
 * Для product карта может быть пустой до наполнения каталога — тогда не блокируем.
 */
async function entityExists(entityType: string, entityId: string): Promise<boolean> {
  switch (entityType) {
    case "company":
      return (await getAllCompanies()).some((c) => c.id === entityId);
    case "brand":
      return (await getAllBrands()).some((b) => b.id === entityId);
    case "product": {
      const map = await getProductsSafetyMap();
      return map.size === 0 || map.has(entityId);
    }
    case "supplier":
      return supplierExists(entityId);
    case "page":
      return entityId.startsWith("/");
    default:
      return false;
  }
}

/** Соответствие события кампании: entity = её бренд или продукт, placement совпадает, если указан. */
async function campaignMatches(event: ValidatedAnalyticsEvent): Promise<boolean> {
  if (!event.campaignId) return true;
  const campaign = (await getAllCampaigns()).find((c) => c.id === event.campaignId);
  if (!campaign) return false;
  if (campaign.brandId !== event.entityId && campaign.productId !== event.entityId) return false;
  const placement = event.metadata?.placement;
  if (typeof placement === "string" && placement !== campaign.placement) return false;
  return true;
}

export async function POST(request: Request) {
  if (!(await checkRateLimit(request, "EVENT_LIMITER", "click"))) return tooManyRequests();

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "Слишком большое событие" }, { status: 413 });
  }

  const event = parseClickEvent(await request.json().catch(() => null));
  if (!event) {
    return NextResponse.json({ ok: false, error: "Некорректные данные события" }, { status: 400 });
  }

  if (!(await campaignMatches(event)) || !(await entityExists(event.entityType, event.entityId))) {
    return NextResponse.json({ ok: false, error: "Неизвестная сущность или кампания" }, { status: 400 });
  }

  // Запись события и счётчика кампании — одним D1 batch внутри recordAnalyticsEvent.
  const result = await recordAnalyticsEvent(event);
  return NextResponse.json(
    { ok: result.ok, persisted: result.persisted, duplicate: result.duplicate },
    { status: result.ok ? 200 : 500 }
  );
}
