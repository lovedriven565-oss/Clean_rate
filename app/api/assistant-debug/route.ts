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
  try {
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") ?? "чем оттереть суперклей со стола").slice(0, 200);

    let env: Awaited<ReturnType<typeof getSearchBindings>> | null = null;
    let envErr: string | null = null;
    try {
      env = await getSearchBindings();
    } catch (e) {
      envErr = String(e);
    }

    let pool: ReturnType<typeof buildKnowledgePool> = [];
    let solErr: string | null = null;
    let solCount = 0;
    try {
      const solutions = await getAllSolutions();
      solCount = solutions.length;
      pool = buildKnowledgePool(solutions);
    } catch (e) {
      solErr = String(e);
    }

    let rawResponse: unknown = null;
    let rawErr: string | null = null;
    if (env?.AI) {
      try {
        rawResponse = await env.AI.run(ANSWER_MODEL, {
          messages: [
            { role: "system", content: OPEN_EXPERT_SYSTEM_PROMPT },
            { role: "user", content: `ВОПРОС: ${q}` },
          ],
          max_tokens: 1500,
          temperature: 0.2,
        });
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

    let rawDump: string | null = null;
    try {
      rawDump = JSON.stringify(rawResponse)?.slice(0, 4000) ?? null;
    } catch {
      rawDump = `unserializable: ${String(rawResponse)?.slice(0, 500)}`;
    }

    return NextResponse.json({
      q,
      envErr,
      solErr,
      solCount,
      poolCount: pool.length,
      hasAI: Boolean(env?.AI),
      rawErr,
      rawCtor: rawResponse ? (rawResponse as object).constructor?.name : null,
      rawShape: rawResponse && typeof rawResponse === "object" ? Object.keys(rawResponse) : String(typeof rawResponse),
      rawDump,
      genResult,
      genErr,
    });
  } catch (e) {
    return NextResponse.json({ fatal: String(e), stack: (e as Error)?.stack?.slice(0, 2000) }, { status: 200 });
  }
}
