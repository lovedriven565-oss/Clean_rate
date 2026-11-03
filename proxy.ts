import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

export function proxy(request: NextRequest) {
  const keys = FILTER_PARAMS[request.nextUrl.pathname];
  if (keys?.some((key) => request.nextUrl.searchParams.has(key))) {
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, follow");
    return response;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/rating", "/solutions", "/brands"],
};
