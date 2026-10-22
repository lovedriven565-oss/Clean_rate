import { NextResponse } from "next/server";
import {
  ANSWER_MODEL,
  OPEN_EXPERT_SYSTEM_PROMPT,
  generateOpenExpertAnswer,
  buildKnowledgePool,
} from "@/lib/assistant/engine";
import { getAllSolutions } from "@/lib/db/queries";
import { getSearchBindings } from "@/lib/search/semantic";

export const dynamic = "force-dynamic";

/** Временный диагностический маршрут: сырой вывод open-expert LLM. */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "чем оттереть суперклей со стола").slice(0, 200);

  const [env, solutions] = await Promise.all([getSearchBindings(), getAllSolutions()]);
  const pool = buildKnowledgePool(solutions);

  let rawResponse: unknown = null;
  let rawErr: string | null = null;
  if (env?.AI) {
    try {
      const result = await env.AI.run(ANSWER_MODEL, {
        messages: [
          { role: "system", content: OPEN_EXPERT_SYSTEM_PROMPT },
          { role: "user", content: `ВОПРОС: ${q}` },
        ],
        max_tokens: 1500,
        temperature: 0.2,
      });
      rawResponse = result;
    } catch (e) {
      rawErr = String(e);
    }
  }

  let genResult: unknown = null;
  let genErr: string | null = null;
  if (env?.AI) {
    try {
      const answer = await generateOpenExpertAnswer(env.AI, q, undefined, pool);
      genResult = answer
        ? { mode: answer.mode, title: answer.solution?.title, custom: answer.solution?.isCustom, steps: answer.steps.length }
        : null;
    } catch (e) {
      genErr = String(e);
    }
  }

  return NextResponse.json({
    q,
    hasAI: Boolean(env?.AI),
    rawErr,
    rawShape: rawResponse ? Object.keys(rawResponse as object) : null,
    rawText: (rawResponse as { response?: string } | null)?.response?.slice(0, 3000) ?? null,
    genResult,
    genErr,
  });
}
