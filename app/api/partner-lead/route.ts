import { NextResponse } from "next/server";
import { z } from "zod";
import { escapeHtml, forwardToTelegram, isValidPhone, leadDeliveryRequired } from "@/lib/telegram";
import { getAllCategories, recordAnalyticsEvent, savePartnerLead } from "@/lib/db/queries";
import { checkRateLimit, tooManyRequests, verifyTurnstile } from "@/lib/security/guard";
import { PRIVACY_CONSENT_VERSION } from "@/lib/site";

const payloadSchema = z.object({
  companyName: z.string().trim().min(2).max(120),
  contactName: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(40).refine(isValidPhone),
  city: z.string().trim().max(80).optional(),
  categoryIds: z.array(z.string().max(40)).max(20).optional(),
  plan: z.enum(["base", "pro"]).optional(),
  message: z.string().trim().max(1200).optional(),
  /** Сервер требует явное согласие — клиентский чекбокс не доказательство. */
  consent: z.literal(true),
  turnstileToken: z.string().max(4096).optional(),
});

export async function POST(request: Request) {
  if (!(await checkRateLimit(request, "LEAD_LIMITER", "partner-lead"))) return tooManyRequests();

  const parsed = payloadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Проверьте название компании, телефон и согласие с политикой." },
      { status: 400 }
    );
  }
  const payload = parsed.data;

  if (!(await verifyTurnstile(payload.turnstileToken, request))) {
    return NextResponse.json({ ok: false, error: "Не удалось подтвердить, что вы не робот." }, { status: 403 });
  }

  const categories = await getAllCategories();
  const categoryIds = (payload.categoryIds ?? []).filter((id) => categories.some((c) => c.id === id));
  const leadId = crypto.randomUUID();

  const categoryNames = categoryIds
    .map((id) => categories.find((c) => c.id === id)?.name)
    .filter(Boolean)
    .join(", ");

  // 1. Zero-PII: полная заявка уходит только транзитом в Telegram. Всё пользовательское
  // экранируется: сообщение уходит с parse_mode HTML.
  const text = [
    "<b>Новая заявка от компании (партнёрство)</b>",
    `Компания: ${escapeHtml(payload.companyName)}`,
    payload.contactName ? `Контакт: ${escapeHtml(payload.contactName)}` : null,
    `Телефон: ${escapeHtml(payload.phone)}`,
    payload.city ? `Город: ${escapeHtml(payload.city)}` : null,
    payload.plan ? `Тариф: ${payload.plan === "pro" ? "PRO Спонсор" : "Базовый"}` : null,
    categoryNames ? `Услуги: ${escapeHtml(categoryNames)}` : null,
    payload.message ? `Комментарий: ${escapeHtml(payload.message)}` : null,
    `ID заявки: <code>${leadId}</code>`,
  ]
    .filter(Boolean)
    .join("\n");

  const delivered = await forwardToTelegram(text);
  if (!delivered && leadDeliveryRequired()) {
    console.error("[partner-lead] Telegram недоступен, заявка не принята", { leadId });
    return NextResponse.json(
      { ok: false, error: "Не удалось отправить заявку. Попробуйте ещё раз через минуту." },
      { status: 503 }
    );
  }
  if (!delivered) console.log("[partner-lead] Telegram не настроен (dev)");

  // 2. В D1 — только юрлицо, город, тариф и обезличенный хеш контакта (redactLeadPii в savePartnerLead).
  const lead = await savePartnerLead({
    id: leadId,
    companyName: payload.companyName,
    contactName: payload.contactName || undefined,
    phone: payload.phone,
    city: payload.city || undefined,
    categoryIds,
    plan: payload.plan,
    consentAcceptedAt: new Date(),
    consentVersion: PRIVACY_CONSENT_VERSION,
  });
  // Заявка уже у отдела партнёрств: сбой обезличенной записи не повод отказывать клиенту.
  if (lead.status === "error") console.error("[partner-lead] обезличенный след не записан в D1", { leadId });

  // 3. Аналитическое событие
  await recordAnalyticsEvent({
    entityType: "company",
    entityId: leadId,
    eventType: "lead",
    path: "/for-partners",
    metadata: { city: payload.city, plan: payload.plan },
  });

  return NextResponse.json({ ok: true, delivered, leadId });
}
