import { NextResponse } from "next/server";
import { isAdminAllowed } from "@/lib/admin/guard";
import { getAllSolutions } from "@/lib/db/queries";
import { getSearchBindings, upsertSolutionVectors } from "@/lib/search/semantic";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/reindex — пересобирает векторный индекс протоколов.
 * Доступ как у /admin (Cloudflare Access в проде). Запускать после
 * добавления/правки протоколов и после создания индекса:
 *   wrangler vectorize create cleanhub-solutions --dimensions=1024 --metric=cosine
 */
export async function POST(request: Request): Promise<Response> {
  if (!isAdminAllowed(request.headers)) {
    return new Response("Not found", { status: 404 });
  }
  const env = await getSearchBindings();
  if (!env) {
    return NextResponse.json(
      { ok: false, error: "AI/VECTORIZE bindings are not configured" },
      { status: 503 }
    );
  }
  try {
    const solutions = await getAllSolutions();
    const indexed = await upsertSolutionVectors(env, solutions);
    return NextResponse.json({ ok: true, indexed });
  } catch (err) {
    console.error("[admin:reindex_error]", err);
    return NextResponse.json({ ok: false, error: "reindex failed" }, { status: 500 });
  }
}
