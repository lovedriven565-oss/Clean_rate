import { z } from "zod";
import { NextResponse } from "next/server";
import { consult, describeImage } from "@/lib/assistant/engine";
import {
  getAllSolutions,
  getIntentKeywords,
} from "@/lib/db/queries";
import { getProductsSafetyMap } from "@/lib/ads/queries";
import { checkRateLimit, tooManyRequests } from "@/lib/security/guard";
import { getSearchBindings } from "@/lib/search/semantic";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  message: z.string().trim().min(2).max(500),
  // data-url без префикса или чистый base64; ~1.5 МБ фото максимум
  image: z.string().max(2_200_000).optional(),
});

function stripDataUrl(image: string): string {
  const comma = image.indexOf(",");
  return image.startsWith("data:") && comma > -1 ? image.slice(comma + 1) : image;
}

/**
 * POST /api/assistant — AI-консультант по чистке.
 * Отвечает только по проверенным протоколам: без LLM отдаёт детерминированную
 * выжимку протокола, с LLM — суммаризацию фактов. Продукты с паспортом
 * проходят гейт безопасности. Фото обрабатывается в памяти и не сохраняется.
 */
export async function POST(request: Request): Promise<Response> {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  if (!(await checkRateLimit(request, "ASSISTANT_LIMITER", "assistant"))) {
    return tooManyRequests();
  }

  const env = await getSearchBindings();
  let imageDescription: string | null = null;
  if (parsed.data.image && env?.AI) {
    imageDescription = await describeImage(env.AI, stripDataUrl(parsed.data.image));
  }

  const [solutions, keywords, safetyMap] = await Promise.all([
    getAllSolutions(),
    getIntentKeywords(),
    getProductsSafetyMap(),
  ]);

  const answer = await consult({
    env,
    query: parsed.data.message,
    imageDescription,
    solutions,
    keywords,
    safetyMap,
  });

  return NextResponse.json(answer, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
