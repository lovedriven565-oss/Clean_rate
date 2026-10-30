import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import cacheApiIncrementalCache from "./lib/opennext/cache-api-incremental-cache";

export default defineCloudflareConfig({
  // Cache API воркера вместо dummy-кеша: SSG-страницы отдаются из кеша,
  // а не перерендериваются на каждый запрос.
  incrementalCache: cacheApiIncrementalCache,
  // Маршрутизация проверяет кеш до запуска Next.js — меньше CPU на хите.
  // PPR не используется, поэтому интерсепция безопасна.
  enableCacheInterception: true,
});
