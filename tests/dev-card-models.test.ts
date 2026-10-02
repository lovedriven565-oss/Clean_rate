import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildAdSampleCard,
  buildCompanyCard,
  buildLongContentSample,
  buildProductSampleCard,
  buildTaskCard,
  clampText,
  companyRatingText,
} from "../components/dev/card-models.js";
import { getFallbackCompanies, getFallbackSolutions } from "../lib/db/fallback.js";

const solutions = getFallbackSolutions();
const companies = getFallbackCompanies();

describe("dev card models", () => {
  it("task card is built from real solution data with a real href", () => {
    const s = solutions[0];
    const c = buildTaskCard(s);
    assert.equal(c.kind, "task");
    assert.equal(c.href, `/solutions/${s.slug}`);
    assert.equal(c.title, s.title);
    assert.ok(c.quick.points.length > 0);
    assert.deepEqual(c.quick.cautions.length, Math.min(3, s.warnings.length));
    assert.match(c.img!.src, /^\/dev\/a-tasks\/[a-z]+\.jpg$/);
    assert.equal(c.img!.alt, "");
  });

  it("every published solution produces a valid task card", () => {
    for (const s of solutions) {
      const c = buildTaskCard(s);
      assert.ok(c.title && c.summary && c.facts.length === 4);
    }
  });

  it("company rating: external rating if present; trust status for sponsor/verified; otherwise 'не публикуется'", () => {
    assert.equal(
      companyRatingText({ ratingSource: "unverified", baseRating: 4.9, reviewCount: 50, promoted: false, verified: false }),
      "Рейтинг не публикуется",
    );
    assert.equal(
      companyRatingText({ ratingSource: "new", baseRating: 0, reviewCount: 0, promoted: false, verified: false }),
      "Рейтинг не публикуется",
    );
    assert.equal(
      companyRatingText({ ratingSource: "google", baseRating: 0, reviewCount: 10, promoted: false, verified: false }),
      "Рейтинг не публикуется",
    );
    assert.match(
      companyRatingText({ ratingSource: "yandex", baseRating: 4.6, reviewCount: 12, promoted: false, verified: false }),
      /^4\.6 · 12 отзывов · Яндекс$/,
    );
    // Спонсор без подтверждённых внешних отзывов не получает сухой "не публикуется"
    assert.equal(
      companyRatingText({ ratingSource: "unverified", baseRating: 0, reviewCount: 0, promoted: true, verified: true }),
      "Спонсор показа · Профиль проверен",
    );
    assert.equal(
      companyRatingText({ ratingSource: "unverified", baseRating: 0, reviewCount: 0, promoted: false, verified: true }),
      "Профиль проверен редакцией",
    );
  });

  it("company card: sponsor badge only for promoted, unknown price is 'по запросу'", () => {
    const promoted = companies.find((c) => c.promoted);
    const regular = companies.find((c) => !c.promoted);
    assert.ok(promoted && regular);
    assert.ok(buildCompanyCard(promoted).badges.some((b) => b.label === "Спонсор"));
    assert.ok(!buildCompanyCard(regular).badges.some((b) => b.label === "Спонсор"));
    const noPrice = buildCompanyCard({ ...regular, priceFrom: undefined });
    assert.equal(noPrice.facts.find((f) => f.label === "Цена")!.value, "Цена по запросу");
    assert.equal(buildCompanyCard(regular).href, `/companies/${regular.slug}`);
  });

  it("product sample is explicitly demo with no invented data or links", () => {
    const p = buildProductSampleCard();
    assert.ok(p.badges.some((b) => b.tone === "demo" && b.label === "Демо-образец"));
    assert.equal(p.href, null);
    const values = p.facts.map((f) => f.value).join(" ");
    assert.match(values, /не указана/);
    assert.doesNotMatch(values, /\d/);
    assert.ok(!p.badges.some((b) => b.tone === "sponsor" || b.tone === "ad"));
  });

  it("ad sample is labelled as ad, has no link and is not organic", () => {
    const a = buildAdSampleCard();
    assert.equal(a.kind, "ad");
    assert.equal(a.kindLabel, "Реклама");
    assert.ok(a.badges.some((b) => b.tone === "ad" && b.label === "Реклама"));
    assert.equal(a.href, null);
    assert.equal(a.img, undefined);
    for (const o of [...solutions.map(buildTaskCard), ...companies.map(buildCompanyCard), buildProductSampleCard()]) {
      assert.ok(!o.badges.some((b) => b.tone === "ad"));
      assert.notEqual(o.kind, "ad");
    }
  });

  it("clampText shortens long text on a word boundary and keeps short text", () => {
    assert.equal(clampText("  коротко   и  ясно ", 50), "коротко и ясно");
    const out = clampText("слово ".repeat(60), 40);
    assert.ok(out.length <= 41 && out.endsWith("…"));
    assert.ok(!out.includes(" …"));
  });

  it("long-content sample really is long", () => {
    const l = buildLongContentSample();
    assert.ok(l.title.length > 100 && l.summary.length > 150);
  });
});
