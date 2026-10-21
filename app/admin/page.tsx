import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getAllCampaigns } from "@/lib/ads/queries";
import { isAdminAllowed } from "@/lib/admin/guard";
import { DEMAND_WINDOW_DAYS, buildDemandRadar, percentDelta, type DemandRadar } from "@/lib/admin/demand-radar";
import {
  getAllBrands,
  getAllCategories,
  getAllCompanies,
  getAllSolutions,
  getBrandLeads,
  getCompanyEventStats,
  getDemandSignals,
  getIntentKeywords,
  getPartnerLeads,
} from "@/lib/db/queries";
import { SURFACE_LABELS } from "@/lib/solutions/meta";
import { cn } from "@/lib/utils";

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

  const [brandLeads, partnerLeads, solutions, campaigns, brands, keywords, categories, companies, signals, companyStats] =
    await Promise.all([
      getBrandLeads(),
      getPartnerLeads(),
      getAllSolutions(),
      getAllCampaigns(),
      getAllBrands(),
      getIntentKeywords(),
      getAllCategories(),
      getAllCompanies(),
      getDemandSignals(DEMAND_WINDOW_DAYS),
      getCompanyEventStats(DEMAND_WINDOW_DAYS),
    ]);
  const brandName = new Map(brands.map((b) => [b.id, b.name]));
  const radar = buildDemandRadar({ keywords, solutions, categories, companies, ...signals });
  // entityId событий — id или slug компании; показываем только известные профили.
  const companyByKey = new Map(companies.flatMap((c) => [[c.id, c] as const, [c.slug, c] as const]));
  const companyRows = companyStats
    .map((stat) => ({ stat, company: companyByKey.get(stat.companyId) }))
    .filter((row): row is { stat: typeof row.stat; company: NonNullable<typeof row.company> } => Boolean(row.company));
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
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- ответ API: CSV-файл на скачивание, а не страница */}
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
          <div key={stat.label} className="linear-beam data-surface rounded-panel p-4">
            <div className="font-data text-2xl font-semibold">{stat.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      <DemandRadarSection radar={radar} />

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold">Лиды брендов ({brandLeads.length})</h2>
        <div className="mt-3 overflow-x-auto rounded-panel border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Дата</th>
                <th className="px-3 py-2">Бренд</th>
                <th className="px-3 py-2">Контакт (Zero-PII)</th>
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
                  <td className="px-3 py-2 font-mono text-xs">{lead.contact}</td>
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
                <th className="px-3 py-2">Контакт (Zero-PII)</th>
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

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold">Контакты компаний ({DEMAND_WINDOW_DAYS} дн)</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Внутренняя сводка для владельца: клиентам цифры не показываются — спонсорство продаётся за полку, а не за лид.
        </p>
        <div className="mt-3 overflow-x-auto rounded-panel border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Компания</th>
                <th className="px-3 py-2">Город</th>
                <th className="px-3 py-2 text-right">Просмотры</th>
                <th className="px-3 py-2 text-right">Звонки</th>
                <th className="px-3 py-2 text-right">Telegram</th>
                <th className="px-3 py-2 text-right">Сайт</th>
                <th className="px-3 py-2 text-right">Контакты</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {companyRows.length === 0 && (
                <tr><td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">Событий по компаниям пока нет</td></tr>
              )}
              {companyRows.slice(0, 20).map(({ stat, company }) => (
                <tr key={stat.companyId}>
                  <td className="px-3 py-2">
                    <a href={`/companies/${company.slug}`} className="font-medium underline-offset-2 hover:underline">
                      {company.name}
                    </a>
                    {company.promoted && (
                      <span className="ml-2 rounded-full bg-sponsor/15 px-2 py-0.5 text-[10px] font-semibold text-ad">Спонсор</span>
                    )}
                  </td>
                  <td className="px-3 py-2">{company.city}</td>
                  <td className="px-3 py-2 text-right font-data text-xs tabular-nums">{stat.views}</td>
                  <td className="px-3 py-2 text-right font-data text-xs tabular-nums">{stat.phone}</td>
                  <td className="px-3 py-2 text-right font-data text-xs tabular-nums">{stat.telegram}</td>
                  <td className="px-3 py-2 text-right font-data text-xs tabular-nums">{stat.website}</td>
                  <td className="px-3 py-2 text-right font-data text-xs font-semibold tabular-nums">{stat.contacts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function DeltaBadge({ current, delta }: { current: number; delta: number | null }) {
  const label = delta === null ? (current > 0 ? "новое" : "—") : `${delta > 0 ? "+" : delta < 0 ? "−" : ""}${Math.abs(delta)}%`;
  return (
    <span
      className={cn(
        "inline-flex min-w-14 justify-center rounded-full px-2 py-0.5 font-data text-[11px] font-semibold",
        delta !== null && delta > 0 && "bg-success/10 text-success",
        delta !== null && delta < 0 && "bg-danger/10 text-danger",
        (delta === null || delta === 0) && "bg-muted text-muted-foreground"
      )}
    >
      {label}
    </span>
  );
}

/** «Радар спроса»: живая статистика для разговора с брендами и клининговыми компаниями. */
function DemandRadarSection({ radar }: { radar: DemandRadar }) {
  const maxWeight = Math.max(1, ...radar.topics.map((t) => t.weight));
  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">Радар спроса и поисковых интентов</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Последние <span className="font-data">{radar.windowDays}</span> дн. против предыдущих{" "}
            <span className="font-data">{radar.windowDays}</span>: индекс интентов + обезличенные события.
          </p>
        </div>
        {!radar.hasEvents && (
          <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
            Событий пока нет — показан семантический вес ключей
          </span>
        )}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="linear-beam data-surface rounded-panel p-4 lg:col-span-2">
          <h3 className="text-sm font-semibold">Топ тем и протоколов</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr>
                  <th className="py-2 pr-3 font-medium">Протокол</th>
                  <th className="px-3 py-2 font-medium">Вес спроса</th>
                  <th className="px-3 py-2 text-right font-medium">Просмотры</th>
                  <th className="py-2 pl-3 text-right font-medium">Δ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {radar.topics.length === 0 && (
                  <tr><td colSpan={4} className="py-6 text-center text-muted-foreground">Ключей интентов пока нет</td></tr>
                )}
                {radar.topics.map((topic) => (
                  <tr key={topic.slug}>
                    <td className="py-2 pr-3">
                      <a href={`/solutions/${topic.slug}`} className="font-medium underline-offset-2 hover:underline">
                        {topic.title}
                      </a>
                      <div className="font-data text-[11px] text-muted-foreground">{topic.keywords} ключ.</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 rounded-full bg-muted">
                          <div className="h-full rounded-full bg-brand" style={{ width: `${(topic.weight / maxWeight) * 100}%` }} />
                        </div>
                        <span className="font-data text-xs">{topic.weight}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right font-data text-xs">{topic.views}</td>
                    <td className="py-2 pl-3 text-right">
                      <DeltaBadge current={topic.views} delta={percentDelta(topic.views, topic.previousViews)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="linear-beam data-surface rounded-panel p-4">
          <h3 className="text-sm font-semibold">Распределение интентов</h3>
          <ul className="mt-4 space-y-4">
            {radar.intents.map((intent) => (
              <li key={intent.intent}>
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span>{intent.label}</span>
                  <span className="font-data font-semibold">{intent.share}%</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-muted">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${intent.share}%` }} />
                </div>
                <div className="mt-1 font-data text-[11px] text-muted-foreground">
                  вес {intent.weight} · пропусков {intent.missed}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="linear-beam data-surface rounded-panel p-4 lg:col-span-2">
          <h3 className="text-sm font-semibold">Динамика интереса к категориям</h3>
          <ul className="mt-3 divide-y divide-border">
            {radar.categories.map((category) => (
              <li key={category.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span>{category.name}</span>
                <span className="flex items-center gap-3">
                  <span className="font-data text-xs text-muted-foreground">
                    {category.current} <span className="opacity-60">/ {category.previous}</span>
                  </span>
                  <DeltaBadge current={category.current} delta={category.delta} />
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="linear-beam data-surface rounded-panel p-4">
          <h3 className="text-sm font-semibold">Ищут и не находят</h3>
          {radar.missedQueries.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Пропущенных запросов за окно нет.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {radar.missedQueries.map((item) => (
                <li key={item.query} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate">«{item.query}»</span>
                  <span className="font-data text-xs text-muted-foreground">×{item.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
