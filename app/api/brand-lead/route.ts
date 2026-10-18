import { NextResponse } from "next/server";
import { z } from "zod";
import { escapeHtml, forwardToTelegram, leadDeliveryRequired } from "@/lib/telegram";
import { recordAnalyticsEvent, saveBrandLead } from "@/lib/db/queries";
import { checkRateLimit, tooManyRequests, verifyTurnstile } from "@/lib/security/guard";
import { PRIVACY_CONSENT_VERSION } from "@/lib/site";

const payloadSchema = z.object({
  brandName: z.string().trim().min(2).max(120),
  website: z
    .string()
    .trim()
    .max(300)
    .refine((value) => /^https?:\/\/[^\s]+$/i.test(value) && URL.canParse(value))
    .or(z.literal("")),
  contactName: z.string().trim().min(2).max(120),
  contact: z.string().trim().min(5).max(200),
  role: z.enum(["brand", "dealer", "service", "other"]),
  goal: z.string().trim().max(1200),
  /** Сервер требует явное согласие — клиентский чекбокс не доказательство. */
  consent: z.literal(true),
  turnstileToken: z.string().max(4096).optional(),
});

const roleLabels = {
  brand: "Производитель / бренд",
  dealer: "Импортёр / дилер",
  service: "Сервисный центр",
  other: "Другая роль",
} as const;

export async function POST(request: Request) {
  if (!(await checkRateLimit(request, "LEAD_LIMITER", "brand-lead"))) return tooManyRequests();

  const parsed = payloadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Проверьте обязательные поля, формат сайта и согласие с политикой." },
      { status: 400 }
    );
  }

  const payload = parsed.data;

  if (!(await verifyTurnstile(payload.turnstileToken, request))) {
    return NextResponse.json({ ok: false, error: "Не удалось подтвердить, что вы не робот." }, { status: 403 });
  }

  const leadId = crypto.randomUUID();

  // 1. Zero-PII: полная заявка (контактное лицо, телефон/email, задача) — только транзитом в Telegram.
  const text = [
    "<b>Новая заявка бренда / поставщика</b>",
    `Компания: ${escapeHtml(payload.brandName)}`,
    `Роль: ${roleLabels[payload.role]}`,
    `Контактное лицо: ${escapeHtml(payload.contactName)}`,
    `Телефон или email: ${escapeHtml(payload.contact)}`,
    payload.website ? `Сайт: ${escapeHtml(payload.website)}` : null,
    payload.goal ? `Задача: ${escapeHtml(payload.goal)}` : null,
    `ID заявки: <code>${leadId}</code>`,
  ]
    .filter(Boolean)
    .join("\n");

  const delivered = await forwardToTelegram(text);
  if (!delivered && leadDeliveryRequired()) {
    // Честный отказ: заявка не потеряна молча — форма покажет ошибку и сохранит ввод.
    console.error("[brand-lead] Telegram недоступен, заявка не принята", { leadId });
    return NextResponse.json(
      { ok: false, error: "Не удалось отправить заявку. Попробуйте ещё раз через минуту." },
      { status: 503 }
    );
  }
  if (!delivered) console.log("[brand-lead] Telegram не настроен (dev)");

  // 2. В D1 — только бренд, сайт, роль и обезличенный хеш контакта (redactLeadPii в saveBrandLead).
  const lead = await saveBrandLead({
    id: leadId,
    brandName: payload.brandName,
    website: payload.website || undefined,
    contactName: payload.contactName,
    contact: payload.contact,
    role: payload.role,
    consentAcceptedAt: new Date(),
    consentVersion: PRIVACY_CONSENT_VERSION,
  });
  if (lead.status === "error") console.error("[brand-lead] обезличенный след не записан в D1", { leadId });

  // 3. Фиксация события аналитики (lead)
  await recordAnalyticsEvent({
    entityType: "brand",
    entityId: leadId,
    eventType: "lead",
    path: "/for-brands",
    metadata: { role: payload.role },
  });

  return NextResponse.json({ ok: true, delivered, leadId });
}
