// Визуальный baseline/регресс: скриншоты страниц в light/dark на 390 и 1440 + консольные ошибки и CLS.
// Использование: node scripts/screenshots.mjs [outDir] [--url http://localhost:3111]
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const outDir = process.argv[2] ?? ".shots/run";
const baseUrl = process.argv.includes("--url")
  ? process.argv[process.argv.indexOf("--url") + 1]
  : "http://localhost:3111";

const pages = [
  { name: "home", path: "/" },
  { name: "solution", path: "/solutions/vino-na-divane" },
  { name: "rating", path: "/rating" },
  { name: "solutions", path: "/solutions" },
  { name: "for-brands", path: "/for-brands" },
  { name: "for-partners", path: "/for-partners" },
];
const viewports = [
  { name: "390", width: 390, height: 844 },
  { name: "1440", width: 1440, height: 900 },
];
const themes = ["light", "dark"];

const browser = await chromium.launch();
const issues = [];

for (const vp of viewports) {
  for (const theme of themes) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      colorScheme: theme,
      deviceScaleFactor: 1,
    });
    for (const p of pages) {
      const page = await context.newPage();
      const errors = [];
      page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
      });
      page.on("pageerror", (e) => errors.push(String(e)));
      await page.addInitScript((t) => {
        try {
          localStorage.setItem("ch_theme", t);
        } catch {}
        window.__cls = 0;
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
        }).observe({ type: "layout-shift", buffered: true });
      }, theme);
      await page.goto(`${baseUrl}${p.path}`, { waitUntil: "load", timeout: 60000 });
      // Ждём гидрацию (dev-режим медленный), иначе whileInView-наблюдатели не успеют повеситься.
      await page.waitForTimeout(1500);
      // Прокрутка вниз, чтобы сработали whileInView-анимации и lazy-изображения,
      // затем наверх — fullPage-скриншот снимает уже показанный контент.
      await page.evaluate(async () => {
        const step = Math.round(window.innerHeight * 0.6);
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 250));
        }
        window.scrollTo(0, document.body.scrollHeight);
        await new Promise((r) => setTimeout(r, 800));
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(700);
      const cls = await page.evaluate(() => window.__cls ?? -1);
      const dir = path.join(outDir, `${p.name}-${vp.name}-${theme}.png`);
      await mkdir(path.dirname(dir), { recursive: true });
      await page.screenshot({ path: dir, fullPage: true });
      if (errors.length || cls > 0.05) {
        issues.push({ page: p.name, viewport: vp.name, theme, cls: cls.toFixed(3), errors });
      }
      console.log(`✓ ${p.name} ${vp.name} ${theme}  CLS=${cls.toFixed(3)}${errors.length ? `  ERRORS: ${errors.join(" | ")}` : ""}`);
      await page.close();
    }
    await context.close();
  }
}

await browser.close();
console.log(issues.length ? `\nПроблемы:\n${JSON.stringify(issues, null, 2)}` : "\nЧисто: без ошибок консоли и CLS > 0.05");
