import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAllowed } from "@/lib/admin/guard";
import { setCampaignStatus, setCompanyPromoted, setLeadStatus } from "@/lib/db/admin";

export const dynamic = "force-dynamic";

const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("lead_status"),
    kind: z.enum(["brand", "partner"]),
    id: z.string().min(1).max(64),
    status: z.string().min(1).max(20),
  }),
  z.object({
    action: z.literal("company_promoted"),
    id: z.string().min(1).max(64),
    promoted: z.boolean(),
  }),
  z.object({
    action: z.literal("campaign_status"),
    id: z.string().min(1).max(64),
    status: z.enum(["draft", "active", "paused", "completed"]),
  }),
]);

const ERROR_MESSAGES: Record<string, string> = {
  no_db: "База данных недоступна в этом окружении.",
  not_found: "Запись не найдена.",
  invalid: "Недопустимое значение.",
};

/**
 * POST /api/admin/actions — точечные операции админки (статусы лидов/кампаний,
 * флаг promoted). Доступ как у /admin: Cloudflare Access в проде.
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (!isAdminAllowed(request.headers)) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  const parsed = actionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Некорректный запрос." }, { status: 400 });
  }

  const input = parsed.data;
  const result =
    input.action === "lead_status"
      ? await setLeadStatus(input.kind, input.id, input.status)
      : input.action === "company_promoted"
        ? await setCompanyPromoted(input.id, input.promoted)
        : await setCampaignStatus(input.id, input.status);

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: ERROR_MESSAGES[result.reason ?? "not_found"] ?? "Ошибка записи." },
      { status: result.reason === "no_db" ? 503 : 400 }
    );
  }
  return NextResponse.json({ ok: true });
}
