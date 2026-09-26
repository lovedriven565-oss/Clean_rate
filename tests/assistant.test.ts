import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildGroundedPrompt,
  buildProtocolAnswer,
  consult,
  filterSafeProducts,
} from "../lib/assistant/engine.js";
import { getFallbackIntentKeywords, getFallbackSolutions } from "../lib/db/fallback.js";
import type { ProductSafetyProfile, Solution } from "../lib/types.js";

const keywords = getFallbackIntentKeywords();
const solutions = getFallbackSolutions();
const wine = solutions.find((s) => s.slug === "vino-na-divane");
if (!wine) throw new Error("seed solution missing");

const emptySafety = new Map<string, ProductSafetyProfile>();

describe("assistant consultant", () => {
  it("answers in protocol mode without AI bindings", async () => {
    const answer = await consult({
      env: null,
      query: "как вывести вино с дивана",
      solutions,
      keywords,
      safetyMap: emptySafety,
    });
    assert.equal(answer.mode, "protocol");
    assert.equal(answer.solution?.slug, "vino-na-divane");
    assert.match(answer.text, /вина на диване/i);
    assert.equal(answer.imageUsed, false);
  });

  it("honestly reports a gap when nothing is found", async () => {
    const answer = await consult({
      env: null,
      query: "xyzzy бессмысленный запрос 42",
      solutions,
      keywords,
      safetyMap: emptySafety,
    });
    assert.equal(answer.mode, "empty");
    assert.match(answer.text, /протокол/i);
    assert.equal(answer.products.length, 0);
  });

  it("summarizes through the LLM layer when AI is bound", async () => {
    const ai = {
      async run(model: string) {
        if (model.includes("bge")) return { data: [[0.1]] };
        return { response: "Нанесите пятновыводитель, промокните, промойте водой." };
      },
    } as unknown as Ai;
    const answer = await consult({
      env: { AI: ai },
      query: "вино на диване",
      solutions,
      keywords,
      safetyMap: emptySafety,
    });
    assert.equal(answer.mode, "answer");
    assert.match(answer.text, /пятновывод/);
  });

  it("marks the answer as image-enriched when vision described a photo", async () => {
    const answer = await consult({
      env: null,
      query: "пятно",
      imageDescription: "серое пятно на ковре",
      solutions,
      keywords,
      safetyMap: emptySafety,
    });
    assert.equal(answer.imageUsed, true);
  });

  it("drops products that fail the safety gate, keeps verified ones", () => {
    const acidOnMarble: ProductSafetyProfile = {
      id: "p-acid",
      name: "Кислотный очиститель",
      ph: 2,
      compatibleSurfaces: ["tile"],
    };
    const neutral: ProductSafetyProfile = {
      id: "p-neutral",
      name: "Нейтральное средство",
      ph: 7,
      compatibleSurfaces: ["floor"],
    };
    const marbleSolution: Solution = {
      ...wine,
      surface: "floor",
      material: "мраморная плитка",
      recommendedProducts: [
        { id: "sp-a", solutionId: "s", brandId: "b1", productId: "p-acid", role: "recommended" },
        { id: "sp-b", solutionId: "s", brandId: "b2", productId: "p-neutral", role: "recommended", note: "ok" },
        { id: "sp-c", solutionId: "s", brandId: "kiehl", brandName: "Kiehl", role: "alternative", note: "editorial" },
      ],
    };
    const safetyMap = new Map<string, ProductSafetyProfile>([
      ["p-acid", acidOnMarble],
      ["p-neutral", neutral],
    ]);
    const result = filterSafeProducts(marbleSolution, safetyMap);
    assert.deepEqual(
      result.map((p) => p.id),
      ["sp-b", "sp-c"]
    );
    assert.equal(result[0].verified, true);
    assert.equal(result[0].ph, 7);
    assert.equal(result[1].verified, false);
  });

  it("grounded prompt carries protocol facts and the no-invention rule", () => {
    const prompt = buildGroundedPrompt("вино на диване", wine, [
      { id: "sp-1", brandName: "Kiehl", role: "recommended", note: "Arenas-exet 3", ph: 6, verified: true },
    ]);
    assert.match(prompt, /Пятно красного вина/);
    assert.match(prompt, /Запрещено выдумывать/);
    assert.match(prompt, /Arenas-exet 3/);
    assert.match(prompt, /pH 6/);
  });

  it("protocol answer includes steps, warnings and pro fallback", () => {
    const text = buildProtocolAnswer("вино", wine, []);
    assert.match(text, /Шаги:/);
    assert.match(text, /Если не поможет:/);
  });
});
