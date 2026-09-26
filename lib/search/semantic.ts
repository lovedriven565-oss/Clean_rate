/**
 * Семантический поиск (AI-поиск v1).
 *
 * `SemanticProvider` реализует тот же `SearchProvider`, что и `KeywordProvider`:
 * эмбеддинг запроса → ближайшие векторы протоколов в Vectorize →
 * `IntentClassification`. При score ниже порога или недоступных биндингах
 * управление откатывается на ключевые слова — вызывающий код не меняется.
 *
 * Индекс `cleanhub-solutions` (1024 dim, cosine) заполняется через
 * POST /api/admin/reindex — тексты протоколов строит `solutionEmbeddingText`.
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { SURFACE_LABELS } from "@/lib/solutions/meta";
import type { IntentTarget, IntentClassification, SearchProvider } from "./intent-router";

/** Мультиязычная модель (ru) с размерностью 1024 — обязана совпадать с индексом. */
export const EMBEDDING_MODEL = "@cf/baai/bge-m3";

/** Минимальный cosine-score, при котором семантическое совпадение доверяется. */
export const SEMANTIC_THRESHOLD = 0.62;

export interface SemanticEnv {
  AI?: Ai;
  VECTORIZE?: VectorizeIndex;
}

/**
 * Биндинги поиска из Cloudflare-контекста. null вне Workers
 * (next dev, тесты, сборка) — тогда работает KeywordProvider.
 */
export async function getSearchBindings(): Promise<SemanticEnv | null> {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as SemanticEnv;
    if (!env.AI || !env.VECTORIZE) return null;
    return env;
  } catch {
    return null;
  }
}

/** Текст документа для индекса: название, поверхность словами, тип проблемы, ключи. */
export function solutionEmbeddingText(solution: {
  title: string;
  surface: string;
  material?: string;
  problemType: string;
  searchKeywords: string[];
}): string {
  const surfaceLabel =
    (SURFACE_LABELS as Record<string, string>)[solution.surface] ?? solution.surface;
  return [solution.title, surfaceLabel, solution.material, solution.problemType, ...solution.searchKeywords]
    .filter(Boolean)
    .join(". ");
}

interface SolutionVectorMetadata {
  slug: string;
  intent: "b2c" | "b2b";
  surface: string;
}

async function embedTexts(ai: Ai, texts: string[]): Promise<number[][]> {
  const result = await ai.run(EMBEDDING_MODEL, { text: texts });
  const data = (result as { data?: number[][] }).data;
  if (!data || data.length !== texts.length) {
    throw new Error("[search:embed] unexpected embedding shape");
  }
  return data;
}

/**
 * Встраивает все протоколы и записывает векторы в индекс.
 * Метаданные несут slug + аудиторию — classify восстанавливает target без обращения к D1.
 */
export async function upsertSolutionVectors(
  env: SemanticEnv,
  solutions: Array<{
    id: string;
    slug: string;
    title: string;
    surface: string;
    material?: string;
    problemType: string;
    audience: "b2c" | "b2b" | "both";
    searchKeywords: string[];
  }>
): Promise<number> {
  if (!env.AI || !env.VECTORIZE || solutions.length === 0) return 0;
  const vectors = await embedTexts(env.AI, solutions.map(solutionEmbeddingText));
  await env.VECTORIZE.upsert(
    solutions.map((solution, i) => ({
      id: solution.id,
      values: vectors[i],
      metadata: {
        slug: solution.slug,
        intent: solution.audience === "b2b" ? "b2b" : "b2c",
        surface: solution.surface,
      } satisfies SolutionVectorMetadata,
    }))
  );
  return solutions.length;
}

export class SemanticProvider implements SearchProvider {
  constructor(
    private readonly env: SemanticEnv,
    private readonly fallback: SearchProvider
  ) {}

  async classify(query: string): Promise<IntentClassification> {
    if (this.env.AI && this.env.VECTORIZE) {
      try {
        const [vector] = await embedTexts(this.env.AI, [query]);
        const result = await this.env.VECTORIZE.query(vector, {
          topK: 1,
          returnMetadata: true,
        });
        const top = result.matches[0];
        const metadata = top?.metadata as Partial<SolutionVectorMetadata> | undefined;
        if (top && metadata?.slug && top.score >= SEMANTIC_THRESHOLD) {
          const target: IntentTarget = { kind: "solution", slug: metadata.slug };
          return {
            intent: metadata.intent ?? "b2c",
            target,
            confidence: top.score,
            matchedKeyword: `~${top.id}`,
          };
        }
      } catch (err) {
        console.error("[search:semantic_error]", err);
      }
    }
    return this.fallback.classify(query);
  }
}
