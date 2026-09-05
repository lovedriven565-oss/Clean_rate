import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { classifyIntent, KeywordProvider } from "../lib/search/intent-router.js";
import { getIntentKeywords } from "../lib/db/queries.js";

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
});
