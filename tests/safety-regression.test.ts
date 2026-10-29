import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { checkCampaignEligibility } from "../lib/ads/eligibility.js";
import { filterSafeProducts } from "../lib/assistant/engine.js";
import { getFallbackSolutions } from "../lib/db/fallback.js";
import { buildHumanSafetyBadge, surfaceVerdict } from "../lib/ph.js";
import type { Campaign, ProductSafetyProfile } from "../lib/types.js";

const solution = getFallbackSolutions().find((s) => s.slug === "vino-na-divane")!;
const product: ProductSafetyProfile = {
  id: "test-product",
  brandId: "test-brand",
  name: "Средство",
  ph: 7,
};
const campaign: Campaign = {
  id: "test-campaign",
  brandId: "test-brand",
  productId: product.id,
  name: "Тест",
  placement: "solution.sponsored_product",
  status: "active",
  targetSolutions: [solution.slug],
  currentImpressions: 0,
  currentClicks: 0,
  priority: 0,
  createdAt: new Date("2026-01-01"),
};

describe("неподтверждённая совместимость", () => {
  it("не считает нейтральный pH допуском для поверхности", () => {
    assert.equal(surfaceVerdict(product, solution.surface).verdict, "caution");
  });

  it("не показывает зелёный сигнал без паспорта продукта", () => {
    const badge = buildHumanSafetyBadge({ surface: solution.surface, solution });
    assert.equal(badge.verdict, "caution");
    assert.notEqual(badge.light, "green");
  });

  it("не считает запретом pH без указанной поверхности", () => {
    assert.equal(buildHumanSafetyBadge({ product: { ...product, ph: 1 } }).verdict, "caution");
  });

  it("не допускает рекламу только по таргетингу или нейтральному pH", () => {
    const result = checkCampaignEligibility({
      campaign,
      product,
      solution,
      context: { surface: solution.surface, solutionSlug: solution.slug },
    });
    assert.equal(result.eligible, false);
  });

  it("не помечает продукт консультанта проверенным без допуска для поверхности", () => {
    const protocol = {
      ...solution,
      recommendedProducts: [{ solutionId: solution.id, productId: product.id, role: "recommended" as const }],
    };
    const result = filterSafeProducts(protocol, new Map([[product.id, product]]));
    assert.ok(result.every((item) => !item.verified));
  });

  it("запрет производителя имеет приоритет над допуском", () => {
    const conflicting = { ...product, compatibleSurfaces: [solution.surface], prohibitedSurfaces: [solution.surface] };
    assert.equal(surfaceVerdict(conflicting, solution.surface).verdict, "forbidden");
  });

  it("допускает рекламу только с источником для конкретного материала и поверхности", () => {
    const verified = {
      ...product,
      compatibleSurfaces: [solution.surface],
      compatibleMaterials: [solution.material!],
      compatibilitySource: "fixture manufacturer documentation",
      compatibilityVerified: true,
    };
    assert.equal(checkCampaignEligibility({
      campaign,
      product: verified,
      solution,
      context: { surface: solution.surface, solutionSlug: solution.slug },
    }).eligible, true);
    assert.equal(checkCampaignEligibility({
      campaign,
      product: { ...verified, compatibleMaterials: ["другой материал"] },
      solution,
      context: { surface: solution.surface, solutionSlug: solution.slug },
    }).eligible, false);
    assert.equal(checkCampaignEligibility({
      campaign,
      product: { ...verified, compatibilityVerified: false },
      solution,
      context: { surface: solution.surface, solutionSlug: solution.slug },
    }).eligible, false);
    assert.equal(checkCampaignEligibility({
      campaign,
      product: verified,
      solution,
      context: { surface: "floor", solutionSlug: solution.slug },
    }).eligible, false);
  });

  it("учитывает запрет конкретного материала даже при разрешённой поверхности", () => {
    const restricted = {
      ...product,
      compatibleSurfaces: [solution.surface],
      compatibleMaterials: ["натуральная шерсть"],
      compatibilitySource: "fixture manufacturer documentation",
      compatibilityVerified: true,
      prohibitedSurfaces: ["wool"],
    };
    const woolSolution = { ...solution, material: "натуральная шерсть" };
    assert.equal(checkCampaignEligibility({
      campaign,
      product: restricted,
      solution: woolSolution,
      context: { surface: solution.surface, solutionSlug: solution.slug },
    }).eligible, false);
    const protocol = {
      ...woolSolution,
      recommendedProducts: [{ solutionId: solution.id, productId: product.id, role: "recommended" as const }],
    };
    assert.deepEqual(filterSafeProducts(protocol, new Map([[product.id, restricted]])), []);
  });
});
