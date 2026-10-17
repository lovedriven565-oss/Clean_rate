import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getAllSolutions,
  getIntentKeywords,
  getPriceEstimates,
  getSolutionBySlug,
  getSolutionSlugs,
} from "../lib/db/queries.js";
import { classifyIntent } from "../lib/search/intent-router.js";
import { buildSolutionFaq, buildSolutionJsonLd } from "../lib/solutions/structured-data.js";
import type { SolutionProblemType, SolutionSurface } from "../lib/types.js";

const STAGE4_PROTOCOLS: {
  slug: string;
  surface: SolutionSurface;
  problemType: SolutionProblemType;
  sampleKeyword: string;
}[] = [
  { slug: "flomaster-ruchka-na-divane", surface: "upholstery", problemType: "stain", sampleKeyword: "фломастер на диване" },
  { slug: "vosk-zhvachka-na-kovre", surface: "carpet", problemType: "stain", sampleKeyword: "жвачка на ковре" },
  { slug: "zapah-zhivotnyh-kover", surface: "carpet", problemType: "odor", sampleKeyword: "моча на ковре" },
  { slug: "chernaya-plesen-shvy-vannaya", surface: "bathroom", problemType: "scale", sampleKeyword: "плесень в ванной" },
  { slug: "nalet-chernaya-santehnika", surface: "bathroom", problemType: "scale", sampleKeyword: "черный смеситель" },
  { slug: "sledy-reziny-kleya-laminat", surface: "floor", problemType: "postrenovation", sampleKeyword: "клей на ламинате" },
];

describe("solutions graph and data layer", () => {
  it("loads 16 published solutions with complete protocol data", async () => {
    const solutions = await getAllSolutions();
    assert.equal(solutions.length, 16);

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

  it("includes all 6 new high-frequency SEO protocols with surfaces, products and BY/RU/KZ estimates", async () => {
    const keywords = await getIntentKeywords();

    for (const expected of STAGE4_PROTOCOLS) {
      const solution = await getSolutionBySlug(expected.slug);
      assert.ok(solution, `missing protocol ${expected.slug}`);
      assert.equal(solution.surface, expected.surface);
      assert.equal(solution.problemType, expected.problemType);
      assert.ok(
        solution.recommendedProducts?.some((p) => p.role === "recommended"),
        `${expected.slug} must have a primary recommended product`
      );
      assert.ok(
        solution.recommendedProducts?.some((p) => p.role === "alternative"),
        `${expected.slug} must have an alternative product`
      );

      const estimates = await getPriceEstimates({ solutionId: expected.slug });
      const countries = estimates.map((e) => e.countryCode).sort();
      assert.deepEqual(countries, ["BY", "KZ", "RU"], `${expected.slug} must have BY, RU, KZ estimates`);

      const classified = classifyIntent(expected.sampleKeyword, keywords);
      assert.equal(classified.target?.kind, "solution");
      assert.equal(classified.target?.slug, expected.slug);
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
    assert.equal(slugs.length, 16);
    assert.ok(slugs.includes("vino-na-divane"));
    assert.ok(slugs.includes("poslestroy-zatirka-plitka"));
    for (const { slug } of STAGE4_PROTOCOLS) {
      assert.ok(slugs.includes(slug), `slugs must include ${slug}`);
    }
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
    assert.ok(keywords.length >= 80, `expected >= 80 keywords, got ${keywords.length}`);

    const b2c = keywords.filter((k) => k.intent === "b2c");
    const b2b = keywords.filter((k) => k.intent === "b2b");
    const pro = keywords.filter((k) => k.intent === "pro");

    assert.ok(b2c.length >= 30, "expected >= 30 b2c keywords");
    assert.ok(b2b.length >= 15, "expected >= 15 b2b keywords");
    assert.ok(pro.length >= 15, "expected >= 15 pro keywords");
  });

  it("emits VideoObject in solution JSON-LD only when videoUrl is provided", async () => {
    const solution = await getSolutionBySlug("flomaster-ruchka-na-divane");
    assert.ok(solution);
    const faq = buildSolutionFaq(solution);
    const url = "https://example.test/solutions/flomaster-ruchka-na-divane";
    const breadcrumbs = [
      { name: "Главная", url: "https://example.test/" },
      { name: "Решения", url: "https://example.test/solutions" },
      { name: solution.title, url },
    ];

    const withoutVideo = buildSolutionJsonLd(solution, url, faq, breadcrumbs);
    assert.ok(!withoutVideo["@graph"].some((n) => n["@type"] === "VideoObject"));

    const withVideo = buildSolutionJsonLd(
      { ...solution, videoUrl: "https://www.youtube.com/shorts/dQw4w9WgXcQ" },
      url,
      faq,
      breadcrumbs
    );
    const videoNode = withVideo["@graph"].find((n) => n["@type"] === "VideoObject") as Record<string, unknown> | undefined;
    assert.ok(videoNode, "VideoObject node must be present when videoUrl is set");
    assert.equal(videoNode.embedUrl, "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  });
});
