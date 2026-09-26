import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { KeywordProvider } from "../lib/search/intent-router.js";
import {
  SEMANTIC_THRESHOLD,
  SemanticProvider,
  solutionEmbeddingText,
  upsertSolutionVectors,
} from "../lib/search/semantic.js";
import { getFallbackIntentKeywords } from "../lib/db/fallback.js";

const keywords = getFallbackIntentKeywords();

function fakeAi(): Ai {
  return {
    async run(_model: string, input: { text: string[] }) {
      return { data: input.text.map(() => [0.1, 0.2, 0.3]) };
    },
  } as unknown as Ai;
}

function fakeVectorize(
  matches: Array<{ id: string; score: number; metadata?: Record<string, unknown> }>
): VectorizeIndex {
  return {
    async query() {
      return { matches, count: matches.length };
    },
  } as unknown as VectorizeIndex;
}

function provider(matches: Array<{ id: string; score: number; metadata?: Record<string, unknown> }>) {
  return new SemanticProvider(
    { AI: fakeAi(), VECTORIZE: fakeVectorize(matches) },
    new KeywordProvider(keywords)
  );
}

describe("semantic search provider", () => {
  it("maps a confident vector match to a solution target", async () => {
    const p = provider([
      {
        id: "vino-na-divane",
        score: SEMANTIC_THRESHOLD + 0.1,
        metadata: { slug: "vino-na-divane", intent: "b2c", surface: "upholstery" },
      },
    ]);
    const result = await p.classify("чем оттереть красное вино с обивки");
    assert.equal(result.target?.kind, "solution");
    assert.equal(result.target?.slug, "vino-na-divane");
    assert.equal(result.intent, "b2c");
    assert.ok(result.confidence >= SEMANTIC_THRESHOLD);
  });

  it("falls back to keywords below the confidence threshold", async () => {
    const p = provider([
      { id: "any", score: 0.2, metadata: { slug: "any", intent: "b2c", surface: "x" } },
    ]);
    const result = await p.classify("вино на диване");
    assert.equal(result.target?.slug, "vino-na-divane");
    assert.equal(result.matchedKeyword?.startsWith("~"), false);
  });

  it("falls back to keywords when the AI call fails", async () => {
    const brokenAi = {
      async run() {
        throw new Error("ai unavailable");
      },
    } as unknown as Ai;
    const p = new SemanticProvider(
      { AI: brokenAi, VECTORIZE: fakeVectorize([]) },
      new KeywordProvider(keywords)
    );
    const result = await p.classify("вино на диване");
    assert.equal(result.target?.slug, "vino-na-divane");
  });

  it("uses the keyword provider directly when bindings are absent", async () => {
    const p = new SemanticProvider({}, new KeywordProvider(keywords));
    const result = await p.classify("офис 500 м²");
    assert.equal(result.intent, "b2b");
  });

  it("builds embedding text with the human-readable surface label", () => {
    const text = solutionEmbeddingText({
      title: "Вино на диване",
      surface: "upholstery",
      problemType: "stain",
      searchKeywords: ["вино на диване", "красное вино"],
    });
    assert.match(text, /Вино на диване/);
    assert.match(text, /красное вино/);
    assert.doesNotMatch(text, /upholstery/);
  });

  it("upserts vectors with slug and intent metadata", async () => {
    const inserted: Array<{ id: string; values: number[]; metadata: Record<string, unknown> }> = [];
    const vectorize = {
      async upsert(items: typeof inserted) {
        inserted.push(...items);
        return { ids: items.map((i) => i.id), count: items.length };
      },
    } as unknown as VectorizeIndex;
    const count = await upsertSolutionVectors({ AI: fakeAi(), VECTORIZE: vectorize }, [
      {
        id: "s1",
        slug: "vino-na-divane",
        title: "Вино на диване",
        surface: "upholstery",
        problemType: "stain",
        audience: "both",
        searchKeywords: ["вино"],
      },
      {
        id: "s2",
        slug: "office-dust",
        title: "Пыль в офисе",
        surface: "other",
        problemType: "dust",
        audience: "b2b",
        searchKeywords: ["уборка офиса"],
      },
    ]);
    assert.equal(count, 2);
    assert.equal(inserted[0].metadata.slug, "vino-na-divane");
    assert.equal(inserted[0].metadata.intent, "b2c");
    assert.equal(inserted[1].metadata.intent, "b2b");
  });
});
