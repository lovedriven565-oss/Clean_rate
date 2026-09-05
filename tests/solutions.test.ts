import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getAllSolutions,
  getIntentKeywords,
  getPriceEstimates,
  getSolutionBySlug,
  getSolutionSlugs,
} from "../lib/db/queries.js";

describe("solutions graph and data layer", () => {
  it("loads 10 published solutions with complete protocol data", async () => {
    const solutions = await getAllSolutions();
    assert.equal(solutions.length, 10);

    for (const sol of solutions) {
      assert.ok(sol.id, "solution must have an id");
      assert.ok(sol.slug, "solution must have a slug");
      assert.ok(sol.title, "solution must have a title");
      assert.ok(sol.diySteps.length >= 3, `solution ${sol.slug} must have >= 3 diySteps`);
      assert.ok(sol.warnings.length >= 1, `solution ${sol.slug} must have warnings`);
      assert.ok(sol.whenToCallPro.length > 20, `solution ${sol.slug} must have whenToCallPro description`);
      assert.ok(sol.searchKeywords.length >= 3, `solution ${sol.slug} must have searchKeywords`);
      assert.ok(sol.recommendedProducts && sol.recommendedProducts.length > 0, `solution ${sol.slug} must have recommended products`);
    }
  });

  it("finds a specific solution by slug with resolved brand recommendations", async () => {
    const solution = await getSolutionBySlug("vino-na-divane");
    assert.ok(solution);
    assert.equal(solution.problemType, "stain");
    assert.equal(solution.surface, "upholstery");
    assert.equal(solution.relatedCategory, "upholstery");
    assert.ok(solution.recommendedProducts?.some((p) => p.brandId === "kiehl"));
  });

  it("returns unique solution slugs for SSG generateStaticParams", async () => {
    const slugs = await getSolutionSlugs();
    assert.equal(slugs.length, 10);
    assert.ok(slugs.includes("vino-na-divane"));
    assert.ok(slugs.includes("poslestroy-zatirka-plitka"));
  });

  it("returns regional price estimates for BY, RU and KZ", async () => {
    const byEstimates = await getPriceEstimates({ solutionId: "vino-na-divane", countryCode: "BY" });
    const ruEstimates = await getPriceEstimates({ solutionId: "vino-na-divane", countryCode: "RU" });
    const kzEstimates = await getPriceEstimates({ solutionId: "vino-na-divane", countryCode: "KZ" });

    assert.equal(byEstimates.length, 1);
    assert.equal(byEstimates[0].currency, "BYN");
    assert.equal(ruEstimates.length, 1);
    assert.equal(ruEstimates[0].currency, "RUB");
    assert.equal(kzEstimates.length, 1);
    assert.equal(kzEstimates[0].currency, "KZT");
  });

  it("returns classified intent keywords covering b2c, b2b and pro", async () => {
    const keywords = await getIntentKeywords();
    assert.ok(keywords.length >= 60, `expected >= 60 keywords, got ${keywords.length}`);

    const b2c = keywords.filter((k) => k.intent === "b2c");
    const b2b = keywords.filter((k) => k.intent === "b2b");
    const pro = keywords.filter((k) => k.intent === "pro");

    assert.ok(b2c.length >= 20, "expected >= 20 b2c keywords");
    assert.ok(b2b.length >= 15, "expected >= 15 b2b keywords");
    assert.ok(pro.length >= 15, "expected >= 15 pro keywords");
  });
});
