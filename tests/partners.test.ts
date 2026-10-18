import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  NON_OFFER_DISCLAIMER,
  PRO_BUDGET_FROM,
  formatProBudget,
  parsePartnerPrefill,
  partnerClaimHref,
} from "../lib/partners.js";

/** Intl ставит неразрывные пробелы — сравниваем после нормализации. */
const plain = (value: string) => value.replace(/\s/g, " ");

describe("formatProBudget — мультивалютный ориентир PRO", () => {
  it("formats the budget in the currency of each market", () => {
    assert.equal(plain(formatProBudget("BY")), "от 149 Br/мес");
    assert.equal(plain(formatProBudget("RU")), "от 4 500 ₽/мес");
    assert.equal(plain(formatProBudget("KZ")), "от 24 000 ₸/мес");
  });

  it("keeps a budget for every market and a non-offer disclaimer", () => {
    assert.deepEqual(Object.keys(PRO_BUDGET_FROM).sort(), ["BY", "KZ", "RU"]);
    assert.match(NON_OFFER_DISCLAIMER, /Не является публичной офертой/);
    assert.match(NON_OFFER_DISCLAIMER, /B2B-договором/);
  });
});

describe("parsePartnerPrefill — авто-заполнение формы партнёра", () => {
  it("reads company, open city, plan and known categories", () => {
    const prefill = parsePartnerPrefill(
      new URLSearchParams("company=Спектр Клининг&city=Минск&plan=pro&categories=upholstery,offices,upholstery")
    );
    assert.deepEqual(prefill, {
      companyName: "Спектр Клининг",
      city: "Минск",
      plan: "pro",
      categoryIds: ["upholstery", "offices"],
    });
  });

  it("drops unknown cities, plans and categories", () => {
    const prefill = parsePartnerPrefill(
      new URLSearchParams("company=Чистый дом&city=Алматы&plan=gold&categories=hacking,windows")
    );
    assert.deepEqual(prefill, { companyName: "Чистый дом", city: undefined, plan: undefined, categoryIds: ["windows"] });
  });

  it("returns null when nothing useful is in the link", () => {
    assert.equal(parsePartnerPrefill(new URLSearchParams("")), null);
    assert.equal(parsePartnerPrefill(new URLSearchParams("company=x&plan=vip")), null);
  });

  it("trims and caps the company name", () => {
    const prefill = parsePartnerPrefill(new URLSearchParams(`company=${encodeURIComponent(`  ${"А".repeat(200)}  `)}`));
    assert.equal(prefill?.companyName?.length, 120);
  });

  it("round-trips the claim link from a company profile", () => {
    const href = partnerClaimHref({ name: "Спектр Клининг", city: "Москва", categories: ["apartments", "windows"] }, "base");
    assert.ok(href.startsWith("/for-partners?"));
    assert.ok(href.endsWith("#partner-form"));
    const query = href.slice(href.indexOf("?") + 1, href.indexOf("#"));
    assert.deepEqual(parsePartnerPrefill(new URLSearchParams(query)), {
      companyName: "Спектр Клининг",
      city: "Москва",
      plan: "base",
      categoryIds: ["apartments", "windows"],
    });
  });
});
