import { NextResponse } from "next/server";
import { categories } from "@/lib/mock-data";
import { forwardToTelegram, isValidPhone } from "@/lib/telegram";

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
  ]
    .filter(Boolean)
    .join("\n");

  const delivered = await forwardToTelegram(text);

  // В режиме без настроенных TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID заявка логируется на сервере,
  // чтобы форма оставалась рабочей в деве/демо. Для продакшена нужно задать эти переменные окружения.
  if (!delivered) {
    console.log("[partner-lead] Новая заявка компании (Telegram не настроен):", text);
  }

  return NextResponse.json({ ok: true, delivered });
}
