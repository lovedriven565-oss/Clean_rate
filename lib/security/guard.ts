import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/** Биндинги Workers Rate Limiting из wrangler.jsonc (`ratelimits`). */
export type LimiterName = "LEAD_LIMITER" | "EVENT_LIMITER" | "SEARCH_LIMITER";

/**
 * IP клиента. Для анонимных форм и событий другого стабильного идентификатора нет,
 * поэтому лимиты заданы с запасом на общий NAT/мобильные сети.
 */
export function clientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

/**
 * true — запрос можно обрабатывать. Вне Workers (next dev, тесты) биндинга нет → пропускаем:
 * лимит — защита прода, а не бизнес-правило.
 */
export async function checkRateLimit(request: Request, limiter: LimiterName, scope: string): Promise<boolean> {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const binding = (ctx.env as Partial<Record<LimiterName, RateLimit>>)[limiter];
    if (!binding) return true;
    const { success } = await binding.limit({ key: `${scope}:${clientIp(request)}` });
    return success;
  } catch {
    return true;
  }
}

export function tooManyRequests() {
  return NextResponse.json(
    { ok: false, error: "Слишком много запросов. Попробуйте через минуту." },
    { status: 429, headers: { "Retry-After": "60" } }
  );
}

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Серверная проверка токена Cloudflare Turnstile. Без TURNSTILE_SECRET_KEY (dev) проверка
 * пропускается; в проде секрет обязателен, иначе формы открыты для ботов.
 */
export async function verifyTurnstile(token: string | undefined, request: Request): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const body = new FormData();
    body.append("secret", secret);
    body.append("response", token);
    body.append("remoteip", clientIp(request));
    const res = await fetch(TURNSTILE_VERIFY_URL, { method: "POST", body });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
