import os from "node:os";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

/**
 * Браузерные проверки диагностики, «Двух путей», образца рекламы и независимости
 * (прототип A, этап 1.6). Запуск: dev-сервер на 3111, затем
 *   npx playwright test tests/browser/dev-diagnostic.spec.ts
 */

const BASE = process.env.DEV_BASE_URL ?? "http://localhost:3111";
const ROUTE = "/dev/design/a-vitrina";
const SHOTS = path.join(os.tmpdir(), "dev-diagnostic-shots");
const FORBIDDEN = /\/api\/(search|analytics)|mc\.yandex|cloudflareinsights/;

test.use({ baseURL: BASE });

async function shot(page: Page, name: string) {
  await page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: false });
}

async function gotoReady(page: Page) {
  // Dev-сервер может быть занят remote-коннектами getCloudflareContext
  // от параллельных тестов — 30с дефолта иногда не хватает.
  await page.goto(ROUTE, { timeout: 90_000 });
  await page.waitForSelector("[data-hydrated]");
}

const surfaces = (page: Page) => page.getByRole("radiogroup", { name: "Поверхность" });
const problems = (page: Page) => page.getByRole("radiogroup", { name: "Тип проблемы" });
const resultTitle = (page: Page) => page.locator("[data-diagnostic-result] h3");
const surface = (page: Page, name: RegExp | string) => surfaces(page).getByRole("radio", { name });
const twoPaths = (page: Page) => page.locator("#two-paths");

test("hero: вместо фото диагностика, шапка/заголовок/поиск на месте", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoReady(page);

  await expect(page.locator("img[src*='hero-main']")).toHaveCount(0);
  await expect(page.getByText("Pexels №28576627")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Пятно, запах, налёт?");
  await expect(page.getByRole("combobox")).toBeVisible();
  await expect(surfaces(page)).toBeVisible();
  await expect(surfaces(page).getByRole("radio")).not.toHaveCount(0);
  // Протокол виден сразу: авто-выбор первой поверхности и первой проблемы
  await expect(surfaces(page).getByRole("radio", { checked: true })).toHaveCount(1);
  await expect(problems(page).getByRole("radio", { checked: true })).toHaveCount(1);
  await expect(resultTitle(page)).not.toBeEmpty();
  await shot(page, "hero-1440");
});

test("мышь: выбор поверхности и проблемы меняет результат без навигации и запросов", async ({ page }) => {
  const bad: string[] = [];
  page.on("request", (r) => FORBIDDEN.test(r.url()) && bad.push(r.url()));
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoReady(page);
  const url = page.url();
  const fetches: string[] = [];
  page.on("request", (r) => {
    if (["fetch", "xhr"].includes(r.resourceType()) && !r.url().includes("/_next/")) fetches.push(r.url());
  });

  const first = await resultTitle(page).innerText();
  await surface(page, /^Матрас/).click();
  await expect(surface(page, /^Матрас/)).toHaveAttribute("aria-checked", "true");
  const options = problems(page).getByRole("radio");
  await expect(options).toHaveCount(2); // только существующие: пятна и запахи
  await expect(options.nth(0)).toHaveAttribute("aria-checked", "true");

  await problems(page).getByRole("radio", { name: /Запахи/ }).click();
  await expect(resultTitle(page)).not.toHaveText(first);
  await expect(resultTitle(page)).toContainText(/запах|моч|сырост/i);
  expect(page.url()).toBe(url);
  expect(bad).toEqual([]);
  expect(fetches).toEqual([]);
});

test("клавиатура: стрелки, Home/End двигают выбор, roving tabindex", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoReady(page);

  const radios = surfaces(page).getByRole("radio");
  const count = await radios.count();
  await expect(radios.nth(0)).toHaveAttribute("tabindex", "0");
  await expect(radios.nth(1)).toHaveAttribute("tabindex", "-1");

  await radios.nth(0).focus();
  await page.keyboard.press("ArrowRight");
  await expect(radios.nth(1)).toBeFocused();
  await expect(radios.nth(1)).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("End");
  await expect(radios.nth(count - 1)).toBeFocused();
  await expect(radios.nth(count - 1)).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("ArrowRight"); // перенос в начало
  await expect(radios.nth(0)).toBeFocused();
  await page.keyboard.press("ArrowLeft"); // перенос в конец
  await expect(radios.nth(count - 1)).toBeFocused();
  await page.keyboard.press("Home");
  await expect(radios.nth(0)).toBeFocused();

  // Tab выходит из группы на выбранный элемент следующей группы
  await page.keyboard.press("Tab");
  await expect(problems(page).getByRole("radio", { checked: true })).toBeFocused();

  // Space/Enter выбирают сфокусированный
  await radios.nth(2).focus();
  await page.keyboard.press("Space");
  await expect(radios.nth(2)).toHaveAttribute("aria-checked", "true");
  await shot(page, "keyboard-focus");
});

test("результат: «Не делайте» первым, затем пути; шаги ограничены; без выдуманных сроков", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoReady(page);

  const warn = page.locator("[data-diagnostic-warnings]");
  const tabs = page.getByRole("tablist", { name: "Путь решения" });
  await expect(warn).toContainText("Не делайте");
  expect(await warn.locator("li").count()).toBeGreaterThan(0);
  const wy = (await warn.boundingBox())!.y;
  const ty = (await tabs.boundingBox())!.y;
  expect(wy).toBeLessThan(ty);

  const panel = page.getByRole("tabpanel");
  expect(await panel.locator("ol > li").count()).toBeLessThanOrEqual(2);
  await expect(page.locator("[data-diagnostic-result]")).toContainText("Справочная информация, не оферта");
  await expect(page.getByRole("link", { name: "Полный протокол" })).toHaveAttribute("href", /^\/solutions\/[a-z0-9-]+$/);
});

test("пути: вкладки переключаются мышью и стрелками, смета как ориентир", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoReady(page);

  const diy = page.getByRole("tab", { name: "Сделать самому" });
  const pro = page.getByRole("tab", { name: "Вызвать мастера" });
  await expect(diy).toHaveAttribute("aria-selected", "true");
  await pro.click();
  await expect(pro).toHaveAttribute("aria-selected", "true");
  const panel = page.getByRole("tabpanel");
  await expect(panel).toContainText("Ориентир цены, не оферта");
  await expect(panel).toContainText(/60[\s\S]*до[\s\S]*120/);
  await expect(panel.getByRole("link", { name: /Компании в Минске/ })).toHaveAttribute("href", "#pro");

  await pro.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(diy).toBeFocused();
  await expect(diy).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel").locator("ol")).toBeVisible();
});

test("«Два пути» следуют выбору диагностики; чеклист локальный и сбрасывается", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoReady(page);

  await expect(twoPaths(page)).toContainText(await resultTitle(page).innerText());
  const progress = twoPaths(page).locator("[data-checklist-progress]");
  const boxes = twoPaths(page).getByRole("checkbox");
  const total = await boxes.count();
  await expect(progress).toHaveText(`Выполнено 0 из ${total}`);
  await boxes.first().check();
  await expect(progress).toHaveText(`Выполнено 1 из ${total}`);
  expect(await page.evaluate(() => window.localStorage.length)).toBe(0);

  await surface(page, /^Кухня/).click();
  await expect(resultTitle(page)).toContainText(/жир|вытяж/i);
  await expect(twoPaths(page)).toContainText(await resultTitle(page).innerText());
  await expect(twoPaths(page).locator("[data-checklist-progress]")).toContainText("Выполнено 0 из");
  await expect(twoPaths(page).locator("#diy").getByRole("group", { name: "Не делайте" })).toBeVisible();
});

test("мастера: спонсор отдельным слотом над органикой, tel: с реальным номером, рейтинг только с источником", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoReady(page);

  const pro = page.locator("#pro");
  const sponsor = pro.locator("[data-sponsor-slot]");
  const organic = pro.locator("[data-organic-list]");
  await expect(sponsor).toHaveCount(1);
  await expect(sponsor).toContainText("Спонсор");
  await expect(sponsor).toContainText("вне органического порядка");
  expect((await sponsor.boundingBox())!.y).toBeLessThan((await organic.boundingBox())!.y);

  const sponsorName = await sponsor.locator("[data-company-row] a").first().innerText();
  await expect(organic).not.toContainText(sponsorName);
  await expect(organic.locator('[data-company-kind="sponsor"]')).toHaveCount(0);
  await expect(organic.getByText("Спонсор", { exact: true })).toHaveCount(0);
  expect(await organic.locator("[data-company-row]").count()).toBeLessThanOrEqual(3);
  await expect(organic).toContainText("Оплата порядок не меняет");

  const tel = pro.locator("a[href^='tel:']");
  expect(await tel.count()).toBeGreaterThanOrEqual(2);
  for (const link of await tel.all()) {
    const href = (await link.getAttribute("href"))!;
    expect(href).toMatch(/^tel:\+375\d{9}$/);
    const digits = (await link.innerText()).replace(/\D/g, "");
    expect(digits).toContain(href.replace(/\D/g, ""));
    expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
  for (const row of await pro.locator("[data-company-row]").all()) {
    const text = await row.innerText();
    if (/\d\.\d/.test(text)) expect(text).toMatch(/Google|Яндекс/);
    else expect(text).toMatch(/Рейтинг не публикуется|Профиль проверен|Спонсор показа/);
  }
  await pro.scrollIntoViewIfNeeded();
  await shot(page, "pro-companies");
});

test("образец рекламы: метка, отдельно от органики, без ссылок и событий", async ({ page }) => {
  const bad: string[] = [];
  page.on("request", (r) => FORBIDDEN.test(r.url()) && bad.push(r.url()));
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoReady(page);

  const strip = page.locator("[data-ad-strip]");
  await strip.scrollIntoViewIfNeeded();
  await expect(strip).toContainText("Реклама");
  await expect(strip).toContainText("вне органической выдачи");
  await expect(strip.locator("a, button")).toHaveCount(0);
  await expect(twoPaths(page).locator("[data-ad-strip]")).toHaveCount(0);
  await page.waitForTimeout(500);
  expect(bad).toEqual([]);
  await shot(page, "ad-strip");
});

test("независимость: один блок с четырьмя фактами и ссылкой на методику", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoReady(page);

  const block = page.getByRole("region", { name: "Оплата не покупает место в рейтинге" });
  await block.scrollIntoViewIfNeeded();
  await expect(block.locator("dt")).toHaveCount(4);
  await expect(block.getByRole("link", { name: /Читать методику/ })).toHaveAttribute("href", "/rating/methodology");
  await shot(page, "independence");
});

for (const dark of [false, true]) {
  for (const width of [320, 390, 768, 1024, 1440]) {
    test(`reflow ${width}px, ${dark ? "тёмная" : "светлая"} тема: без overflow, диагностика и пути на месте`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: width < 700 ? 800 : 900 });
      await gotoReady(page);
      if (dark) await page.getByRole("button", { name: "Тёмная тема прототипа" }).click();

      const overflow = () =>
        page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(await overflow()).toBeLessThanOrEqual(0);

      await surface(page, /^Матрас/).click();
      await problems(page).getByRole("radio", { name: /Запахи/ }).click();
      await page.getByRole("tab", { name: "Вызвать мастера" }).click();
      expect(await overflow()).toBeLessThanOrEqual(0);

      for (const sel of ["#diagnostic > div", "#two-paths", "#pro", "[data-ad-strip]"]) {
        const clipped = await page
          .locator(sel)
          .first()
          .evaluate((el) => el.scrollWidth - el.clientWidth);
        expect(clipped, sel).toBeLessThanOrEqual(0);
      }
      for (const btn of await page.locator("#diagnostic [role=radio], #diagnostic [role=tab]").all()) {
        expect((await btn.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      }
      await page.locator("#diagnostic").scrollIntoViewIfNeeded();
      await shot(page, `diag-${width}-${dark ? "dark" : "light"}`);
    });
  }
}

test("390x844: поиск виден до скролла, диагностика ниже него", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoReady(page);
  const submit = (await page.getByRole("button", { name: "Найти" }).boundingBox())!;
  expect(submit.y + submit.height).toBeLessThanOrEqual(844);
  const diag = (await page.locator("#diagnostic").boundingBox())!;
  expect(diag.y).toBeGreaterThan(submit.y + submit.height);
});

test.describe("reduced motion", () => {
  test("функции работают без движения: результат виден сразу", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoReady(page);
    await surface(page, /^Кухня/).click();
    await expect(resultTitle(page)).toContainText(/жир|вытяж/i);
    // Без движения: итоговая прозрачность достигается практически мгновенно (spring занял бы сотни мс).
    await expect(page.locator("[data-diagnostic-result] > div").first()).toHaveCSS("opacity", "1", { timeout: 250 });
    await page.getByRole("tab", { name: "Вызвать мастера" }).click();
    await expect(page.getByRole("tabpanel")).toContainText("Ориентир цены, не оферта");
  });
});
