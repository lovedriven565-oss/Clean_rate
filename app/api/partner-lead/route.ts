import { NextResponse } from "next/server";
import { categories } from "@/lib/mock-data";
import { forwardToTelegram, isValidPhone } from "@/lib/telegram";
import { recordAnalyticsEvent, savePartnerLead } from "@/lib/db/queries";
import { PRIVACY_CONSENT_VERSION } from "@/lib/site";

interface PartnerLeadPayload {
  companyName?: string;
  contactName?: string;
  phone?: string;
  city?: string;
  categoryIds?: string[];
  message?: string;
}

export async function POST(request: Request) {
  let payload: PartnerLeadPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Некорректный формат запроса" }, { status: 400 });
  }

  const { companyName, contactName, phone, city, categoryIds, message } = payload;

  if (!companyName || !companyName.trim()) {
    return NextResponse.json({ ok: false, error: "Укажите название компании" }, { status: 400 });
  }
  if (!phone || !isValidPhone(phone)) {
    return NextResponse.json({ ok: false, error: "Укажите корректный номер телефона" }, { status: 400 });
  }

  // 1. Сохранение в базу D1
  const lead = await savePartnerLead({
    companyName: companyName.trim(),
    contactName: contactName?.trim() || undefined,
    phone: phone.trim(),
    city: city?.trim() || undefined,
    categoryIds,
    message: message?.trim() || undefined,
    consentAcceptedAt: new Date(),
    consentVersion: PRIVACY_CONSENT_VERSION,
  });

  // 2. Аналитическое событие
  await recordAnalyticsEvent({
    entityType: "company",
    entityId: lead.id,
    eventType: "lead",
    path: "/for-partners",
    metadata: { companyName: companyName.trim(), city },
  });

  const categoryNames = (categoryIds ?? [])
    .map((id) => categories.find((c) => c.id === id)?.name)
    .filter(Boolean)
    .join(", ");

  const text = [
    "🏢 <b>Новая заявка от компании (партнёрство)</b>",
    `Компания: ${companyName.trim()}`,
    contactName ? `Контакт: ${contactName}` : null,
    `Телефон: ${phone}`,
    city ? `Город: ${city}` : null,
    categoryNames ? `Услуги: ${categoryNames}` : null,
    message ? `Комментарий: ${message}` : null,
    `ID заявки: <code>${lead.id}</code>`,
  ]
    .filter(Boolean)
    .join("\n");

  const delivered = await forwardToTelegram(text);

  if (!delivered) {
    console.log("[partner-lead] Новая заявка компании (Telegram не настроен):", text);
  }

  return NextResponse.json({ ok: true, delivered, leadId: lead.id });
}
