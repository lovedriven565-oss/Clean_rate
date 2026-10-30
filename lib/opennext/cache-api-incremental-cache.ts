import type { IncrementalCache } from "@opennextjs/aws/types/overrides.js";

/**
 * Incremental-кеш OpenNext поверх встроенного Cache API воркера (caches.default).
 *
 * Зачем: дефолтный `incrementalCache: "dummy"` ничего не хранит — каждый запрос
 * к SSG-странице заново рендерился в воркере (x-nextjs-cache: MISS), что давало
 * медленные ответы и превышения CPU-лимита (error 1102) на холодном старте.
 *
 * Cache API не требует отдельных ресурсов (KV/R2): записи живут в кеше
 * дата-центра Cloudflare и вымываются по LRU. Ключ включает OPEN_NEXT_BUILD_ID —
 * записи прошлых деплоев недостижимы и не отдаются.
 *
 * Вне workerd (next dev, unit-тесты, node) `caches.default` отсутствует —
 * реализация деградирует в no-op, как и dummy-кеш.
 */

type CacheEntryValue = Parameters<IncrementalCache["set"]>[1];
type StoredEntry = { value: CacheEntryValue; lastModified: number };

const CACHE_HOST = "https://opennext-incache.chistolab.internal";

function entryUrl(key: string, cacheType?: string): string {
  const buildId = process.env.OPEN_NEXT_BUILD_ID ?? "local";
  const safeKey = key.split("/").map(encodeURIComponent).join("/");
  return `${CACHE_HOST}/${encodeURIComponent(buildId)}/${cacheType ?? "cache"}/${safeKey}`;
}

function store(): Cache | null {
  try {
    return (globalThis as { caches?: { default?: Cache } }).caches?.default ?? null;
  } catch {
    return null;
  }
}

const cacheApiIncrementalCache: IncrementalCache = {
  name: "cf-cache-api-incremental-cache",

  async get(key, cacheType) {
    const cache = store();
    if (!cache) return null;
    try {
      const res = await cache.match(entryUrl(key, cacheType));
      if (!res) return null;
      const entry = (await res.json()) as StoredEntry;
      return { value: entry.value as never, lastModified: entry.lastModified };
    } catch {
      return null;
    }
  },

  async set(key, value, cacheType) {
    const cache = store();
    if (!cache) return;
    try {
      const entry: StoredEntry = { value, lastModified: Date.now() };
      await cache.put(
        entryUrl(key, cacheType),
        new Response(JSON.stringify(entry), {
          headers: { "content-type": "application/json" },
        })
      );
    } catch {
      // Кеш — оптимизация доступности; ошибка записи не должна ломать ответ.
    }
  },

  async delete(key) {
    const cache = store();
    if (!cache) return;
    try {
      await cache.delete(entryUrl(key));
    } catch {
      // см. set
    }
  },
};

export default cacheApiIncrementalCache;
