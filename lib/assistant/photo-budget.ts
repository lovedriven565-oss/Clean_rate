/**
 * Дневной бюджет фото-ИИ: атомарный счётчик попыток в D1 (таблица
 * ai_usage_daily, миграция 0010). Попытка резервируется ДО вызова модели —
 * параллельные запросы не пробивают лимит, а сбой ai.run не возвращает
 * резерв (консервативно: оплата за вызов могла уже списаться).
 *
 * Fail-closed: без D1-биндинга или при ошибке — "unavailable", маршрут
 * не делает AI-вызов.
 */

import { getDb } from "@/lib/db/client";

export type PhotoBudgetResult = "reserved" | "exhausted" | "unavailable";

/**
 * Резервирует одну попытку на UTC-день `day` (YYYY-MM-DD) в пределах `limit`.
 * Два атомарных шага: INSERT OR IGNORE создаёт строку дня, затем UPDATE
 * с условием photo_attempts < limit — changes=1 только у победителя гонки.
 */
export async function reservePhotoAttempt(
  day: string,
  limit: number
): Promise<PhotoBudgetResult> {
  const db = await getDb();
  if (!db) return "unavailable";
  const now = Date.now();
  try {
    await db
      .prepare(
        `INSERT OR IGNORE INTO ai_usage_daily (day, photo_attempts, updated_at) VALUES (?, 0, ?)`
      )
      .bind(day, now)
      .run();

    const res = await db
      .prepare(
        `UPDATE ai_usage_daily
         SET photo_attempts = photo_attempts + 1, updated_at = ?
         WHERE day = ? AND photo_attempts < ?`
      )
      .bind(now, day, limit)
      .run();

    return (res.meta?.changes ?? 0) > 0 ? "reserved" : "exhausted";
  } catch (err) {
    console.error("[photo:budget_error]", err);
    return "unavailable";
  }
}
