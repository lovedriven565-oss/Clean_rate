/**
 * Запись для /admin: статусы лидов и кампаний, флаг promoted у компаний.
 * Доступ контролирует вызывающий роут (isAdminAllowed → Cloudflare Access).
 * Без D1-биндинга (next dev без контекста) возвращаем no_db — UI покажет честную ошибку.
 */

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { brandLeads, campaigns, cleaningCompanies, partnerLeads } from "@/db/schema";
import { getDb } from "./client";

export type AdminWriteResult = { ok: boolean; reason?: "no_db" | "not_found" | "invalid" };

const BRAND_LEAD_STATUSES = new Set(["new", "contacted", "qualified", "closed"]);
const PARTNER_LEAD_STATUSES = new Set(["new", "contacted", "closed"]);
const CAMPAIGN_STATUSES = new Set(["draft", "active", "paused", "completed"]);

function changesOf(result: unknown): number | undefined {
  const meta = (result as { meta?: { changes?: number } })?.meta;
  return typeof meta?.changes === "number" ? meta.changes : undefined;
}

export async function setLeadStatus(
  kind: "brand" | "partner",
  id: string,
  status: string
): Promise<AdminWriteResult> {
  const allowed = kind === "brand" ? BRAND_LEAD_STATUSES : PARTNER_LEAD_STATUSES;
  if (!allowed.has(status)) return { ok: false, reason: "invalid" };

  const db = await getDb();
  if (!db) return { ok: false, reason: "no_db" };

  try {
    const drizzleDb = drizzle(db);
    const table = kind === "brand" ? brandLeads : partnerLeads;
    const result = await drizzleDb
      .update(table)
      .set({ status: status as never })
      .where(eq(table.id, id))
      .run();
    const changes = changesOf(result);
    return changes === 0 ? { ok: false, reason: "not_found" } : { ok: true };
  } catch (err) {
    console.error("[admin:set_lead_status]", err);
    return { ok: false, reason: "not_found" };
  }
}

export async function setCompanyPromoted(id: string, promoted: boolean): Promise<AdminWriteResult> {
  const db = await getDb();
  if (!db) return { ok: false, reason: "no_db" };

  try {
    const drizzleDb = drizzle(db);
    const result = await drizzleDb
      .update(cleaningCompanies)
      .set({ promoted, updatedAt: new Date() })
      .where(eq(cleaningCompanies.id, id))
      .run();
    const changes = changesOf(result);
    return changes === 0 ? { ok: false, reason: "not_found" } : { ok: true };
  } catch (err) {
    console.error("[admin:set_company_promoted]", err);
    return { ok: false, reason: "not_found" };
  }
}

export async function setCampaignStatus(id: string, status: string): Promise<AdminWriteResult> {
  if (!CAMPAIGN_STATUSES.has(status)) return { ok: false, reason: "invalid" };

  const db = await getDb();
  if (!db) return { ok: false, reason: "no_db" };

  try {
    const drizzleDb = drizzle(db);
    const result = await drizzleDb
      .update(campaigns)
      .set({ status: status as never, updatedAt: new Date() })
      .where(eq(campaigns.id, id))
      .run();
    const changes = changesOf(result);
    return changes === 0 ? { ok: false, reason: "not_found" } : { ok: true };
  } catch (err) {
    console.error("[admin:set_campaign_status]", err);
    return { ok: false, reason: "not_found" };
  }
}
