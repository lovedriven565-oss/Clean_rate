import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SITE_URL } from "@/lib/site";

/**
 * Канонический хост — apex-домен из NEXT_PUBLIC_SITE_URL. Оба домена
 * (chistolab.pro и www.chistolab.pro) привязаны к одному воркеру, поэтому
 * без редиректа www отдавал бы полный дубль сайта для поисковиков.
 */
const APEX_HOST = new URL(SITE_URL).host;

/**
 * noindex,follow для состояний с query-параметрами фильтрации: канонические URL
 * страниц не меняются, поэтому отфильтрованные копии не должны индексироваться.
 * Параметры перечислены по страницам — ?verified= на /solutions noindex не даст.
 */
const FILTER_PARAMS: Record<string, string[]> = {
  "/rating": ["q", "category", "city", "sort", "verified", "intent"],
  "/solutions": ["type", "surface"],
  "/brands": ["q", "focus"],
};

/**
 * Автодетект региона по CF-IPCountry: живому посетителю из РФ/РБ один раз
 * выставляется cookie ch_region, дальше RegionProvider подставляет город и валюту
 * без редиректов и без региональных URL. Краулеры и прочие страны cookie не получают —
 * для них SSR остаётся нейтральным. Ручной выбор региона в шапке приоритетнее:
 * cookie не перезаписываем, если она уже есть.
 */
const IP_COUNTRY_TO_REGION: Record<string, string> = {
  RU: "RU:moscow",
  BY: "BY:minsk",
};

export function proxy(request: NextRequest) {
  // 301 www → apex до любой логики страниц: единый канонический хост.
  if (request.nextUrl.hostname === `www.${APEX_HOST}`) {
    const url = request.nextUrl.clone();
    url.hostname = APEX_HOST;
    url.protocol = "https";
    url.port = "";
    return NextResponse.redirect(url, 301);
  }

  // request.cf может не проксироваться в Node-middleware OpenNext — дублируем
  // чтением заголовка CF-IPCountry (Cloudflare всегда перезаписывает его реальным
  // значением на edge, подделать с клиента нельзя).
  const cfCountry =
    (request as NextRequest & { cf?: { country?: string } }).cf?.country ??
    request.headers.get("cf-ipcountry") ??
    undefined;
  const autoRegion = cfCountry ? IP_COUNTRY_TO_REGION[cfCountry] : undefined;
  const hasRegionCookie = request.cookies.has("ch_region");

  const keys = FILTER_PARAMS[request.nextUrl.pathname];
  const response =
    keys?.some((key) => request.nextUrl.searchParams.has(key))
      ? (() => {
          const res = NextResponse.next();
          res.headers.set("X-Robots-Tag", "noindex, follow");
          return res;
        })()
      : NextResponse.next();

  if (autoRegion && !hasRegionCookie) {
    response.cookies.set("ch_region", autoRegion, {
      path: "/",
      maxAge: 365 * 24 * 60 * 60,
      sameSite: "lax",
    });
  }
  return response;
}

export const config = {
  // Все HTML-маршруты (www-редирект) кроме _next-внутренностей и /api:
  // редирект API на 301 ломал бы POST-запросы форм.
  matcher: ["/((?!_next|api).*)"],
};
