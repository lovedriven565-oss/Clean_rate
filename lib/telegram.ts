/** Пересылка текста заявки в Telegram-чат владельца платформы. */
export async function forwardToTelegram(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Минимальная проверка телефона для любого рынка: 9–15 цифр без учёта форматирования
 * (9 — местный номер BY без кода, 15 — максимум E.164).
 */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "").length;
  return digits >= 9 && digits <= 15;
}

/** Экранирование пользовательского текста перед вставкой в HTML-сообщение Telegram. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
