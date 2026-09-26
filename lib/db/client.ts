import { getCloudflareContext } from "@opennextjs/cloudflare";

type CfEnv = { DB?: D1Database };

/**
 * Возвращает D1-биндинг из Cloudflare-контекста или null вне Workers
 * (next dev без инициализированного контекста, unit-тесты, сборка без D1).
 *
 * Async-режим — единственный, который документированно работает и в
 * request-scope, и в SSG-поруте: при NEXT_RUNTIME=nodejs / nextExport
 * контекст поднимается через wrangler getPlatformProxy, в Workers берётся
 * из globalThis. Никакого глобального кеширования контекста — он
 * request-scoped, кеширование привело бы к утечке env между запросами.
 */
let testDbOverride: D1Database | null | undefined;

export async function getDb(): Promise<D1Database | null> {
  if (testDbOverride !== undefined) return testDbOverride;
  try {
    const ctx = await getCloudflareContext({ async: true });
    return (ctx.env as CfEnv).DB ?? null;
  } catch {
    return null;
  }
}

/**
 * Тестовая точка входа: подменяет D1 для unit-тестов без Cloudflare runtime.
 * `null` имитирует отсутствие биндинга, объект — фейковый D1.
 */
export function __setDbForTesting(db: D1Database | null): void {
  testDbOverride = db;
}

export function __resetDbForTesting(): void {
  testDbOverride = undefined;
}
