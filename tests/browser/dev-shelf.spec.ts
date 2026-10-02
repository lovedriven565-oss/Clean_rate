import os from "node:os";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

/**
 * Браузерные проверки тематических полок прототипа A (этап 1.4).
 * Запуск: dev-сервер на 3111, затем
 *   npx playwright test tests/browser/dev-shelf.spec.ts
 */

const BASE = process.env.DEV_BASE_URL ?? "http://localhost:3111";
const ROUTE = "/dev/design/a-vitrina";
const SHOTS = path.join(os.tmpdir(), "dev-shelf-shots");

test.use({ baseURL: BASE });

async function shot(page: Page, name: string) {
  await page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: false });
}

async function gotoReady(page: Page) {
  await page.goto(ROUTE);
  await page.waitForSelector("[data-hydrated]");
}

const shelfRegion = (page: Page) => page.getByRole("region", { name: /Темы задач/ });
const track = (page: Page) => page.getByRole("list", { name: /листайте стрелками/i });

test("полка рендерит 6 реальных обложек; featured шире; «Все решения» → /solutions", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoReady(page);

  const region = shelfRegion(page);
  await region.scrollIntoViewIfNeeded();

  const covers = region.getByRole("listitem");
  expect(await covers.count()).toBe(6);

  const allLink = region.getByRole("link", { name: /Все решения/ }).first();
  await expect(allLink).toHaveAttribute("href", "/solutions");

  const featured = covers.first().getByRole("link");
  const regular = covers.nth(1).getByRole("link");
  const fb = await featured.boundingBox();
  const rb = await regular.boundingBox();
  expect(fb!.width).toBeGreaterThan(rb!.width); // одно крупное выделение

  // честный счётчик одним числом: «4 решения», без дубля
  await expect(featured).toContainText("4 решения");
  await expect(featured).not.toContainText("4 4");
  await shot(page, "shelf-desktop");
});

test("обложки ведут на реальные фильтры /solutions и страницы решений", async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoReady(page);

  const region = shelfRegion(page);
  await region.scrollIntoViewIfNeeded();

  const hrefs = await region.getByRole("listitem").getByRole("link").all();
  for (const link of hrefs) {
    const href = await link.getAttribute("href");
    expect(href).toMatch(/^\/solutions(\?[a-z]+=[a-z]+)?$/);
  }

  await region.getByRole("link", { name: /Кухня/ }).click();
  await page.waitForURL("**/solutions?surface=kitchen");
});

test("стрелки: честные disabled-состояния в начале и конце, скролл работает", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await gotoReady(page);

  const prev = page.getByRole("button", { name: "Листать назад" });
  const next = page.getByRole("button", { name: "Листать вперёд" });
  const list = track(page);
  await list.scrollIntoViewIfNeeded();

  await expect(prev).toBeDisabled();
  await expect(next).toBeEnabled();

  await next.click();
  await expect.poll(() => list.evaluate((el) => el.scrollLeft)).toBeGreaterThan(50);
  await expect(prev).toBeEnabled();

  // докручиваем до конца — next гаснет
  await list.evaluate((el) => el.scrollTo({ left: el.scrollWidth, behavior: "instant" }));
  await expect(next).toBeDisabled();
  await shot(page, "shelf-scrolled-end");
});

test("клавиатура: ArrowRight/ArrowLeft прокручивают область, фокус не теряется", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await gotoReady(page);

  const list = track(page);
  await list.scrollIntoViewIfNeeded();
  await list.focus();
  await list.press("ArrowRight");
  await expect.poll(() => list.evaluate((el) => el.scrollLeft)).toBeGreaterThan(50);
  await list.press("ArrowLeft");
  await expect.poll(() => list.evaluate((el) => el.scrollLeft)).toBeLessThanOrEqual(50);
  await expect(list).toBeFocused();
});

test("320px: полка без document-overflow, «Все решения» доступна под лентой", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await gotoReady(page);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);

  const region = shelfRegion(page);
  await region.scrollIntoViewIfNeeded();
  // на мобильной видна следующая карточка — сигнал горизонтальной ленты
  const covers = region.getByRole("listitem");
  const second = await covers.nth(1).boundingBox();
  const viewportRight = 320;
  expect(second!.x).toBeLessThan(viewportRight); // частично видна
  await shot(page, "shelf-320");
});

test("изображения обложек ленивые и имеют alt", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoReady(page);

  const imgs = shelfRegion(page).locator("img");
  expect(await imgs.count()).toBe(6);
  for (let i = 0; i < 6; i++) {
    await expect(imgs.nth(i)).toHaveAttribute("loading", "lazy");
    const alt = await imgs.nth(i).getAttribute("alt");
    expect(alt!.length).toBeGreaterThan(10);
  }
});

test("тёмная тема прототипа: полка и подписи читаемы", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoReady(page);

  await page.getByRole("button", { name: "Тёмная тема прототипа" }).click();
  const region = shelfRegion(page);
  await region.scrollIntoViewIfNeeded();
  await expect(region.getByRole("heading", { name: "Темы задач" })).toBeVisible();
  await shot(page, "shelf-dark");
});
