import os from "node:os";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

/**
 * Targeted browser-проверки первого экрана прототипа A (/dev/design/a-vitrina).
 * Запуск без общего config: dev-сервер на 3111, затем
 *   npx playwright test tests/browser/dev-hero.spec.ts
 * Скриншоты — во временную папку ОС (tool artifacts, не документация).
 */

const BASE = process.env.DEV_BASE_URL ?? "http://localhost:3111";
const ROUTE = "/dev/design/a-vitrina";
const SHOTS = path.join(os.tmpdir(), "dev-hero-shots");

test.use({ baseURL: BASE });

async function shot(page: Page, name: string) {
  await page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: false });
}

/**
 * Ждём фактической гидрации React (data-hydrated выставляется в useEffect),
 * иначе ранние fill/click в dev-режиме уходят до установки обработчиков.
 */
async function gotoReady(page: Page) {
  await page.goto(ROUTE);
  await page.waitForSelector("[data-hydrated]");
}

/** На dev-маршруте не должно быть запросов к поиску/аналитике/внешним счётчикам. */
function collectForbiddenRequests(page: Page): string[] {
  const hits: string[] = [];
  page.on("request", (req) => {
    const url = req.url();
    if (
      url.includes("/api/search") ||
      url.includes("/api/analytics") ||
      url.includes("mc.yandex") ||
      url.includes("cloudflareinsights")
    ) {
      hits.push(url);
    }
  });
  return hits;
}

test("390x844: заголовок и кнопка поиска видны до первого скролла, без горизонтального overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoReady(page);

  const input = page.getByRole("combobox");
  const submit = page.getByRole("button", { name: "Найти" });
  await expect(input).toBeVisible();
  await expect(submit).toBeVisible();

  const submitBox = await submit.boundingBox();
  expect(submitBox).not.toBeNull();
  expect(submitBox!.y + submitBox!.height).toBeLessThanOrEqual(844);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
  await shot(page, "mobile-390");
});

test("1440x900: поисковое действие в первом viewport, навигация в одну строку", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoReady(page);

  const submit = page.getByRole("button", { name: "Найти" });
  const submitBox = await submit.boundingBox();
  expect(submitBox!.y + submitBox!.height).toBeLessThanOrEqual(900);

  const nav = page.getByRole("navigation", { name: "Основная навигация" });
  await expect(nav).toBeVisible();
  const navBox = await nav.boundingBox();
  const linkBoxes = await nav.getByRole("link").all();
  const ys = new Set<number>();
  for (const link of linkBoxes) ys.add(Math.round((await link.boundingBox())!.y));
  expect(ys.size).toBe(1); // одна строка
  expect(navBox!.height).toBeLessThanOrEqual(64);
  await shot(page, "desktop-1440");
});

test("поиск: подсказки, клавиатура и Enter ведут на реальное решение", async ({ page }) => {
  test.setTimeout(90_000); // первая SPA-навигация ждёт dev-компиляцию /solutions/[slug]
  const forbidden = collectForbiddenRequests(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoReady(page);

  const input = page.getByRole("combobox");
  await input.fill("вино");
  const listbox = page.getByRole("listbox");
  await expect(listbox).toBeVisible();
  const options = listbox.getByRole("option");
  expect(await options.count()).toBeGreaterThan(0);
  expect(await options.count()).toBeLessThanOrEqual(5);
  await shot(page, "search-suggest");

  await input.press("ArrowDown");
  await expect(options.first()).toHaveAttribute("aria-selected", "true");
  await input.press("Enter");
  await page.waitForURL("**/solutions/**");
  expect(new URL(page.url()).pathname).toMatch(/^\/solutions\/[a-z0-9-]+$/);

  expect(forbidden).toEqual([]);
});

test("no-match: честное сообщение и ссылка на /solutions", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoReady(page);

  const input = page.getByRole("combobox");
  await input.fill("квантовая запутанность полов");
  const noMatch = page.getByText("В локальном образце такого протокола нет");
  await expect(noMatch).toBeVisible();
  const all = noMatch.locator("..").getByRole("link", { name: "Все решения" });
  await expect(all).toBeVisible();
  await expect(all).toHaveAttribute("href", "/solutions");
  await shot(page, "search-no-match");
});

test("pro-аудитория: честная граница и ссылка на /brands", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoReady(page);

  await page.getByRole("button", { name: "Для профи" }).click();
  await expect(page.getByRole("link", { name: "каталог брендов" })).toBeVisible();
});

test("тема прототипа переключается локально, без записи ch_theme и html.dark", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoReady(page);

  await page.getByRole("button", { name: "Тёмная тема прототипа" }).click();
  const storage = await page.evaluate(() => localStorage.getItem("ch_theme"));
  expect(storage).toBeNull();
  const htmlDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
  expect(htmlDark).toBe(false); // не задано пользователем — тёмная только внутри прототипа
  await shot(page, "dark-theme");
});

test("мобильное меню открывается и ведёт на реальные разделы", async ({ page }) => {
  test.setTimeout(90_000); // переход на /solutions ждёт dev-компиляцию маршрута
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoReady(page);

  await page.getByRole("button", { name: "Открыть меню" }).click();
  const nav = page.getByRole("navigation", { name: "Мобильная навигация" });
  await expect(nav).toBeVisible();
  await shot(page, "mobile-menu");
  await nav.getByRole("link", { name: "Решения" }).click();
  await page.waitForURL("**/solutions");
});

for (const viewport of [
  { width: 320, height: 640 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
]) {
  test(`reflow ${viewport.width}x${viewport.height}: без горизонтального overflow`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await gotoReady(page);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    await expect(page.getByRole("combobox")).toBeVisible();
    await shot(page, `viewport-${viewport.width}`);
  });
}

test("zoom 200% эквивалент: reflow на 400 CSS px без overflow", async ({ page }) => {
  // Настоящий браузерный zoom 200% при 800px = layout-вьюпорт 400 CSS px.
  // (body.style.zoom не эквивалентен: медиа-запросы продолжают видеть 800px.)
  await page.setViewportSize({ width: 400, height: 800 });
  await gotoReady(page);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
  await expect(page.getByRole("combobox")).toBeVisible();
});

test("Escape и очистка закрывают подсказки; фокус остаётся в поле", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoReady(page);

  const input = page.getByRole("combobox");
  await input.fill("кофе");
  await expect(page.getByRole("listbox")).toBeVisible();
  await input.press("Escape");
  await expect(page.getByRole("listbox")).not.toBeVisible();

  await page.getByRole("button", { name: "Очистить запрос" }).click();
  await expect(input).toHaveValue("");
  await expect(input).toBeFocused();
});
