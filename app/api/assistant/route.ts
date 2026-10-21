import { z } from "zod";
import { NextResponse } from "next/server";
import { consult } from "@/lib/assistant/engine";
import {
  getAllSolutions,
  getIntentKeywords,
  getPriceEstimates,
} from "@/lib/db/queries";
import { getProductsSafetyMap } from "@/lib/ads/queries";
import { checkRateLimit, tooManyRequests } from "@/lib/security/guard";
import { getSearchBindings } from "@/lib/search/semantic";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 16_000;

const contextSchema = z
  .object({
    timing: z.enum(["fresh", "dried", "washed"]).optional(),
    material: z.string().trim().max(120).optional(),
    solutionSlug: z.string().trim().max(120).optional(),
    countryCode: z.string().trim().max(8).optional(),
  })
  .optional();

const bodySchema = z.object({
  message: z.string().trim().min(2).max(500),
  context: contextSchema,
});

/**
 * POST /api/assistant — AI-консультант ChistoLab по чистке.
 * Отвечает строго по проверенным протоколам: без LLM отдаёт детерминированную
 * выжимку протокола с учётом уточнений триажа, с LLM — персонализированный
 * разбор технолога. Продукты с паспортом проходят гейт безопасности.
 */
export async function POST(request: Request): Promise<Response> {
  if (!(await checkRateLimit(request, "ASSISTANT_LIMITER", "assistant"))) {
    return tooManyRequests();
  }

  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const [env, solutions, keywords, safetyMap, estimates] = await Promise.all([
    getSearchBindings(),
    getAllSolutions(),
    getIntentKeywords(),
    getProductsSafetyMap(),
    getPriceEstimates(),
  ]);

  const answer = await consult({
    env,
    query: parsed.data.message,
    context: parsed.data.context,
    solutions,
    keywords,
    safetyMap,
    estimates,
  });

  return NextResponse.json(answer, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
