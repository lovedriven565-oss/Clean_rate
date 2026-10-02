import os from "node:os";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

/**
 * Браузерные проверки карточек и быстрого просмотра прототипа A (этап 1.5).
 * Запуск: dev-сервер на 3111, затем
 *   npx playwright test tests/browser/dev-cards.spec.ts
 */

const BASE = process.env.DEV_BASE_URL ?? "http://localhost:3111";
const ROUTE = "/dev/design/a-vitrina";
const SHOTS = path.join(os.tmpdir(), "dev-cards-shots");

test.use({ baseURL: BASE });

async function shot(page: Page, name: string) {
  await page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: false });
}

async function gotoReady(page: Page) {
  await page.goto(ROUTE);
  await page.waitForSelector("[data-hydrated]");
}

const card = (page: Page, kind: string) => page.locator(`article[data-card-kind="${kind}"]`);
const quick = (page: Page) => page.locator("[data-quickview]");

test("рендерит карточки task/product/company/ad и состояния", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoReady(page);

  expect(await page.getByRole("region", { name: "Карточки задач" }).locator("article").count()).toBe(3);
  expect(await card(page, "company").count()).toBeGreaterThanOrEqual(3);
  // product 1 в разделе средств; ad 1; long-sample — task в состояниях
  expect(await card(page, "product").count()).toBe(1);
  expect(await card(page, "ad").count()).toBe(1);

  const states = page.locator("[data-states]");
  await expect(states.getByRole("status", { name: "Загрузка карточки" })).toBeVisible();
  await expect(states.getByText("Ничего не нашлось")).toBeVisible();
  await expect(states.getByRole("alert")).toContainText("Не удалось загрузить");
  await states.scrollIntoViewIfNeeded();
  await shot(page, "cards-states");
});

test("быстрый просмотр по наведению мыши: открывается, закрывается, раскладка не прыгает", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoReady(page);

  const task = card(page, "task").first();
  await task.scrollIntoViewIfNeeded();
  const before = await task.boundingBox();
  await expect(quick(page)).toHaveCount(0);

  await task.hover();
  await expect(quick(page)).toHaveCount(1);
  await expect(quick(page)).toContainText("Ограничения и осторожность");
  await expect(quick(page)).toContainText("Справочная информация, не оферта");
  const during = await task.boundingBox();
  expect(Math.abs(during!.height - before!.height)).toBeLessThanOrEqual(1);
  expect(Math.abs(during!.y - before!.y)).toBeLessThanOrEqual(1);
  await shot(page, "quickview-hover");

  await page.mouse.move(2, 2);
  await expect(quick(page)).toHaveCount(0);
});

test("быстрый просмотр по фокусу клавиатуры; Escape закрывает, фокус остаётся", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoReady(page);

  const task = card(page, "task").first();
  await task.scrollIntoViewIfNeeded();
  const btn = task.getByRole("button", { name: /Быстрый просмотр/ });
  await btn.focus();
  await expect(quick(page)).toHaveCount(1);
  await expect(btn).toHaveAttribute("aria-expanded", "true");

  await page.keyboard.press("Escape");
  await expect(quick(page)).toHaveCount(0);
  await expect(btn).toBeFocused();
  await expect(btn).toHaveAttribute("aria-expanded", "false");

  // уход фокуса и возврат открывает снова
  await page.locator("body").click({ position: { x: 2, y: 2 } });
  await btn.focus();
  await expect(quick(page)).toHaveCount(1);
});

test("явная кнопка: закрепляет просмотр и закрывает; безопасность видна и без просмотра", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoReady(page);

  const task = card(page, "task").first();
  await task.scrollIntoViewIfNeeded();

  // лицевая сторона уже содержит предупреждение
  const faceCaution = await task.locator("p:has(svg) span.line-clamp-2").first().innerText();
  expect(faceCaution.length).toBeGreaterThan(5);

  await task.getByRole("button", { name: "Быстрый просмотр" }).click();
  await page.mouse.move(2, 2);
  await expect(quick(page)).toHaveCount(1); // закреплён, уход мыши не закрывает
  await expect(quick(page)).toContainText(faceCaution.slice(0, 20));

  await task.getByRole("button", { name: "Закрыть просмотр" }).click();
  await expect(quick(page)).toHaveCount(0);
});

test.describe("touch 390×844", () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

  test("тап по кнопке открывает и закрывает просмотр; кнопка ≥44px; без hover-only", async ({ page }) => {
    await gotoReady(page);
    const task = card(page, "task").first();
    await task.scrollIntoViewIfNeeded();

    const btn = task.getByRole("button", { name: "Быстрый просмотр" });
    const box = await btn.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    await expect(quick(page)).toHaveCount(0);

    await btn.tap();
    await expect(quick(page)).toHaveCount(1);
    await shot(page, "quickview-touch");

    await task.getByRole("button", { name: "Закрыть просмотр" }).tap();
    await expect(quick(page)).toHaveCount(0);
  });
});

test("демо-образец средства: явная пометка, нет выдуманных данных, изображение недоступно", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoReady(page);

  const product = card(page, "product");
  await product.scrollIntoViewIfNeeded();
  await expect(product).toContainText("Демо-образец");
  await expect(product).toContainText("не указана");
  await expect(product).toContainText("не указано");
  await expect(product.locator("a")).toHaveCount(0);
  await expect(product.getByText("Изображение недоступно")).toBeVisible();
  const text = await product.innerText();
  expect(text).not.toMatch(/BYN|₽|\d+[.,]\d{2}\s?(руб|BYN)|★/);
  await shot(page, "product-sample");
});

test("реклама отдельно от органики: метка, отдельная секция, без внешних ссылок", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoReady(page);

  const ad = card(page, "ad");
  await ad.scrollIntoViewIfNeeded();
  await expect(ad.getByText("Реклама", { exact: true }).first()).toBeVisible();
  await expect(ad).toContainText("вне органической выдачи");
  await expect(ad.locator("a")).toHaveCount(0);

  const adSection = page.getByRole("region", { name: /Рекламный образец/ });
  await expect(adSection.locator("article")).toHaveCount(1);
  for (const name of ["Карточки задач", "Средства под задачу", "Компании"]) {
    await expect(page.getByRole("region", { name }).locator('article[data-card-kind="ad"]')).toHaveCount(0);
  }
  await shot(page, "ad-sample");
});

test("компании: спонсор помечен, рейтинг только с источником, цена по запросу честная", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoReady(page);

  const companies = card(page, "company");
  await companies.first().scrollIntoViewIfNeeded();
  await expect(companies.filter({ hasText: "Спонсор" }).first()).toBeVisible();
  const texts = await companies.allInnerTexts();
  for (const t of texts) {
    if (/Рейтинг\s*\n?\s*Рейтинг не публикуется/.test(t)) continue;
    if (/Рейтинг/.test(t)) expect(t).toMatch(/Google|Яндекс|не публикуется/);
  }
  await shot(page, "companies");
});

test("длинное содержимое не ломает карточку; 320px без горизонтального переполнения", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await gotoReady(page);

  const long = card(page, "task").last();
  await long.scrollIntoViewIfNeeded();
  const clipped = await long.evaluate((el) => el.scrollWidth - el.clientWidth);
  expect(clipped).toBeLessThanOrEqual(0);
  await long.getByRole("button", { name: "Быстрый просмотр" }).click();
  await expect(quick(page)).toHaveCount(1);
  const panel = await quick(page).evaluate((el) => ({ sw: el.scrollWidth, cw: el.clientWidth }));
  expect(panel.sw - panel.cw).toBeLessThanOrEqual(0);
  await shot(page, "long-320");

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test("тёмная тема: карточки и просмотр читаемы", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoReady(page);
  await page.getByRole("button", { name: "Тёмная тема прототипа" }).click();
  const task = card(page, "task").first();
  await task.scrollIntoViewIfNeeded();
  await task.hover();
  await expect(quick(page)).toHaveCount(1);
  await shot(page, "cards-dark");
});

test("нет запросов к /api/search и аналитике от карточек", async ({ page }) => {
  const bad: string[] = [];
  page.on("request", (r) => {
    if (/\/api\/(search|analytics)|mc\.yandex|cloudflareinsights/.test(r.url())) bad.push(r.url());
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoReady(page);
  const task = card(page, "task").first();
  await task.scrollIntoViewIfNeeded();
  await task.hover();
  await task.getByRole("button", { name: /Быстрый просмотр/ }).click();
  await page.waitForTimeout(500);
  expect(bad).toEqual([]);
});
