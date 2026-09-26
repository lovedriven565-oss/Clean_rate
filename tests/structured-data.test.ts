import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getAllSolutions, getPriceEstimates, getSolutionBySlug } from "../lib/db/queries.js";
import { buildSolutionFaq, buildSolutionJsonLd, serializeJsonLd } from "../lib/solutions/structured-data.js";
import { relatedSolutions, solutionSummary } from "../lib/solutions/meta.js";

describe("solution structured data", () => {
  it("builds FAQ from protocol data including market price estimates", async () => {
    const solution = await getSolutionBySlug("vino-na-divane");
    assert.ok(solution);
    const estimates = await getPriceEstimates({ solutionId: solution.id });
    const faq = buildSolutionFaq(solution, estimates);

    assert.ok(faq.length >= 4);
    const price = faq.find((item) => item.question === "Сколько стоит вызвать мастера?");
    assert.ok(price, "price FAQ must exist when estimates present");
    assert.match(price.answer, /Минск/);
    assert.match(price.answer, /Москва/);
    assert.match(price.answer, /Алматы/);
  });

  it("emits a valid HowTo + FAQPage + BreadcrumbList graph", async () => {
    const solution = await getSolutionBySlug("vino-na-divane");
    assert.ok(solution);
    const faq = buildSolutionFaq(solution);
    const url = "https://example.test/solutions/vino-na-divane";
    const jsonLd = buildSolutionJsonLd(solution, url, faq, [
      { name: "Главная", url: "https://example.test/" },
      { name: "Решения", url: "https://example.test/solutions" },
      { name: solution.title, url },
    ]);

    assert.equal(jsonLd["@context"], "https://schema.org");
    const types = jsonLd["@graph"].map((node) => node["@type"]);
    assert.deepEqual(types, ["HowTo", "FAQPage", "BreadcrumbList"]);

    const howTo = jsonLd["@graph"][0] as { step: { position: number; text: string }[] };
    assert.equal(howTo.step.length, solution.diySteps.length);
    assert.equal(howTo.step[0].position, 1);

    const faqPage = jsonLd["@graph"][1] as { mainEntity: unknown[] };
    assert.equal(faqPage.mainEntity.length, faq.length);

    const serialized = serializeJsonLd(jsonLd);
    assert.ok(!serialized.includes("<"), "serialized JSON-LD must escape < for script injection safety");
    assert.doesNotThrow(() => JSON.parse(serialized));
  });

  it("ranks related solutions by surface, then problem type", async () => {
    const all = await getAllSolutions();
    const wine = all.find((s) => s.slug === "vino-na-divane")!;
    const related = relatedSolutions(wine, all, 3);

    assert.equal(related.length, 3);
    assert.ok(!related.some((s) => s.slug === wine.slug));
    assert.equal(related[0].surface, "upholstery", "same surface must come first");
  });

  it("produces a bounded summary without cutting words in half", async () => {
    const wine = await getSolutionBySlug("vino-na-divane");
    assert.ok(wine);
    const summary = solutionSummary(wine, 80);
    assert.ok(summary.length <= 81);
    assert.ok(summary.endsWith("…"));
  });
});
