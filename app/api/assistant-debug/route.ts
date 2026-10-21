import { NextResponse } from "next/server";
import { retrieveSolutions, buildKnowledgePool } from "@/lib/assistant/engine";
import { getAllSolutions, getIntentKeywords } from "@/lib/db/queries";
import { getSearchBindings } from "@/lib/search/semantic";
import { classifyIntent } from "@/lib/search/intent-router";
import { rankSolutions, rankSolutionsByTokens } from "@/lib/search/rank";

export const dynamic = "force-dynamic";

/** Временный диагностический маршрут: поэтапный вывод пайплайна консультанта. */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "пятно вина на диване").slice(0, 200);

  const [env, solutions, keywords] = await Promise.all([
    getSearchBindings(),
    getAllSolutions(),
    getIntentKeywords(),
  ]);

  const pool = buildKnowledgePool(solutions);
  const normalized = q.trim().toLowerCase();

  let classification: unknown = null;
  let classificationErr: string | null = null;
  try {
    classification = classifyIntent(q, keywords);
  } catch (e) {
    classificationErr = String(e);
  }

  let byTokens: string[] = [];
  let byTokensErr: string | null = null;
  try {
    byTokens = rankSolutionsByTokens(pool, normalized).map((s) => s.slug);
  } catch (e) {
    byTokensErr = String(e);
  }

  let byTarget: string[] = [];
  let byTargetErr: string | null = null;
  try {
    byTarget = rankSolutions(
      pool,
      normalized,
      (classification as { target?: Parameters<typeof rankSolutions>[2] } | null)?.target ?? null
    ).map((s) => s.slug);
  } catch (e) {
    byTargetErr = String(e);
  }

  let retrieved: unknown = null;
  let retrieveErr: string | null = null;
  try {
    retrieved = await retrieveSolutions(env, q, solutions, keywords);
  } catch (e) {
    retrieveErr = String(e);
  }

  return NextResponse.json({
    q,
    envKeys: env ? Object.keys(env) : null,
    hasAI: Boolean(env?.AI),
    hasVectorize: Boolean(env?.VECTORIZE),
    solutionsCount: solutions.length,
    poolCount: pool.length,
    poolIds: pool.slice(0, 30).map((s) => s.id),
    keywordsCount: keywords.length,
    sampleStatus: solutions[0]?.status,
    classification,
    classificationErr,
    byTokens,
    byTokensErr,
    byTarget,
    byTargetErr,
    retrieved,
    retrieveErr,
  });
}
