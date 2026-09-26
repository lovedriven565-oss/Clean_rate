import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BRAND_SCORE_WEIGHTS,
  computeAdoptionScore,
  computeBrandScore,
  computeInterestScore,
  prosChoiceIds,
  rankBrands,
} from "../lib/brand-score";
import type { Brand, BrandScore } from "../lib/types";

function brand(id: string, focus: Brand["focus"], name = id): Brand {
  return { id, slug: id, name, tagline: "", accent: "#000", focus, description: "", affiliateUrl: "#" };
}

function score(brandId: string, partial: Partial<Omit<BrandScore, "brandId" | "score">>): BrandScore {
  return computeBrandScore({ brandId, verifiedCompanyCount: 0, recommendedCount: 0, alternativeCount: 0, clickCount: 0, ...partial });
}

describe("brand-score", () => {
  it("считает индекс по публичным весам", () => {
    const s = score("a", { verifiedCompanyCount: 2, recommendedCount: 3, alternativeCount: 1, clickCount: 5 });
    const expected =
      2 * BRAND_SCORE_WEIGHTS.verifiedCompany +
      3 * BRAND_SCORE_WEIGHTS.recommended +
      1 * BRAND_SCORE_WEIGHTS.alternative +
      5 * BRAND_SCORE_WEIGHTS.click;
    assert.equal(s.score, expected);
  });

  it("разделяет долю реального использования (adoption) и интерес аудитории (interest)", () => {
    const input = { brandId: "a", verifiedCompanyCount: 2, recommendedCount: 3, alternativeCount: 1, clickCount: 10 };
    const adoption = computeAdoptionScore(input);
    const interest = computeInterestScore(input);
    assert.equal(adoption, 2 * 3 + 3 * 2 + 1 * 1); // 13
    assert.equal(interest, 10);
    const s = computeBrandScore(input);
    assert.equal(s.adoptionScore, 13);
    assert.equal(s.interestScore, 10);
  });

  it("верифицированная компания весит больше упоминания в протоколе", () => {
    assert.ok(BRAND_SCORE_WEIGHTS.verifiedCompany > BRAND_SCORE_WEIGHTS.recommended);
    assert.ok(BRAND_SCORE_WEIGHTS.recommended > BRAND_SCORE_WEIGHTS.alternative);
  });

  it("сортирует по индексу, при равенстве — по компаниям, затем по имени", () => {
    const brands = [brand("c", "himiya", "Гамма"), brand("a", "himiya", "Альфа"), brand("b", "technika", "Бета")];
    const scores = new Map([
      ["a", score("a", { recommendedCount: 1 })],
      ["b", score("b", { verifiedCompanyCount: 1 })],
      ["c", score("c", { recommendedCount: 1 })],
    ]);
    const ranked = rankBrands(brands, scores).map((b) => b.id);
    assert.deepEqual(ranked, ["b", "a", "c"]);
  });

  it("бренд без метрик получает нулевой индекс и уходит вниз", () => {
    const ranked = rankBrands([brand("x", "himiya"), brand("y", "himiya")], new Map([["y", score("y", { clickCount: 1 })]]));
    assert.equal(ranked[0].id, "y");
    assert.equal(ranked[1].metrics.score, 0);
  });

  it("«Выбор профессионалов» — лидер каждого фокуса с ненулевым индексом", () => {
    const brands = [brand("h1", "himiya"), brand("h2", "himiya"), brand("t1", "technika"), brand("i1", "inventory")];
    const scores = new Map([
      ["h1", score("h1", { verifiedCompanyCount: 3 })],
      ["h2", score("h2", { verifiedCompanyCount: 1 })],
      ["t1", score("t1", { recommendedCount: 1 })],
    ]);
    const winners = prosChoiceIds(rankBrands(brands, scores));
    assert.deepEqual([...winners].sort(), ["h1", "t1"]);
  });
});
