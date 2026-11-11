"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Клиентские контролы /admin: статусы лидов и кампаний, переключатель promoted.
 * Все операции идут в POST /api/admin/actions, после успеха — router.refresh()
 * перерисовывает серверные данные без полной перезагрузки.
 */

const LEAD_STATUS_OPTIONS: Record<"brand" | "partner", { value: string; label: string }[]> = {
  brand: [
    { value: "new", label: "Новый" },
    { value: "contacted", label: "В работе" },
    { value: "qualified", label: "Квалифицирован" },
    { value: "closed", label: "Закрыт" },
  ],
  partner: [
    { value: "new", label: "Новый" },
    { value: "contacted", label: "В работе" },
    { value: "closed", label: "Закрыт" },
  ],
};

const CAMPAIGN_STATUS_OPTIONS = [
  { value: "draft", label: "Черновик" },
  { value: "active", label: "Активна" },
  { value: "paused", label: "Пауза" },
  { value: "completed", label: "Завершена" },
];

function useAdminAction() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(payload: Record<string, unknown>) {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/actions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
        if (!res.ok || !data?.ok) {
          setError(data?.error ?? "Не удалось сохранить.");
          return;
        }
        router.refresh();
      } catch {
        setError("Сеть недоступна.");
      }
    });
  }

  return { pending, error, run };
}

const selectClass =
  "rounded-control border border-border bg-card px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50";

export function LeadStatusSelect({ kind, id, status }: { kind: "brand" | "partner"; id: string; status: string }) {
  const { pending, error, run } = useAdminAction();
  return (
    <span className="inline-flex flex-col gap-1">
      <select
        className={selectClass}
        value={status}
        disabled={pending}
        aria-label="Статус лида"
        onChange={(e) => run({ action: "lead_status", kind, id, status: e.target.value })}
      >
        {LEAD_STATUS_OPTIONS[kind].map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <span className="text-[10px] text-danger">{error}</span>}
    </span>
  );
}

export function CampaignStatusSelect({ id, status }: { id: string; status: string }) {
  const { pending, error, run } = useAdminAction();
  return (
    <span className="inline-flex flex-col gap-1">
      <select
        className={selectClass}
        value={status}
        disabled={pending}
        aria-label="Статус кампании"
        onChange={(e) => run({ action: "campaign_status", id, status: e.target.value })}
      >
        {CAMPAIGN_STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <span className="text-[10px] text-danger">{error}</span>}
    </span>
  );
}

export interface SponsorCompanyRow {
  id: string;
  name: string;
  slug: string;
  city: string;
  promoted: boolean;
  /** Подписи слотов «Город · Категория», которые компания сейчас выигрывает. */
  slots: string[];
}

export function SponsorManager({ companies }: { companies: SponsorCompanyRow[] }) {
  const { pending, error, run } = useAdminAction();
  const sorted = [...companies].sort((a, b) => Number(b.promoted) - Number(a.promoted) || a.name.localeCompare(b.name, "ru"));

  return (
    <div className="mt-3 overflow-x-auto rounded-panel border border-border">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-3 py-2">Компания</th>
            <th className="px-3 py-2">Город</th>
            <th className="px-3 py-2">Спонсор</th>
            <th className="px-3 py-2">Выигранные слоты</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sorted.map((company) => (
            <tr key={company.id}>
              <td className="px-3 py-2">
                <a href={`/companies/${company.slug}`} className="font-medium underline-offset-2 hover:underline">
                  {company.name}
                </a>
              </td>
              <td className="px-3 py-2">{company.city}</td>
              <td className="px-3 py-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run({ action: "company_promoted", id: company.id, promoted: !company.promoted })}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-50",
                    company.promoted ? "bg-sponsor/20 text-ad" : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                  aria-pressed={company.promoted}
                >
                  {company.promoted ? "Спонсор · вкл" : "Включить"}
                </button>
              </td>
              <td className="px-3 py-2 text-xs text-muted-foreground">
                {company.slots.length > 0 ? company.slots.join("; ") : company.promoted ? "слот занят или нет пересечения" : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {error && <p className="px-3 py-2 text-xs text-danger">{error}</p>}
    </div>
  );
}
