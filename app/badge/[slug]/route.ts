import { getCompanyBySlug } from "@/lib/db/queries";
import { calculateOrganicScore } from "@/lib/rating";
import { BRAND_COLORS, SITE_MONOGRAM, SITE_NAME } from "@/lib/site";

/**
 * SVG-бейдж «{SITE_NAME} · профиль проверен» для сайтов компаний.
 * Код вставки показывается на странице компании — даёт обратные ссылки и узнаваемость.
 * Формулировка относится к данным профиля, не к качеству услуг.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);
  if (!company) {
    return new Response("Not found", { status: 404 });
  }

  const score = calculateOrganicScore(company);
  const status = company.verified ? "Профиль проверен" : "В каталоге";
  const scoreText = score !== null ? ` · балл ${Math.round(score)}/100` : "";

  const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="72" viewBox="0 0 300 72" role="img" aria-label="${escape(`${SITE_NAME}: ${status}`)}">
  <rect width="300" height="72" rx="14" fill="${BRAND_COLORS.ink}"/>
  <rect x="10" y="12" width="48" height="48" rx="11" fill="${BRAND_COLORS.brand}"/>
  <text x="34" y="45" font-family="system-ui, sans-serif" font-size="21" font-weight="700" fill="${BRAND_COLORS.brandForeground}" text-anchor="middle">${escape(SITE_MONOGRAM)}</text>
  <text x="70" y="30" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="${BRAND_COLORS.paper}">${escape(SITE_NAME)}</text>
  <text x="70" y="49" font-family="system-ui, sans-serif" font-size="12" fill="${BRAND_COLORS.primaryBright}">${escape(`${status}${scoreText}`)}</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      // Бейдж встраивается на чужие сайты — кешируем на CDN надолго.
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
    },
  });
}
