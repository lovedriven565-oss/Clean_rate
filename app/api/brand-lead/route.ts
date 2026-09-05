import { NextResponse } from "next/server";
import { z } from "zod";
import { forwardToTelegram } from "@/lib/telegram";

const payloadSchema = z.object({
  brandName: z.string().trim().min(2).max(120),
  website: z.string().trim().url().max(300).or(z.literal("")),
  contactName: z.string().trim().min(2).max(120),
  contact: z.string().trim().min(5).max(200),
  role: z.enum(["brand", "dealer", "service", "other"]),
  goal: z.string().trim().max(1200),
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
    return NextResponse.json({ ok: false, error: "Проверьте обязательные поля и формат сайта." }, { status: 400 });
  }

  const payload = parsed.data;
  const text = [
    "<b>Новая заявка бренда / поставщика</b>",
    `Компания: ${payload.brandName}`,
    `Роль: ${roleLabels[payload.role]}`,
    `Контактное лицо: ${payload.contactName}`,
    `Телефон или email: ${payload.contact}`,
    payload.website ? `Сайт: ${payload.website}` : null,
    payload.goal ? `Задача: ${payload.goal}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const delivered = await forwardToTelegram(text);
  if (!delivered) console.log("[brand-lead] Telegram не настроен");
  return NextResponse.json({ ok: true, delivered });
}
