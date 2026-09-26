import { NextResponse } from "next/server";
import { z } from "zod";
import { escapeHtml, forwardToTelegram } from "@/lib/telegram";
import { recordAnalyticsEvent, saveBrandLead } from "@/lib/db/queries";
import { PRIVACY_CONSENT_VERSION } from "@/lib/site";

const payloadSchema = z.object({
  brandName: z.string().trim().min(2).max(120),
  website: z.string().trim().url().max(300).or(z.literal("")),
  contactName: z.string().trim().min(2).max(120),
  contact: z.string().trim().min(5).max(200),
  role: z.enum(["brand", "dealer", "service", "other"]),
  goal: z.string().trim().max(1200),
  /** Сервер требует явное согласие — клиентский чекбокс не доказательство. */
  consent: z.literal(true),
});

const roleLabels = {
  brand: "Производитель / бренд",
  dealer: "Импортёр / дилер",
  service: "Сервисный центр",
  other: "Другая роль",
} as const;

export async function POST(request: Request) {
  const parsed = payloadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Проверьте обязательные поля, формат сайта и согласие с политикой." },
      { status: 400 }
    );
  }

  const payload = parsed.data;

  // 1. Сохранение заявки в базу D1 — до уведомления: Telegram не источник истины.
  const lead = await saveBrandLead({
    brandName: payload.brandName,
    website: payload.website || undefined,
    contactName: payload.contactName,
    contact: payload.contact,
    role: payload.role,
    goal: payload.goal || undefined,
    consentAcceptedAt: new Date(),
    consentVersion: PRIVACY_CONSENT_VERSION,
  });

  if (lead.status === "error") {
    // Честный отказ: заявка не потеряна молча — форма покажет ошибку и сохранит ввод.
    return NextResponse.json(
      { ok: false, error: "Не удалось сохранить заявку. Попробуйте ещё раз." },
      { status: 503 }
    );
  }

  // 2. Фиксация события аналитики (lead)
  await recordAnalyticsEvent({
    entityType: "brand",
    entityId: lead.id,
    eventType: "lead",
    path: "/for-brands",
    metadata: { role: payload.role },
  });

  // 3. Уведомление в Telegram — только при фактически принятой заявке.
  const text = [
    "<b>Новая заявка бренда / поставщика</b>",
    `Компания: ${escapeHtml(payload.brandName)}`,
    `Роль: ${roleLabels[payload.role]}`,
    `Контактное лицо: ${escapeHtml(payload.contactName)}`,
    `Телефон или email: ${escapeHtml(payload.contact)}`,
    payload.website ? `Сайт: ${escapeHtml(payload.website)}` : null,
    payload.goal ? `Задача: ${escapeHtml(payload.goal)}` : null,
    `ID заявки: <code>${lead.id}</code>`,
  ]
    .filter(Boolean)
    .join("\n");

  const delivered = await forwardToTelegram(text);
  if (!delivered) console.log("[brand-lead] Telegram не настроен");
  return NextResponse.json({ ok: true, delivered, leadId: lead.id });
}
