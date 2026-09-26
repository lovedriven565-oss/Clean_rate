import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getAllCampaigns } from "@/lib/ads/queries";
import { isAdminAllowed } from "@/lib/admin/guard";
import {
  getAllBrands,
  getAllSolutions,
  getBrandLeads,
  getPartnerLeads,
} from "@/lib/db/queries";
import { SURFACE_LABELS } from "@/lib/solutions/meta";

export const dynamic = "force-dynamic";

const LEAD_STATUS_LABELS: Record<string, string> = {
  new: "Новый",
  contacted: "В работе",
  qualified: "Квалифицирован",
  closed: "Закрыт",
};

const CAMPAIGN_STATUS_LABELS: Record<string, string> = {
  draft: "Черновик",
  active: "Активна",
  paused: "Пауза",
  completed: "Завершена",
};

const LEAD_ROLE_LABELS: Record<string, string> = {
  brand: "Бренд",
  dealer: "Дилер",
  service: "Сервис",
  other: "Другое",
};

function formatDate(date?: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

export default async function AdminPage() {
  if (!isAdminAllowed(await headers())) notFound();

  const [brandLeads, partnerLeads, solutions, campaigns, brands] = await Promise.all([
    getBrandLeads(),
    getPartnerLeads(),
    getAllSolutions(),
    getAllCampaigns(),
    getAllBrands(),
  ]);
  const brandName = new Map(brands.map((b) => [b.id, b.name]));
  const newLeadsCount =
    brandLeads.filter((l) => l.status === "new").length +
    partnerLeads.filter((l) => l.status === "new").length;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Админка</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Лиды, протоколы и рекламные кампании. Раздел закрыт Cloudflare Access.
          </p>
        </div>
        <a
          href="/api/admin/report"
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Скачать отчёт по кампаниям (CSV)
        </a>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Новых лидов", value: newLeadsCount },
          { label: "Протоколов", value: solutions.length },
          { label: "Кампаний", value: campaigns.length },
          {
            label: "Показы / клики",
            value: `${campaigns.reduce((s, c) => s + c.currentImpressions, 0)} / ${campaigns.reduce((s, c) => s + c.currentClicks, 0)}`,
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-panel border border-border bg-card p-4">
            <div className="font-mono text-2xl font-semibold tabular-nums">{stat.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold">Лиды брендов ({brandLeads.length})</h2>
        <div className="mt-3 overflow-x-auto rounded-panel border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Дата</th>
                <th className="px-3 py-2">Бренд</th>
                <th className="px-3 py-2">Контакт</th>
                <th className="px-3 py-2">Роль</th>
                <th className="px-3 py-2">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {brandLeads.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">Лидов пока нет</td></tr>
              )}
              {brandLeads.map((lead) => (
                <tr key={lead.id}>
                  <td className="px-3 py-2 font-mono text-xs">{formatDate(lead.createdAt)}</td>
                  <td className="px-3 py-2 font-medium">{lead.brandName}</td>
                  <td className="px-3 py-2">{lead.contactName} · {lead.contact}</td>
                  <td className="px-3 py-2">{LEAD_ROLE_LABELS[lead.role] ?? lead.role}</td>
                  <td className="px-3 py-2">{LEAD_STATUS_LABELS[lead.status] ?? lead.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold">Лиды компаний ({partnerLeads.length})</h2>
        <div className="mt-3 overflow-x-auto rounded-panel border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Дата</th>
                <th className="px-3 py-2">Компания</th>
                <th className="px-3 py-2">Телефон</th>
                <th className="px-3 py-2">Город</th>
                <th className="px-3 py-2">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {partnerLeads.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">Лидов пока нет</td></tr>
              )}
              {partnerLeads.map((lead) => (
                <tr key={lead.id}>
                  <td className="px-3 py-2 font-mono text-xs">{formatDate(lead.createdAt)}</td>
                  <td className="px-3 py-2 font-medium">{lead.companyName}</td>
                  <td className="px-3 py-2 font-mono text-xs">{lead.phone}</td>
                  <td className="px-3 py-2">{lead.city ?? "—"}</td>
                  <td className="px-3 py-2">{LEAD_STATUS_LABELS[lead.status] ?? lead.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold">Протоколы ({solutions.length})</h2>
        <div className="mt-3 overflow-x-auto rounded-panel border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Протокол</th>
                <th className="px-3 py-2">Поверхность</th>
                <th className="px-3 py-2">Статус</th>
                <th className="px-3 py-2">Средств</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {solutions.map((sol) => (
                <tr key={sol.id}>
                  <td className="px-3 py-2">
                    <a href={`/solutions/${sol.slug}`} className="font-medium underline-offset-2 hover:underline">
                      {sol.title}
                    </a>
                  </td>
                  <td className="px-3 py-2">{SURFACE_LABELS[sol.surface] ?? sol.surface}</td>
                  <td className="px-3 py-2">{sol.status}</td>
                  <td className="px-3 py-2 font-mono text-xs">{sol.recommendedProducts?.length ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold">Кампании ({campaigns.length})</h2>
        <div className="mt-3 overflow-x-auto rounded-panel border border-border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Кампания</th>
                <th className="px-3 py-2">Бренд</th>
                <th className="px-3 py-2">Плейсмент</th>
                <th className="px-3 py-2">Статус</th>
                <th className="px-3 py-2 text-right">Показы</th>
                <th className="px-3 py-2 text-right">Клики</th>
                <th className="px-3 py-2 text-right">CTR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {campaigns.length === 0 && (
                <tr><td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">Кампаний пока нет</td></tr>
              )}
              {campaigns.map((camp) => {
                const ctr = camp.currentImpressions > 0
                  ? ((camp.currentClicks / camp.currentImpressions) * 100).toFixed(1)
                  : "0.0";
                return (
                  <tr key={camp.id}>
                    <td className="px-3 py-2 font-medium">{camp.name}</td>
                    <td className="px-3 py-2">{brandName.get(camp.brandId) ?? camp.brandId}</td>
                    <td className="px-3 py-2 font-mono text-xs">{camp.placement}</td>
                    <td className="px-3 py-2">{CAMPAIGN_STATUS_LABELS[camp.status] ?? camp.status}</td>
                    <td className="px-3 py-2 text-right font-mono text-xs tabular-nums">
                      {camp.currentImpressions}{camp.maxImpressions ? ` / ${camp.maxImpressions}` : ""}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-xs tabular-nums">
                      {camp.currentClicks}{camp.maxClicks ? ` / ${camp.maxClicks}` : ""}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-xs tabular-nums">{ctr}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
