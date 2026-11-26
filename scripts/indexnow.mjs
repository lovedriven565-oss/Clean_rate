#!/usr/bin/env node
/**
 * IndexNow: мгновенная отправка URL сайта в Яндекс/Bing без ожидания обхода.
 *
 * Запуск после деплоя или публикации новых страниц:
 *   npm run indexnow                      — все URL из sitemap.xml
 *   node scripts/indexnow.mjs /solutions/novyy-protokol …  — только указанные пути
 *
 * Ключ IndexNow публичен и размещён на сайте: /{INDEXNOW_KEY}.txt
 * (файл public/{INDEXNOW_KEY}.txt обязан существовать — Яндекс проверяет его при приёме).
 */

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://chistolab.pro").replace(/\/+$/, "");
const INDEXNOW_KEY = "930a45d1278fc388cbf6abc7b8e05937";
const ENDPOINTS = [
  "https://api.indexnow.org/indexnow",
  "https://yandex.com/indexnow",
];
const BATCH_LIMIT = 10_000; // лимит протокола на одну отправку

const args = process.argv.slice(2);

async function collectUrls() {
  if (args.length > 0) {
    return args.map((path) => new URL(path, `${SITE_URL}/`).toString());
  }
  const res = await fetch(`${SITE_URL}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml: HTTP ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function submit(urls) {
  const payload = {
    host: new URL(SITE_URL).host,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls.slice(0, BATCH_LIMIT),
  };
  for (const endpoint of ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload),
      });
      // 200/202 — принято; 422 — формат; остальное логируем без падения.
      console.log(`${endpoint}: HTTP ${res.status}`);
      if (!res.ok) console.log(await res.text());
    } catch (err) {
      console.error(`${endpoint}: ${err.message}`);
    }
  }
}

const urls = await collectUrls();
if (urls.length === 0) {
  console.log("No URLs to submit.");
  process.exit(0);
}
console.log(`Submitting ${urls.length} URL(s) to IndexNow…`);
await submit(urls);
