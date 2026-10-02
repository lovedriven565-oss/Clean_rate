/**
 * Data access layer: чтение компаний, брендов и категорий из D1.
 *
 * В production (Cloudflare Workers) — запросы к D1 через drizzle-orm.
 * В next dev (нет D1 binding) — fallback на seed-data.ts.
 *
 * Все функции возвращают типы из lib/types.ts, чтобы UI-компоненты
 * работали одинаково в обоих режимах.
 */

import { and, count, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import {
  analyticsEvents,
  brandLeads,
  brands,
  cleaningCompanies,
  companyBrands,
  companyCategories,
  intentKeywords,
  partnerLeads,
  priceEstimates,
  ratingSources,
  solutionProducts,
  solutions,
  suppliers,
} from "@/db/schema";
import type {
  Brand,
  BrandLead,
  Category,
  CategoryId,
  Company,
  IntentKeyword,
  PartnerLead,
  PriceEstimate,
  RankedBrand,
  Solution,
  SolutionProduct,
} from "@/lib/types";
import { computeBrandScore, rankBrands } from "@/lib/brand-score";
import { getDb } from "./client";
import {
  getFallbackBrands,
  getFallbackBrandScores,
  getFallbackCategories,
  getFallbackCompanies,
  getFallbackIntentKeywords,
  getFallbackPriceEstimates,
  getFallbackSolutions,
  getSeedSolutionProductLinks,
  initScoreInputs,
} from "./fallback";
import { mapBrandRow, mapCompanyRow, parseJsonArray, parseJsonGeneric, type CompanyRow } from "./mappers";

/**
 * Ошибка чтения D1. Локально (частично засеянная D1, next start) — лог и откат на seed.
 * В проде (`STRICT_DB=1` в wrangler vars) ошибка всплывает: устаревший seed не должен
 * молча подменять реальные данные.
 */
function reportDbError(label: string, err: unknown): void {
  console.error(label, err);
  if (process.env.STRICT_DB === "1") throw err;
}

// --- Публичные функции ---

export async function getAllCompanies(): Promise<Company[]> {
  const db = await getDb();
  if (!db) return getFallbackCompanies();

  try {
    const drizzleDb = drizzle(db);

    const companyRows = await drizzleDb
      .select()
      .from(cleaningCompanies)
      .where(eq(cleaningCompanies.status, "published"));

    if (companyRows.length === 0) return getFallbackCompanies();

    // Категории
    const categoryRows = await drizzleDb.select().from(companyCategories);
    // Рейтинги
    const ratingRows = await drizzleDb.select().from(ratingSources);
    // Техника
    const equipmentRows = await drizzleDb.select().from(companyBrands);

    return companyRows.map((row) => {
      const cats = categoryRows.filter((c) => c.companyId === row.id).map((c) => ({ category_id: c.categoryId }));
      const ratings = ratingRows
        .filter((r) => r.companyId === row.id)
        .map((r) => ({ source: r.source, source_url: r.sourceUrl, rating: r.rating, review_count: r.reviewCount }));
      const equip = equipmentRows.filter((e) => e.companyId === row.id).map((e) => ({ brand_id: e.brandId }));
      return mapCompanyRow(row as unknown as CompanyRow, cats, ratings, equip);
    });
  } catch (err) {
    reportDbError("[db:companies_error]", err);
    return getFallbackCompanies();
  }
}

export async function getCompanyBySlug(slug: string): Promise<Company | null> {
  const db = await getDb();
  if (!db) {
    const fallback = getFallbackCompanies();
    return fallback.find((c) => c.slug === slug) ?? null;
  }

  try {
    const drizzleDb = drizzle(db);
    const rows = await drizzleDb.select().from(cleaningCompanies).where(eq(cleaningCompanies.slug, slug)).limit(1);
    if (rows.length === 0) return null;

    const row = rows[0];
    const cats = await drizzleDb.select().from(companyCategories).where(eq(companyCategories.companyId, row.id));
    const ratings = await drizzleDb.select().from(ratingSources).where(eq(ratingSources.companyId, row.id));
    const equip = await drizzleDb.select().from(companyBrands).where(eq(companyBrands.companyId, row.id));

    return mapCompanyRow(
      row as unknown as CompanyRow,
      cats.map((c) => ({ category_id: c.categoryId })),
      ratings.map((r) => ({ source: r.source, source_url: r.sourceUrl, rating: r.rating, review_count: r.reviewCount })),
      equip.map((e) => ({ brand_id: e.brandId }))
    );
  } catch (err) {
    reportDbError("[db:company_by_slug_error]", err);
    const fallback = getFallbackCompanies();
    return fallback.find((c) => c.slug === slug) ?? null;
  }
}

export async function getAllBrands(): Promise<Brand[]> {
  const db = await getDb();
  if (!db) return getFallbackBrands();

  try {
    const drizzleDb = drizzle(db);
    const rows = await drizzleDb.select().from(brands).where(eq(brands.status, "published"));
    if (rows.length === 0) return getFallbackBrands();
    return rows.map((row) =>
      mapBrandRow({
        id: row.id,
        slug: row.slug,
        name: row.name,
        tagline: row.tagline,
        description: row.description,
        focus: row.focus,
        website_url: row.websiteUrl,
        affiliate_url: row.affiliateUrl,
        accent: row.accent,
        is_sponsor: row.isSponsor ? 1 : 0,
      })
    );
  } catch (err) {
    reportDbError("[db:brands_error]", err);
    return getFallbackBrands();
  }
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  const all = await getAllBrands();
  return all.find((b) => b.slug === slug) ?? null;
}

export async function getBrandSlugs(): Promise<string[]> {
  return (await getAllBrands()).map((b) => b.slug);
}

/**
 * Бренды, отсортированные по «Индексу доверия профи».
 * Источники: company_brands (только verified), solution_products, analytics_events(entity_type=brand).
 */
export async function getBrandsByScore(): Promise<RankedBrand[]> {
  const allBrands = await getAllBrands();
  const brandIds = allBrands.map((b) => b.id);
  const db = await getDb();
  if (!db) return rankBrands(allBrands, getFallbackBrandScores(brandIds));

  try {
    const drizzleDb = drizzle(db);
    const [verifiedRows, productRows, clickRows] = await Promise.all([
      drizzleDb
        .select({ brandId: companyBrands.brandId, total: count() })
        .from(companyBrands)
        .where(eq(companyBrands.evidenceStatus, "verified"))
        .groupBy(companyBrands.brandId),
      drizzleDb
        .select({ brandId: solutionProducts.brandId, role: solutionProducts.role, total: count() })
        .from(solutionProducts)
        .groupBy(solutionProducts.brandId, solutionProducts.role),
      drizzleDb
        .select({ brandId: analyticsEvents.entityId, total: count() })
        .from(analyticsEvents)
        .where(and(eq(analyticsEvents.entityType, "brand"), eq(analyticsEvents.eventType, "website")))
        .groupBy(analyticsEvents.entityId),
    ]);

    const inputs = initScoreInputs(brandIds);
    for (const row of verifiedRows) {
      const input = inputs.get(row.brandId);
      if (input) input.verifiedCompanyCount = row.total;
    }
    for (const row of clickRows) {
      const input = inputs.get(row.brandId);
      if (input) input.clickCount = row.total;
    }
    // Если продуктовый граф в D1 ещё не засеян — считаем протоколы из seed, чтобы индекс не обнулялся.
    const productLinks =
      productRows.length > 0
        ? productRows.map((row) => ({ brandId: row.brandId, role: row.role, total: row.total }))
        : getSeedSolutionProductLinks();
    for (const link of productLinks) {
      const input = link.brandId ? inputs.get(link.brandId) : undefined;
      if (!input) continue;
      if (link.role === "recommended") input.recommendedCount += link.total;
      else input.alternativeCount += link.total;
    }

    return rankBrands(allBrands, new Map([...inputs].map(([id, input]) => [id, computeBrandScore(input)])));
  } catch (err) {
    reportDbError("[db:brand_scores_error]", err);
    return rankBrands(allBrands, getFallbackBrandScores(brandIds));
  }
}

export async function getAllCategories(): Promise<Category[]> {
  return getFallbackCategories();
}

export async function getCompanySlugs(): Promise<string[]> {
  const db = await getDb();
  if (!db) return getFallbackCompanies().map((c) => c.slug);

  try {
    const drizzleDb = drizzle(db);
    const rows = await drizzleDb.select({ slug: cleaningCompanies.slug }).from(cleaningCompanies);
    return rows.map((r) => r.slug);
  } catch (err) {
    reportDbError("[db:company_slugs_error]", err);
    return getFallbackCompanies().map((c) => c.slug);
  }
}

export async function getAllSolutions(): Promise<Solution[]> {
  const db = await getDb();
  if (!db) return getFallbackSolutions();

  try {
    const drizzleDb = drizzle(db);
    const rows = await drizzleDb.select().from(solutions).where(eq(solutions.status, "published"));
    if (rows.length === 0) return getFallbackSolutions();

    const brandRows = await drizzleDb.select().from(brands);
    const brandMap = new Map(brandRows.map((b) => [b.id, b.name]));
    const spRows = await drizzleDb.select().from(solutionProducts);

    return rows.map((row) => {
      const products: SolutionProduct[] = spRows
        .filter((sp) => sp.solutionId === row.id)
        .map((sp) => ({
          id: sp.id,
          solutionId: sp.solutionId,
          brandId: sp.brandId ?? undefined,
          productId: sp.productId ?? undefined,
          brandName: sp.brandId ? brandMap.get(sp.brandId) : undefined,
          role: sp.role as "recommended" | "alternative",
          note: sp.note ?? undefined,
        }));

      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        problemType: row.problemType as Solution["problemType"],
        surface: row.surface as Solution["surface"],
        material: row.material ?? undefined,
        severity: row.severity as Solution["severity"],
        audience: row.audience as Solution["audience"],
        diySteps: parseJsonGeneric(row.diySteps, []),
        warnings: parseJsonArray(row.warnings),
        whenToCallPro: row.whenToCallPro,
        diyCostNote: row.diyCostNote ?? undefined,
        proTimeNote: row.proTimeNote ?? undefined,
        searchKeywords: parseJsonArray(row.searchKeywords),
        relatedCategory: (row.relatedCategory as CategoryId) ?? undefined,
        status: row.status as Solution["status"],
        recommendedProducts: products,
      };
    });
  } catch (err) {
    reportDbError("[db:solutions_error]", err);
    return getFallbackSolutions();
  }
}

export async function getSolutionBySlug(slug: string): Promise<Solution | null> {
  const db = await getDb();
  if (!db) {
    const fallback = getFallbackSolutions();
    return fallback.find((s) => s.slug === slug) ?? null;
  }

  try {
    const drizzleDb = drizzle(db);
    const rows = await drizzleDb.select().from(solutions).where(eq(solutions.slug, slug)).limit(1);
    if (rows.length === 0) {
      const fallback = getFallbackSolutions();
      return fallback.find((s) => s.slug === slug) ?? null;
    }

    const row = rows[0];
    const brandRows = await drizzleDb.select().from(brands);
    const brandMap = new Map(brandRows.map((b) => [b.id, b.name]));
    const spRows = await drizzleDb.select().from(solutionProducts).where(eq(solutionProducts.solutionId, row.id));

    const products: SolutionProduct[] = spRows.map((sp) => ({
      id: sp.id,
      solutionId: sp.solutionId,
      brandId: sp.brandId ?? undefined,
      productId: sp.productId ?? undefined,
      brandName: sp.brandId ? brandMap.get(sp.brandId) : undefined,
      role: sp.role as "recommended" | "alternative",
      note: sp.note ?? undefined,
    }));

    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      problemType: row.problemType as Solution["problemType"],
      surface: row.surface as Solution["surface"],
      material: row.material ?? undefined,
      severity: row.severity as Solution["severity"],
      audience: row.audience as Solution["audience"],
      diySteps: parseJsonGeneric(row.diySteps, []),
      warnings: parseJsonArray(row.warnings),
      whenToCallPro: row.whenToCallPro,
      diyCostNote: row.diyCostNote ?? undefined,
      proTimeNote: row.proTimeNote ?? undefined,
      searchKeywords: parseJsonArray(row.searchKeywords),
      relatedCategory: (row.relatedCategory as CategoryId) ?? undefined,
      status: row.status as Solution["status"],
      recommendedProducts: products,
    };
  } catch (err) {
    reportDbError("[db:solution_by_slug_error]", err);
    const fallback = getFallbackSolutions();
    return fallback.find((s) => s.slug === slug) ?? null;
  }
}

export async function getSolutionSlugs(): Promise<string[]> {
  const db = await getDb();
  if (!db) return getFallbackSolutions().map((s) => s.slug);

  try {
    const drizzleDb = drizzle(db);
    const rows = await drizzleDb
      .select({ slug: solutions.slug })
      .from(solutions)
      .where(eq(solutions.status, "published"));
    if (rows.length === 0) return getFallbackSolutions().map((s) => s.slug);
    return rows.map((r) => r.slug);
  } catch (err) {
    reportDbError("[db:solution_slugs_error]", err);
    return getFallbackSolutions().map((s) => s.slug);
  }
}

export async function getSolutionsByCategory(category: CategoryId): Promise<Solution[]> {
  const all = await getAllSolutions();
  return all.filter((s) => s.relatedCategory === category);
}

/**
 * Проверка существования поставщика по id (для валидации аналитических событий).
 * Без биндинга (dev/тесты) — true: seed-поставщиков нет, блокировать нечем.
 */
export async function supplierExists(id: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return true;
  try {
    const drizzleDb = drizzle(db);
    const rows = await drizzleDb
      .select({ id: suppliers.id })
      .from(suppliers)
      .where(eq(suppliers.id, id))
      .limit(1);
    return rows.length > 0;
  } catch (err) {
    reportDbError("[db:supplier_exists_error]", err);
    return true;
  }
}

export async function getPriceEstimates(filter?: {
  solutionId?: string;
  categoryId?: CategoryId;
  countryCode?: string;
}): Promise<PriceEstimate[]> {
  const db = await getDb();
  if (!db) return getFallbackPriceEstimates(filter);

  try {
    const drizzleDb = drizzle(db);
    const rows = await drizzleDb.select().from(priceEstimates);
    if (rows.length === 0) return getFallbackPriceEstimates(filter);

    return rows
      .filter((row) => {
        if (filter?.solutionId && row.solutionId !== filter.solutionId) return false;
        if (filter?.categoryId && row.categoryId !== filter.categoryId) return false;
        if (filter?.countryCode && row.countryCode !== filter.countryCode) return false;
        return true;
      })
      .map((row) => ({
        id: row.id,
        solutionId: row.solutionId ?? undefined,
        categoryId: (row.categoryId as CategoryId) ?? undefined,
        countryCode: row.countryCode,
        city: row.city ?? undefined,
        currency: row.currency,
        priceMin: row.priceMin,
        priceMax: row.priceMax,
        unit: row.unit ?? undefined,
        note: row.note ?? undefined,
      }));
  } catch (err) {
    reportDbError("[db:price_estimates_error]", err);
    return getFallbackPriceEstimates(filter);
  }
}

export async function getIntentKeywords(): Promise<IntentKeyword[]> {
  const db = await getDb();
  if (!db) return getFallbackIntentKeywords();

  try {
    const drizzleDb = drizzle(db);
    const rows = await drizzleDb.select().from(intentKeywords);
    if (rows.length === 0) return getFallbackIntentKeywords();

    return rows.map((row) => ({
      id: row.id,
      keyword: row.keyword,
      intent: row.intent as IntentKeyword["intent"],
      weight: row.weight,
      targetKind: row.targetKind as IntentKeyword["targetKind"],
      targetSlug: row.targetSlug,
    }));
  } catch (err) {
    reportDbError("[db:intent_keywords_error]", err);
    return getFallbackIntentKeywords();
  }
}

export interface AnalyticsEventInput {
  /** Клиентский idempotency-ключ события: становится PK строки и отсекает повторную доставку. */
  eventId?: string;
  /** ID одного отображения страницы — группирует действия просмотра, не visitor-ID. */
  pageViewId?: string;
  campaignId?: string;
  entityType: "company" | "brand" | "supplier" | "product" | "page";
  entityId: string;
  eventType: "impression" | "view" | "phone" | "website" | "telegram" | "lead" | "download" | "share" | "feedback";
  path?: string;
  countryCode?: string;
  metadata?: Record<string, unknown>;
}

export interface AnalyticsWriteResult {
  /** false — хранилище недоступно или запись упала (ошибка залогирована). */
  ok: boolean;
  /** true — строка реально вставлена в D1. */
  persisted: boolean;
  /** true — событие с таким eventId уже существовало, счётчики не тронуты. */
  duplicate: boolean;
}

/** Типы событий, которые двигают счётчик кликов кампании (реальные CTA-действия). */
const CAMPAIGN_CLICK_EVENTS = new Set(["phone", "website", "telegram"]);

/**
 * Атомарная запись события + счётчика кампании в одном D1 batch.
 * INSERT OR IGNORE по PK = eventId: при дубле `changes()` = 0 и UPDATE
 * счётчика становится no-op — повторная доставка не накручивает лимиты.
 * Это дедупликация доставки, а не защита от намеренной накрутки.
 */
export async function recordAnalyticsEvent(event: AnalyticsEventInput): Promise<AnalyticsWriteResult> {
  const id = event.eventId ?? crypto.randomUUID();
  const db = await getDb();
  if (!db) {
    console.log("[analytics:event]", { ...event, eventId: id });
    return { ok: true, persisted: false, duplicate: false };
  }

  const statements = [
    db
      .prepare(
        `INSERT OR IGNORE INTO analytics_events
         (id, campaign_id, entity_type, entity_id, event_type, path, country_code, metadata, page_view_id, occurred_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        event.campaignId ?? null,
        event.entityType,
        event.entityId,
        event.eventType,
        event.path ?? null,
        event.countryCode ?? null,
        event.metadata ? JSON.stringify(event.metadata) : null,
        event.pageViewId ?? null,
        Date.now()
      ),
  ];

  const counterColumn =
    event.eventType === "impression"
      ? "current_impressions"
      : CAMPAIGN_CLICK_EVENTS.has(event.eventType)
        ? "current_clicks"
        : null;

  if (event.campaignId && counterColumn) {
    statements.push(
      db
        .prepare(
          `UPDATE campaigns SET ${counterColumn} = ${counterColumn} + 1 WHERE id = ? AND changes() > 0`
        )
        .bind(event.campaignId)
    );
  }

  try {
    const results = await db.batch(statements);
    const changes = results[0]?.meta?.changes ?? 0;
    return { ok: true, persisted: changes > 0, duplicate: changes === 0 };
  } catch (err) {
    console.error("[analytics:record_error]", err);
    return { ok: false, persisted: false, duplicate: false };
  }
}

export interface LeadSaveResult {
  id: string;
  /** saved — строка в D1; unavailable — нет биндинга (dev/тест, лог-fallback); error — запись упала. */
  status: "saved" | "unavailable" | "error";
}

export async function saveBrandLead(lead: {
  brandName: string;
  website?: string;
  contactName: string;
  contact: string;
  role: "brand" | "dealer" | "service" | "other";
  goal?: string;
  consentAcceptedAt: Date;
  consentVersion: string;
}): Promise<LeadSaveResult> {
  const id = crypto.randomUUID();
  const db = await getDb();
  if (!db) {
    console.log("[brand-lead:saved_fallback]", { id, ...lead });
    return { id, status: "unavailable" };
  }

  try {
    const drizzleDb = drizzle(db);
    await drizzleDb.insert(brandLeads).values({
      id,
      brandName: lead.brandName,
      website: lead.website || null,
      contactName: lead.contactName,
      contact: lead.contact,
      role: lead.role,
      goal: lead.goal || null,
      status: "new",
      consentAcceptedAt: lead.consentAcceptedAt,
      consentVersion: lead.consentVersion,
      createdAt: new Date(),
    });
    return { id, status: "saved" };
  } catch (err) {
    console.error("[brand-lead:db_error]", err);
    return { id, status: "error" };
  }
}

export async function savePartnerLead(lead: {
  companyName: string;
  contactName?: string;
  phone: string;
  city?: string;
  categoryIds?: string[];
  message?: string;
  consentAcceptedAt: Date;
  consentVersion: string;
}): Promise<LeadSaveResult> {
  const id = crypto.randomUUID();
  const db = await getDb();
  if (!db) {
    console.log("[partner-lead:saved_fallback]", { id, ...lead });
    return { id, status: "unavailable" };
  }

  try {
    const drizzleDb = drizzle(db);
    await drizzleDb.insert(partnerLeads).values({
      id,
      companyName: lead.companyName,
      contactName: lead.contactName || null,
      phone: lead.phone,
      city: lead.city || null,
      categoryIds: lead.categoryIds ? JSON.stringify(lead.categoryIds) : null,
      message: lead.message || null,
      status: "new",
      consentAcceptedAt: lead.consentAcceptedAt,
      consentVersion: lead.consentVersion,
      createdAt: new Date(),
    });
    return { id, status: "saved" };
  } catch (err) {
    console.error("[partner-lead:db_error]", err);
    return { id, status: "error" };
  }
}

export async function getBrandLeads(): Promise<BrandLead[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const drizzleDb = drizzle(db);
    const rows = await drizzleDb.select().from(brandLeads).orderBy(desc(brandLeads.createdAt));
    return rows.map((r) => ({
      id: r.id,
      brandName: r.brandName,
      website: r.website,
      contactName: r.contactName,
      contact: r.contact,
      role: r.role as BrandLead["role"],
      goal: r.goal,
      status: r.status as BrandLead["status"],
      consentAcceptedAt: r.consentAcceptedAt,
      consentVersion: r.consentVersion,
      createdAt: r.createdAt,
    }));
  } catch (err) {
    reportDbError("[db:brand_leads_error]", err);
    return [];
  }
}

export async function getPartnerLeads(): Promise<PartnerLead[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const drizzleDb = drizzle(db);
    const rows = await drizzleDb.select().from(partnerLeads).orderBy(desc(partnerLeads.createdAt));
    return rows.map((r) => ({
      id: r.id,
      companyName: r.companyName,
      contactName: r.contactName,
      phone: r.phone,
      city: r.city,
      categoryIds: r.categoryIds ? (JSON.parse(r.categoryIds) as string[]) : null,
      message: r.message,
      status: r.status as PartnerLead["status"],
      consentAcceptedAt: r.consentAcceptedAt,
      consentVersion: r.consentVersion,
      createdAt: r.createdAt,
    }));
  } catch (err) {
    reportDbError("[db:partner_leads_error]", err);
    return [];
  }
}
