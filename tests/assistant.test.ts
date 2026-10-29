import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildAssistantHref,
  buildGroundedPrompt,
  buildProtocolAnswer,
  buildVerdict,
  consult,
  filterSafeProducts,
  parseAssistantTiming,
} from "../lib/assistant/engine.js";
import {
  getFallbackIntentKeywords,
  getFallbackPriceEstimates,
  getFallbackSolutions,
} from "../lib/db/fallback.js";
import type { ProductSafetyProfile, Solution } from "../lib/types.js";

const keywords = getFallbackIntentKeywords();
const solutions = getFallbackSolutions();
const estimates = getFallbackPriceEstimates();
const wine = solutions.find((s) => s.slug === "vino-na-divane");
if (!wine) throw new Error("seed solution missing");

const emptySafety = new Map<string, ProductSafetyProfile>();

describe("assistant consultant", () => {
  it("answers in protocol mode with full Two-Paths structure without AI bindings", async () => {
    const answer = await consult({
      env: null,
      query: "как вывести вино с дивана",
      solutions,
      keywords,
      safetyMap: emptySafety,
      estimates,
    });
    assert.equal(answer.mode, "protocol");
    assert.equal(answer.solution?.slug, "vino-na-divane");
    assert.match(answer.text, /вина на диване/i);
    assert.ok(answer.steps.length >= 3);
    assert.ok(answer.steps.some((s) => Boolean(s.tip)));
    assert.equal(answer.verdict.recommendation, "diy");
    assert.ok(answer.materialOptions.length > 0);
    assert.ok(answer.followUpQuestions.length > 0);
  });

  it("matches everyday chemical synonyms (juice -> wine tannin protocol, cocoa -> coffee protocol)", async () => {
    const juiceAnswer = await consult({
      env: null,
      query: "ребенок пролил гранатовый сок на велюровый диван",
      solutions,
      keywords,
      safetyMap: emptySafety,
    });
    assert.equal(juiceAnswer.solution?.slug, "vino-na-divane");

    const cocoaAnswer = await consult({
      env: null,
      query: "разлили какао с молоком на кресло",
      solutions,
      keywords,
      safetyMap: emptySafety,
    });
    assert.equal(cocoaAnswer.solution?.slug, "kofe-na-tekstile");
  });

  it("distinguishes general window washing ('как помыть окно') from post-renovation tape scraping", async () => {
    const windowWash = await consult({
      env: null,
      query: "как помыть окно",
      solutions,
      keywords,
      safetyMap: emptySafety,
      estimates,
    });
    assert.equal(windowWash.solution?.id, "guide-moika-okon-bez-razvodov");
    assert.match(windowWash.solution?.title ?? "", /без разводов/i);
    assert.match(windowWash.text, /склидж|водосгон/i);

    const postRenovationWindow = await consult({
      env: null,
      query: "чем оттереть скотч и грунтовку с окна после ремонта",
      solutions,
      keywords,
      safetyMap: emptySafety,
    });
    assert.equal(postRenovationWindow.solution?.id, "poslestroy-okna-skotch");

    const fridge = await consult({
      env: null,
      query: "запах в холодильнике чем помыть",
      solutions,
      keywords,
      safetyMap: emptySafety,
    });
    assert.equal(fridge.solution?.id, "guide-zapah-i-moika-holodilnika");
    assert.match(fridge.text, /дренаж/i);

    const oven = await consult({
      env: null,
      query: "как отмыть духовку от нагара",
      solutions,
      keywords,
      safetyMap: emptySafety,
    });
    assert.equal(oven.solution?.id, "guide-chistka-duhovki-mikrovolnovki");
  });

  it("honestly reports a gap and offers fallback protocols when nothing matches", async () => {
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
    assert.ok(answer.alternatives.length > 0);
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
      estimates,
    });
    assert.equal(answer.mode, "answer");
    assert.match(answer.text, /пятновывод/);
    assert.ok(answer.steps.length > 0);
  });

  it("generates a full bespoke protocol via Cloudflare LLM when query is outside the static database", async () => {
    const ai = {
      async run(_model: string, input: { messages?: Array<{ content: string }> }) {
        const system = input.messages?.[0]?.content ?? "";
        if (system.includes("классификатор")) {
          return { response: "NONE" };
        }
        return {
          response: JSON.stringify({
            isCleaningTopic: true,
            title: "Мойка натяжного потолка без разводов",
            surface: "other",
            material: "ПВХ-плёнка натяжного потолка",
            problemType: "general",
            relatedCategory: "apartments",
            recommendation: "diy",
            badge: "Можно помыть дома мягкой микрофиброй",
            summary: "Главное — не давить на полотно и не использовать абразивы и ацетон.",
            text: "Натяжной потолок из ПВХ моют мягкой фланелью со спиртовым раствором без нажима.",
            steps: [
              { order: 1, instruction: "Снимите кольца и украшения с рук, чтобы не проколоть полотно.", tip: "Двигайтесь вдоль сварного шва." },
              { order: 2, instruction: "Нанесите нейтральный мыльный или спиртовой спрей на микрофибру и протрите без давления." },
            ],
            warnings: ["Не используйте ацетон, соду и жёсткие щётки — ПВХ-плёнка расползётся или помутнеет."],
            whenToCallPro: "Потолок выше 3,5 метров или сильный жировой нагар по всей площади кухни.",
            diyCostNote: "5 – 15 BYN",
            proTimeNote: "1 – 2 часа",
          }),
        };
      },
    } as unknown as Ai;

    const answer = await consult({
      env: { AI: ai },
      query: "как почистить замшевые кроссовки от дорожной соли",
      solutions,
      keywords,
      safetyMap: emptySafety,
      estimates,
    });
    assert.equal(answer.mode, "answer");
    assert.equal(answer.solution?.isCustom, true);
    assert.equal(answer.solution?.title, "Мойка натяжного потолка без разводов");
    assert.equal(answer.steps.length, 2);
    assert.match(answer.steps[0].tip ?? "", /сварного шва/);
    assert.equal(answer.warnings.length, 2);
    assert.match(answer.warnings[0], /не проверен специалистом/);
    assert.equal(answer.verdict.recommendation, "caution");
    assert.equal(answer.solution?.diyCostNote, undefined);
  });

  it("adapts verdict and warnings when user selects triage context (washed, dried, delicate material)", async () => {
    const washedAnswer = await consult({
      env: null,
      query: "вино на диване",
      context: { timing: "washed", material: "Велюр или флок" },
      solutions,
      keywords,
      safetyMap: emptySafety,
    });
    assert.equal(washedAnswer.verdict.recommendation, "pro");
    assert.ok(washedAnswer.warnings.some((w) => /замывали/i.test(w)));
    assert.ok(washedAnswer.warnings.some((w) => /Велюр или флок/i.test(w)));

    const driedVerdict = buildVerdict(wine, { timing: "dried" });
    assert.equal(driedVerdict.recommendation, "caution");
  });

  it("respects explicit solutionSlug when user switches protocol in 1 click", async () => {
    const switched = await consult({
      env: null,
      query: "пятно на диване",
      context: { solutionSlug: "flomaster-ruchka-na-divane" },
      solutions,
      keywords,
      safetyMap: emptySafety,
    });
    assert.equal(switched.solution?.slug, "flomaster-ruchka-na-divane");
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
      compatibleMaterials: ["мраморная плитка"],
      compatibilitySource: "fixture manufacturer documentation",
      compatibilityVerified: true,
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

  it("grounded prompt carries protocol facts, step tips, triage context and the no-invention rule", () => {
    const prompt = buildGroundedPrompt(
      "вино на диване",
      wine,
      [{ id: "sp-1", brandName: "Kiehl", role: "recommended", note: "Arenas-exet 3", ph: 6, verified: true }],
      { timing: "washed", material: "Велюр или флок" },
      "60–110 BYN за посадочное место"
    );
    assert.match(prompt, /Пятно красного вина/);
    assert.match(prompt, /Запрещено выдумывать/);
    assert.match(prompt, /Arenas-exet 3/);
    assert.match(prompt, /pH 6/);
    assert.match(prompt, /Важный нюанс:/);
    assert.match(prompt, /Велюр или флок/);
    assert.match(prompt, /60–110 BYN/);
  });

  it("protocol answer includes steps with tips, warnings and pro fallback", () => {
    const text = buildProtocolAnswer("вино", wine, []);
    assert.match(text, /Шаги по протоколу:/);
    assert.match(text, /Совет технолога:/);
    assert.match(text, /Если не поможет:/);
  });

  it("parses timing query param and builds express triage links for SmartSearch", () => {
    assert.equal(parseAssistantTiming("fresh"), "fresh");
    assert.equal(parseAssistantTiming("dried"), "dried");
    assert.equal(parseAssistantTiming("washed"), "washed");
    assert.equal(parseAssistantTiming("invalid"), undefined);
    assert.equal(parseAssistantTiming(null), undefined);

    assert.equal(buildAssistantHref(""), "/assistant");
    assert.equal(buildAssistantHref("вино на диване"), "/assistant?q=%D0%B2%D0%B8%D0%BD%D0%BE+%D0%BD%D0%B0+%D0%B4%D0%B8%D0%B2%D0%B0%D0%BD%D0%B5");
    assert.equal(
      buildAssistantHref("вино на диване", "washed"),
      "/assistant?q=%D0%B2%D0%B8%D0%BD%D0%BE+%D0%BD%D0%B0+%D0%B4%D0%B8%D0%B2%D0%B0%D0%BD%D0%B5&timing=washed"
    );
  });
});
