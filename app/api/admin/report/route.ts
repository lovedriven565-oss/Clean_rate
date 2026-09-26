import { getAllCampaigns } from "@/lib/ads/queries";
import { isAdminAllowed } from "@/lib/admin/guard";
import { getAllBrands } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

function csvCell(value: string | number | null | undefined): string {
  const str = value === null || value === undefined ? "" : String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

function csvRow(cells: Array<string | number | null | undefined>): string {
  return cells.map(csvCell).join(";");
}

function formatDate(date?: Date | null): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

/**
 * GET /api/admin/report — выгрузка кампаний в CSV для отчёта рекламодателю.
 * Доступ как у /admin: Cloudflare Access в проде, открыто локально.
 * Разделитель `;` + BOM — корректное открытие кириллицы в Excel.
 */
export async function GET(request: Request): Promise<Response> {
  if (!isAdminAllowed(request.headers)) {
    return new Response("Not found", { status: 404 });
  }

  const [campaigns, brands] = await Promise.all([getAllCampaigns(), getAllBrands()]);
  const brandName = new Map(brands.map((b) => [b.id, b.name]));

  const lines = [
    csvRow([
      "Кампания",
      "Бренд",
      "Плейсмент",
      "Статус",
      "Старт",
      "Финиш",
      "Показы",
      "Лимит показов",
      "Клики",
      "Лимит кликов",
      "CTR, %",
    ]),
    ...campaigns.map((camp) =>
      csvRow([
        camp.name,
        brandName.get(camp.brandId) ?? camp.brandId,
        camp.placement,
        camp.status,
        formatDate(camp.startsAt),
        formatDate(camp.endsAt),
        camp.currentImpressions,
        camp.maxImpressions,
        camp.currentClicks,
        camp.maxClicks,
        camp.currentImpressions > 0
          ? ((camp.currentClicks / camp.currentImpressions) * 100).toFixed(2)
          : "0.00",
      ])
    ),
  ];

  const csv = "\uFEFF" + lines.join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="cleanhub-campaigns.csv"',
      "Cache-Control": "no-store",
    },
  });
}
