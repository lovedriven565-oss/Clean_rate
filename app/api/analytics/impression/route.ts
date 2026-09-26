import { NextResponse } from "next/server";
import { getAllCampaigns } from "@/lib/ads/queries";
import { recordAnalyticsEvent } from "@/lib/db/queries";
import { parseImpressionEvent } from "@/lib/analytics/validation";
import { checkRateLimit, tooManyRequests } from "@/lib/security/guard";

const MAX_BODY_BYTES = 8 * 1024;

export async function POST(request: Request) {
  if (!(await checkRateLimit(request, "EVENT_LIMITER", "impression"))) return tooManyRequests();

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "Слишком большое событие" }, { status: 413 });
  }

  // Показ фиксируется только по факту viewability (см. components/ads/AdImpression).
  const event = parseImpressionEvent(await request.json().catch(() => null));
  if (!event) {
    return NextResponse.json({ ok: false, error: "Некорректные данные события" }, { status: 400 });
  }

  if (event.campaignId) {
    const campaign = (await getAllCampaigns()).find((c) => c.id === event.campaignId);
    if (!campaign || (campaign.brandId !== event.entityId && campaign.productId !== event.entityId)) {
      return NextResponse.json({ ok: false, error: "Неизвестная кампания" }, { status: 400 });
    }
  }

  const result = await recordAnalyticsEvent(event);
  return NextResponse.json(
    { ok: result.ok, persisted: result.persisted, duplicate: result.duplicate },
    { status: result.ok ? 200 : 500 }
  );
}
