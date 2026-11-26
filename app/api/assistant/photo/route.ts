import { NextResponse } from "next/server";
import { getAllSolutions, recordAnalyticsEvent } from "@/lib/db/queries";
import { getProductsSafetyMap } from "@/lib/ads/queries";
import { getSearchBindings } from "@/lib/search/semantic";
import { checkPhotoRateLimit, verifyTurnstileRequired } from "@/lib/security/guard";
import { parseAssistantTiming, buildKnowledgePool } from "@/lib/assistant/engine";
import {
  PHOTO_DAILY_BUDGET_DEFAULT,
  PHOTO_MAX_BYTES,
  PHOTO_TIMEOUT_MS,
  buildPhotoFallbackAnswer,
  buildPhotoProtocolAnswer,
  classifyStainPhoto,
  validatePhotoUpload,
  type PhotoModelVerdict,
} from "@/lib/assistant/photo";
import { reservePhotoAttempt } from "@/lib/assistant/photo-budget";
import type { AssistantAnswer, AssistantContext } from "@/lib/assistant/engine";

export const dynamic = "force-dynamic";

/** Верхний предел multipart-тела: файл ≤5 МБ + поля формы. */
const MAX_BODY_BYTES = PHOTO_MAX_BYTES + 256 * 1024;
const COUNTRY_RE = /^[A-Z]{2}$/;

function jsonError(error: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, error, ...extra }, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("photo_timeout")), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/**
 * POST /api/assistant/photo — фото-триаж (открытая бета).
 *
 * Fail-closed на каждом уровне: выключатель → лимитер → Turnstile →
 * D1-бюджет → AI. При любом сбое защиты AI-вызов не выполняется.
 * Фото и EXIF не пишутся в D1/R2/логи/аналитику; ответ — no-store.
 * Модель возвращает только токен категории, текст — из проверенной базы.
 */
export async function POST(request: Request): Promise<Response> {
  // Runtime kill-switch: без явного "1" эндпоинт закрыт (включая прод).
  if (process.env.PHOTO_ASSIST_ENABLED !== "1") {
    return jsonError("photo_disabled", 503);
  }

  const limit = await checkPhotoRateLimit(request);
  if (limit === "unavailable") return jsonError("photo_unavailable", 503);
  if (limit === "limited") {
    return jsonError("too_many_requests", 429, { retryAfter: 60 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return jsonError("payload_too_large", 413);
  }

  const form = await request.formData().catch(() => null);
  if (!form) return jsonError("invalid_request", 400);

  const file = form.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return jsonError("photo_required", 400);
  }
  if (file.size > PHOTO_MAX_BYTES) {
    return jsonError("payload_too_large", 413);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const image = validatePhotoUpload(bytes, file.type || null);
  if (!image) {
    return jsonError("unsupported_image", 415);
  }

  const material = String(form.get("material") ?? "").trim().slice(0, 120) || undefined;
  const timing = parseAssistantTiming(String(form.get("timing") ?? "") || null);
  const turnstileToken = String(form.get("turnstileToken") ?? "") || undefined;
  const countryRaw = String(form.get("countryCode") ?? "").trim().toUpperCase();
  const countryCode = COUNTRY_RE.test(countryRaw) ? countryRaw : undefined;

  const context: AssistantContext = { timing, material, countryCode };

  if (!(await verifyTurnstileRequired(turnstileToken, request))) {
    return jsonError("bot_check_failed", 403);
  }

  const [searchEnv, solutions, safetyMap] = await Promise.all([
    getSearchBindings(),
    getAllSolutions(),
    getProductsSafetyMap(),
  ]);

  if (!searchEnv?.AI) {
    return jsonError("photo_unavailable", 503);
  }

  // Атомарный резерв попытки в дневном бюджете D1 — до вызова модели.
  const day = new Date().toISOString().slice(0, 10);
  const budgetLimit =
    Number.parseInt(process.env.PHOTO_DAILY_BUDGET ?? "", 10) || PHOTO_DAILY_BUDGET_DEFAULT;
  const budget = await reservePhotoAttempt(day, budgetLimit);
  if (budget === "unavailable") return jsonError("photo_unavailable", 503);
  if (budget === "exhausted") return jsonError("daily_budget_exhausted", 429);

  let verdict: PhotoModelVerdict;
  try {
    verdict = await withTimeout(
      classifyStainPhoto(searchEnv.AI, image),
      PHOTO_TIMEOUT_MS
    );
  } catch (err) {
    console.error("[photo:ai_error]", err instanceof Error ? err.message : "unknown");
    verdict = { kind: "invalid" };
  }

  const pool = buildKnowledgePool(solutions);
  let answer: AssistantAnswer;
  let resultKind: string;

  if (verdict.kind === "category") {
    const protocol = buildPhotoProtocolAnswer({
      categoryId: verdict.categoryId,
      context,
      solutions,
      safetyMap,
    });
    if (protocol) {
      answer = protocol;
      resultKind = "protocol";
    } else {
      answer = buildPhotoFallbackAnswer("unclear", pool);
      resultKind = "unclear";
    }
  } else if (verdict.kind === "unclear" || verdict.kind === "invalid") {
    answer = buildPhotoFallbackAnswer("unclear", pool);
    resultKind = verdict.kind;
  } else {
    // not_cleaning | personal_data — безопасные отказы без химии
    answer = buildPhotoFallbackAnswer(verdict.kind, pool);
    resultKind = verdict.kind;
  }

  // Аналитика: только категория результата, без фото/EXIF/деталей кадра.
  await recordAnalyticsEvent({
    entityType: "page",
    entityId: "assistant",
    eventType: "view",
    path: "/assistant",
    countryCode,
    metadata: { placement: "assistant.photo", result: resultKind },
  });

  return NextResponse.json({ ok: true, answer }, {
    headers: { "Cache-Control": "no-store" },
  });
}
