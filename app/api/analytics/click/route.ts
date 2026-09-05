import { NextResponse } from "next/server";

export interface ClickEvent {
  companyId: string;
  categoryId?: string;
  clickType: "phone" | "website" | "telegram";
  path?: string;
  timestamp?: string;
}

const VALID_TYPES = ["phone", "website", "telegram"] as const;

export async function POST(request: Request) {
  let payload: ClickEvent;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Некорректный формат запроса" }, { status: 400 });
  }

  const { companyId, clickType } = payload;

  if (!companyId || typeof companyId !== "string") {
    return NextResponse.json({ ok: false, error: "Укажите companyId" }, { status: 400 });
  }

  if (!VALID_TYPES.includes(clickType as (typeof VALID_TYPES)[number])) {
    return NextResponse.json({ ok: false, error: "Некорректный тип клика" }, { status: 400 });
  }

  // Обезличенные данные: только companyId, тип, категория и путь страницы.
  // Никаких персональных данных (имя, телефон, email, IP, cookies).
  const event = {
    companyId,
    clickType,
    categoryId: payload.categoryId,
    path: payload.path,
    timestamp: payload.timestamp ?? new Date().toISOString(),
  };

  // Минимальная обезличенная логика: лог в консоль + возможность подключить внешнее хранилище.
  console.log("[analytics:click]", event);

  return NextResponse.json({ ok: true });
}
