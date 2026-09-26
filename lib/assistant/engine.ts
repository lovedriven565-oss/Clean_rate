/**
 * AI-консультант CLEANHUB.
 *
 * Архитектурный инвариант: модель НЕ генерирует советы свободно — она
 * формулирует ответ строго по фактам найденных проверенных протоколов.
 * Если протокола нет, ответ честно сообщает об этом. Продукты с productId
 * дополнительно проходят гейт безопасности (pH/поверхности), как и реклама.
 *
 * Без AI-биндинга endpoint работает в детерминированном режиме:
 * отдаёт структурированный ответ, собранный из данных протокола.
 */

import { checkProductSafety } from "@/lib/ads/eligibility";
import { SURFACE_LABELS } from "@/lib/solutions/meta";
import { mergeRanked, rankSolutions, rankSolutionsByTokens } from "@/lib/search/rank";
import { EMBEDDING_MODEL, SEMANTIC_THRESHOLD, type SemanticEnv } from "@/lib/search/semantic";
import type {
  IntentKeyword,
  ProductSafetyProfile,
  Solution,
  SolutionProduct,
} from "@/lib/types";
import { classifyIntent } from "@/lib/search/intent-router";

/** LLM только переформулирует факты протокола — модель с приемлемым русским. */
export const ANSWER_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
/** Модель описания фото поверхности/пятна. Фото не сохраняется — только в памяти запроса. */
export const VISION_MODEL = "@cf/meta/llama-3.2-11b-vision-instruct";

export interface AssistantProduct {
  id?: string;
  brandId?: string;
  brandName?: string;
  productId?: string;
  role: "recommended" | "alternative";
  note?: string;
  ph?: number;
  /** true — состав прошёл гейт безопасности по паспорту продукта. */
  verified: boolean;
}

export interface AssistantAnswer {
  /** answer — LLM-сформулированный текст; protocol — детерминированная выжимка; empty — нет данных. */
  mode: "answer" | "protocol" | "empty";
  text: string;
  solution?: { slug: string; title: string };
  products: AssistantProduct[];
  warnings: string[];
  confidence: number;
  /** true — запрос обогащён описанием фото от vision-модели. */
  imageUsed: boolean;
}

const RETRIEVAL_TOP_K = 3;

/**
 * Находит релевантные протоколы: векторный поиск при биндингах,
 * иначе — классификация по словарю + текстовое совпадение.
 */
export async function retrieveSolutions(
  env: SemanticEnv | null,
  query: string,
  solutions: Solution[],
  keywords: IntentKeyword[]
): Promise<{ solutions: Solution[]; confidence: number }> {
  if (env?.AI && env?.VECTORIZE) {
    try {
      const result = await env.AI.run(EMBEDDING_MODEL, { text: [query] });
      const data = (result as { data?: number[][] }).data;
      if (data?.[0]) {
        const found = await env.VECTORIZE.query(data[0], { topK: RETRIEVAL_TOP_K });
        const byId = new Map(solutions.map((s) => [s.id, s]));
        const ranked = found.matches
          .filter((m) => m.score >= SEMANTIC_THRESHOLD)
          .map((m) => ({ solution: byId.get(m.id), score: m.score }))
          .filter((m): m is { solution: Solution; score: number } => Boolean(m.solution));
        if (ranked.length > 0) {
          return {
            solutions: ranked.map((m) => m.solution),
            confidence: ranked[0].score,
          };
        }
      }
    } catch (err) {
      console.error("[assistant:retrieve_error]", err);
    }
  }

  const classification = classifyIntent(query, keywords);
  const normalized = query.trim().toLowerCase();
  // Целевой протокол классификатора + токен-ранкер для естественных формулировок.
  const ranked = mergeRanked(
    rankSolutions(solutions, normalized, classification.target),
    rankSolutionsByTokens(solutions, normalized)
  );
  return { solutions: ranked.slice(0, RETRIEVAL_TOP_K), confidence: classification.confidence };
}

/**
 * Продукты протокола, прошедшие гейт: item с productId обязан пройти
 * checkProductSafety; brandId-only строки — редакционные из проверенного
 * протокола, помечаются verified=false (нет паспорта для проверки pH).
 */
export function filterSafeProducts(
  solution: Solution,
  safetyMap: Map<string, ProductSafetyProfile>
): AssistantProduct[] {
  return (solution.recommendedProducts ?? []).flatMap((sp: SolutionProduct): AssistantProduct[] => {
    const profile = sp.productId ? safetyMap.get(sp.productId) : undefined;
    if (sp.productId) {
      if (!profile) return [];
      const check = checkProductSafety({ product: profile, surface: solution.surface, solution });
      if (!check.safe) return [];
      return [
        {
          id: sp.id,
          brandId: sp.brandId,
          brandName: sp.brandName,
          productId: sp.productId,
          role: sp.role,
          note: sp.note,
          ph: profile.ph,
          verified: true,
        },
      ];
    }
    return [
      {
        id: sp.id,
        brandId: sp.brandId,
        brandName: sp.brandName,
        role: sp.role,
        note: sp.note,
        verified: false,
      },
    ];
  });
}

/** Детерминированная выжимка протокола — ответ без LLM (dev, сбой AI). */
export function buildProtocolAnswer(
  query: string,
  solution: Solution,
  products: AssistantProduct[]
): string {
  const steps = solution.diySteps
    .slice(0, 6)
    .map((s) => `${s.order}. ${s.instruction}`)
    .join("\n");
  const productNotes = products
    .map((p) => (p.note ?? p.brandName ?? ""))
    .filter(Boolean)
    .slice(0, 3);
  const parts = [
    `По вопросу «${query}» есть проверенный протокол «${solution.title}».`,
    "Шаги:",
    steps,
  ];
  if (solution.warnings.length > 0) {
    parts.push(`Осторожно: ${solution.warnings.join(" ")}`);
  }
  if (productNotes.length > 0) {
    parts.push(`Средства из протокола: ${productNotes.join("; ")}.`);
  }
  parts.push(`Если не поможет: ${solution.whenToCallPro}`);
  return parts.filter(Boolean).join("\n");
}

/** Промпт суммаризации: только факты протокола, явный запрет выдумывать. */
export function buildGroundedPrompt(
  query: string,
  solution: Solution,
  products: AssistantProduct[]
): string {
  const surfaceLabel =
    (SURFACE_LABELS as Record<string, string>)[solution.surface] ?? solution.surface;
  const steps = solution.diySteps.map((s) => `${s.order}. ${s.instruction}`).join("\n");
  const productLines = products
    .map((p) => `- ${[p.brandName, p.note].filter(Boolean).join(": ")}${p.ph !== undefined ? ` (pH ${p.ph})` : ""}`)
    .join("\n");
  return [
    "Ты — консультант CLEANHUB по чистке. Отвечай кратко и по делу, только на основе протокола ниже.",
    "Запрещено выдумывать средства, концентрации, шаги и совместимость. Если данных не хватает — скажи прямо и посоветуй обратиться к мастеру.",
    "",
    `ПРОТОКОЛ: ${solution.title}`,
    `Поверхность: ${surfaceLabel}${solution.material ? `, материал: ${solution.material}` : ""}`,
    `Шаги:\n${steps}`,
    solution.warnings.length ? `Предупреждения: ${solution.warnings.join(" ")}` : "",
    productLines ? `Проверенные средства:\n${productLines}` : "",
    `Когда вызвать мастера: ${solution.whenToCallPro}`,
    "",
    `ВОПРОС: ${query}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/** Описание фото vision-моделью: только текст, изображение не сохраняется. */
export async function describeImage(ai: Ai, imageBase64: string): Promise<string | null> {
  try {
    const imageBytes = Uint8Array.from(atob(imageBase64), (c) => c.charCodeAt(0));
    const result = await ai.run(VISION_MODEL, {
      prompt:
        "Опиши кратко по-русски: что за поверхность/материал и какое загрязнение видно. Только факты, без советов.",
      image: [...imageBytes],
    });
    const text = (result as { description?: string; response?: string }).description ??
      (result as { response?: string }).response;
    return text?.trim() || null;
  } catch (err) {
    console.error("[assistant:vision_error]", err);
    return null;
  }
}

export async function consult(params: {
  env: SemanticEnv | null;
  query: string;
  imageDescription?: string | null;
  solutions: Solution[];
  keywords: IntentKeyword[];
  safetyMap: Map<string, ProductSafetyProfile>;
}): Promise<AssistantAnswer> {
  const { env, solutions, keywords, safetyMap } = params;
  const query = [params.query, params.imageDescription].filter(Boolean).join(". ");

  const { solutions: retrieved, confidence } = await retrieveSolutions(env, query, solutions, keywords);
  const primary = retrieved[0];

  if (!primary) {
    return {
      mode: "empty",
      text: "Проверенного протокола под этот запрос пока нет. Опишите поверхность и тип загрязнения точнее — или вызовите мастера из рейтинга.",
      products: [],
      warnings: [],
      confidence,
      imageUsed: Boolean(params.imageDescription),
    };
  }

  const products = filterSafeProducts(primary, safetyMap);
  const base: Omit<AssistantAnswer, "mode" | "text"> = {
    solution: { slug: primary.slug, title: primary.title },
    products,
    warnings: primary.warnings,
    confidence,
    imageUsed: Boolean(params.imageDescription),
  };

  if (env?.AI) {
    try {
      const result = await env.AI.run(ANSWER_MODEL, {
        messages: [{ role: "user", content: buildGroundedPrompt(query, primary, products) }],
        max_tokens: 512,
      });
      const text = (result as { response?: string }).response?.trim();
      if (text) return { ...base, mode: "answer", text };
    } catch (err) {
      console.error("[assistant:answer_error]", err);
    }
  }

  return {
    ...base,
    mode: "protocol",
    text: buildProtocolAnswer(query, primary, products),
  };
}
