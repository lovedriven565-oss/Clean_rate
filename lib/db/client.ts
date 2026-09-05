/**
 * D1-клиент для Cloudflare Workers.
 *
 * В production (Cloudflare) — получает binding через getRequestContext().
 * В next dev — binding недоступен, возвращаем null (fallback на seed-data).
 */

// D1Database объявлен глобально в cloudflare-env.d.ts
let cachedDb: D1Database | null | undefined;

export function getDb(): D1Database | null {
  if (cachedDb !== undefined) return cachedDb;
  try {
    // Динамический импорт — в next dev этого модуля нет
    const { getRequestContext } = require("@opennextjs/cloudflare");
    const ctx = getRequestContext();
    cachedDb = (ctx.env as { DB?: D1Database }).DB ?? null;
  } catch {
    cachedDb = null;
  }
  return cachedDb;
}
