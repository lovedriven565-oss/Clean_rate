import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { classifyIntent, KeywordProvider, stemRussian } from "../lib/search/intent-router.js";
import { rankSolutionsByTokens } from "../lib/search/rank.js";
import { getAllSolutions, getIntentKeywords } from "../lib/db/queries.js";

describe("intent router", () => {
  it("classifies a stain query as b2c and targets the matching solution", async () => {
    const keywords = await getIntentKeywords();
    const result = classifyIntent("срочно! вино на диване, помогите", keywords);
    assert.equal(result.intent, "b2c");
    assert.ok(result.target);
    assert.equal(result.target?.kind, "solution");
    assert.equal(result.target?.slug, "vino-na-divane");
    assert.ok(result.confidence > 0);
  });

  it("classifies an office query as b2b", async () => {
    const keywords = await getIntentKeywords();
    const result = classifyIntent("нужна уборка офиса 500 м²", keywords);
    assert.equal(result.intent, "b2b");
    assert.equal(result.target?.kind, "category");
    assert.equal(result.target?.slug, "offices");
  });

  it("classifies a brand name query as pro", async () => {
    const keywords = await getIntentKeywords();
    const result = classifyIntent("химия Kiehl", keywords);
    assert.equal(result.intent, "pro");
    assert.equal(result.target?.kind, "brand");
    assert.equal(result.target?.slug, "kiehl");
  });

  it("returns b2c default with zero confidence for an unmatched query", async () => {
    const keywords = await getIntentKeywords();
    const result = classifyIntent("совершенно случайный запрос xyz", keywords);
    assert.equal(result.intent, "b2c");
    assert.equal(result.target, null);
    assert.equal(result.confidence, 0);
  });

  it("returns the default classification for an empty query", async () => {
    const keywords = await getIntentKeywords();
    const result = classifyIntent("   ", keywords);
    assert.equal(result.intent, "b2c");
    assert.equal(result.confidence, 0);
  });

  it("KeywordProvider adapter delegates to classifyIntent", async () => {
    const keywords = await getIntentKeywords();
    const provider = new KeywordProvider(keywords);
    const result = provider.classify("керхер для экстракции");
    assert.equal(result.intent, "pro");
  });

  it("handles Russian morphological cases and fleeting vowels across queries", async () => {
    const [keywords, solutions] = await Promise.all([getIntentKeywords(), getAllSolutions()]);

    // Стеммер приводит падежные формы и беглые гласные к единой основе
    assert.equal(stemRussian("вина"), stemRussian("вино"));
    assert.equal(stemRussian("матраса"), stemRussian("матрас"));
    assert.equal(stemRussian("ковёр"), stemRussian("ковре"));
    assert.equal(stemRussian("ремонтов"), stemRussian("ремонта"));

    // «пятно от вина» / «пролил вина на диван» -> vino-na-divane
    const wineCase = classifyIntent("чем вывести пятна от вина с дивана", keywords);
    assert.equal(wineCase.target?.kind, "solution");
    assert.equal(wineCase.target?.slug, "vino-na-divane");

    // «почистить матраса» -> категория upholstery + решения для матраса в токен-ранкере
    const mattressCase = classifyIntent("почистить матраса", keywords);
    assert.equal(mattressCase.target?.slug, "upholstery");
    const mattressRanked = rankSolutionsByTokens(solutions, "почистить матраса");
    assert.ok(mattressRanked.some((s) => s.surface === "mattress"));

    // «запах на ковре» / «запахи с ковра» -> zapah-zhivotnyh-kover
    const carpetCase = classifyIntent("запах на ковре", keywords);
    assert.equal(carpetCase.target?.kind, "solution");
    assert.equal(carpetCase.target?.slug, "zapah-zhivotnyh-kover");
    const carpetGenitive = classifyIntent("убрать запахи с ковра", keywords);
    assert.equal(carpetGenitive.target?.slug, "zapah-zhivotnyh-kover");

    // «после ремонтов» -> post-renovation
    const renovationCase = classifyIntent("после ремонтов", keywords);
    assert.equal(renovationCase.target?.slug, "post-renovation");
  });
});
