import { index, integer, primaryKey, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const cleaningCompanies = sqliteTable(
  "cleaning_companies",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    legalName: text("legal_name"),
    countryCode: text("country_code").notNull().default("BY"),
    region: text("region"),
    city: text("city").notNull(),
    address: text("address"),
    description: text("description").notNull(),
    websiteUrl: text("website_url"),
    phone: text("phone"),
    email: text("email"),
    telegramUrl: text("telegram_url"),
    priceFrom: real("price_from"),
    priceUnit: text("price_unit"),
    experienceYears: integer("experience_years"),
    coverImage: text("cover_image"),
    /** JSON-массив строк — теги/особенности компании */
    tags: text("tags"),
    /** JSON-массив строк — гарантии компании */
    guarantees: text("guarantees"),
    verified: integer("verified", { mode: "boolean" }).notNull().default(false),
    promoted: integer("promoted", { mode: "boolean" }).notNull().default(false),
    status: text("status", { enum: ["draft", "published", "archived"] }).notNull().default("draft"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    uniqueIndex("cleaning_companies_slug_unique").on(table.slug),
    index("cleaning_companies_location_idx").on(table.countryCode, table.city),
    index("cleaning_companies_status_idx").on(table.status),
  ]
);

export const companyCategories = sqliteTable(
  "company_categories",
  {
    companyId: text("company_id").notNull().references(() => cleaningCompanies.id, { onDelete: "cascade" }),
    categoryId: text("category_id").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.companyId, table.categoryId] }),
    index("company_categories_category_idx").on(table.categoryId),
  ]
);

export const brands = sqliteTable(
  "brands",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    tagline: text("tagline"),
    description: text("description").notNull(),
    focus: text("focus", { enum: ["technika", "himiya", "inventory", "service"] }).notNull(),
    websiteUrl: text("website_url"),
    affiliateUrl: text("affiliate_url"),
    accent: text("accent"),
    isSponsor: integer("is_sponsor", { mode: "boolean" }).notNull().default(false),
    verified: integer("verified", { mode: "boolean" }).notNull().default(false),
    status: text("status", { enum: ["draft", "published", "archived"] }).notNull().default("draft"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [uniqueIndex("brands_slug_unique").on(table.slug), index("brands_focus_idx").on(table.focus)]
);

export const suppliers = sqliteTable(
  "suppliers",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    countryCode: text("country_code").notNull().default("BY"),
    region: text("region"),
    city: text("city"),
    description: text("description"),
    websiteUrl: text("website_url"),
    phone: text("phone"),
    email: text("email"),
    verified: integer("verified", { mode: "boolean" }).notNull().default(false),
    status: text("status", { enum: ["draft", "published", "archived"] }).notNull().default("draft"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    uniqueIndex("suppliers_slug_unique").on(table.slug),
    index("suppliers_location_idx").on(table.countryCode, table.city),
  ]
);

export const products = sqliteTable(
  "products",
  {
    id: text("id").primaryKey(),
    brandId: text("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    category: text("category").notNull(),
    description: text("description"),
    imageKey: text("image_key"),
    externalUrl: text("external_url"),
    ph: real("ph"),
    /** JSON-массив допустимых поверхностей: string[] */
    compatibleSurfaces: text("compatible_surfaces"),
    /** JSON-массив запрещённых поверхностей: string[] */
    prohibitedSurfaces: text("prohibited_surfaces"),
    status: text("status", { enum: ["draft", "published", "archived"] }).notNull().default("draft"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [uniqueIndex("products_slug_unique").on(table.slug), index("products_brand_idx").on(table.brandId)]
);

export const companyBrands = sqliteTable(
  "company_brands",
  {
    companyId: text("company_id").notNull().references(() => cleaningCompanies.id, { onDelete: "cascade" }),
    brandId: text("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
    evidenceUrl: text("evidence_url"),
    evidenceStatus: text("evidence_status", { enum: ["pending", "verified", "rejected"] }).notNull().default("pending"),
    verifiedAt: integer("verified_at", { mode: "timestamp_ms" }),
  },
  (table) => [
    primaryKey({ columns: [table.companyId, table.brandId] }),
    index("company_brands_status_idx").on(table.evidenceStatus),
  ]
);

export const supplierBrands = sqliteTable(
  "supplier_brands",
  {
    supplierId: text("supplier_id").notNull().references(() => suppliers.id, { onDelete: "cascade" }),
    brandId: text("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
    relationship: text("relationship", { enum: ["listed", "dealer", "official_distributor", "service"] }).notNull().default("listed"),
    evidenceUrl: text("evidence_url"),
    verifiedAt: integer("verified_at", { mode: "timestamp_ms" }),
  },
  (table) => [primaryKey({ columns: [table.supplierId, table.brandId] })]
);

export const ratingSources = sqliteTable(
  "rating_sources",
  {
    id: text("id").primaryKey(),
    companyId: text("company_id").notNull().references(() => cleaningCompanies.id, { onDelete: "cascade" }),
    source: text("source", { enum: ["google", "yandex", "platform"] }).notNull(),
    sourceUrl: text("source_url").notNull(),
    rating: real("rating").notNull(),
    reviewCount: integer("review_count").notNull(),
    capturedAt: integer("captured_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    uniqueIndex("rating_sources_company_source_unique").on(table.companyId, table.source),
    index("rating_sources_captured_idx").on(table.capturedAt),
  ]
);

export const profileClaims = sqliteTable(
  "profile_claims",
  {
    id: text("id").primaryKey(),
    entityType: text("entity_type", { enum: ["company", "brand", "supplier"] }).notNull(),
    entityId: text("entity_id").notNull(),
    contactName: text("contact_name").notNull(),
    contact: text("contact").notNull(),
    evidence: text("evidence"),
    status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    reviewedAt: integer("reviewed_at", { mode: "timestamp_ms" }),
  },
  (table) => [index("profile_claims_entity_idx").on(table.entityType, table.entityId), index("profile_claims_status_idx").on(table.status)]
);

export const campaigns = sqliteTable(
  "campaigns",
  {
    id: text("id").primaryKey(),
    brandId: text("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
    productId: text("product_id").references(() => products.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    placement: text("placement", {
      enum: [
        "solution.sponsored_product",
        "rating.category_partner",
        "home.editorial_partner",
        "search.sponsored_result",
        "products.sponsored_slot",
        "brand.profile_campaign",
        "dealer.local_partner",
      ],
    }).notNull(),
    status: text("status", { enum: ["draft", "active", "paused", "completed"] }).notNull().default("draft"),
    startsAt: integer("starts_at", { mode: "timestamp_ms" }),
    endsAt: integer("ends_at", { mode: "timestamp_ms" }),
    /** JSON-массив кодов стран таргетинга: string[] (например ["BY", "RU"]) или null (все) */
    targetCountries: text("target_countries"),
    /** JSON-массив категорий: string[] (например ["upholstery", "offices"]) или null (все) */
    targetCategories: text("target_categories"),
    /** JSON-массив поверхностей: string[] (например ["upholstery", "carpet"]) или null (все) */
    targetSurfaces: text("target_surfaces"),
    /** JSON-массив slug решений: string[] (например ["vino-na-divane"]) или null (любое) */
    targetSolutions: text("target_solutions"),
    maxImpressions: integer("max_impressions"),
    maxClicks: integer("max_clicks"),
    currentImpressions: integer("current_impressions").notNull().default(0),
    currentClicks: integer("current_clicks").notNull().default(0),
    title: text("title"),
    description: text("description"),
    ctaText: text("cta_text"),
    ctaUrl: text("cta_url"),
    ctaType: text("cta_type", {
      enum: ["where_to_buy", "request_quote", "training", "demo", "website"],
    }),
    badgeText: text("badge_text"),
    priority: integer("priority").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
  },
  (table) => [
    index("campaigns_brand_status_idx").on(table.brandId, table.status),
    index("campaigns_placement_status_idx").on(table.placement, table.status),
  ]
);

export const analyticsEvents = sqliteTable(
  "analytics_events",
  {
    /** Клиентский eventId — PK, дедупликация доставки через INSERT OR IGNORE */
    id: text("id").primaryKey(),
    campaignId: text("campaign_id").references(() => campaigns.id, { onDelete: "set null" }),
    entityType: text("entity_type", { enum: ["company", "brand", "supplier", "product", "page"] }).notNull(),
    entityId: text("entity_id").notNull(),
    eventType: text("event_type", { enum: ["impression", "view", "phone", "website", "telegram", "lead", "download", "share", "feedback"] }).notNull(),
    path: text("path"),
    countryCode: text("country_code"),
    metadata: text("metadata"),
    /** ID отображения страницы: группирует действия одного просмотра, не visitor-ID */
    pageViewId: text("page_view_id"),
    occurredAt: integer("occurred_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("analytics_events_campaign_time_idx").on(table.campaignId, table.occurredAt),
    index("analytics_events_entity_time_idx").on(table.entityType, table.entityId, table.occurredAt),
  ]
);

export const brandLeads = sqliteTable(
  "brand_leads",
  {
    id: text("id").primaryKey(),
    brandName: text("brand_name").notNull(),
    website: text("website"),
    contactName: text("contact_name").notNull(),
    contact: text("contact").notNull(),
    role: text("role", { enum: ["brand", "dealer", "service", "other"] }).notNull(),
    goal: text("goal"),
    status: text("status", { enum: ["new", "contacted", "qualified", "closed"] }).notNull().default("new"),
    consentAcceptedAt: integer("consent_accepted_at", { mode: "timestamp_ms" }),
    consentVersion: text("consent_version"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("brand_leads_status_idx").on(table.status),
    index("brand_leads_created_idx").on(table.createdAt),
  ]
);

export const partnerLeads = sqliteTable(
  "partner_leads",
  {
    id: text("id").primaryKey(),
    companyName: text("company_name").notNull(),
    contactName: text("contact_name"),
    phone: text("phone").notNull(),
    city: text("city"),
    categoryIds: text("category_ids"),
    message: text("message"),
    status: text("status", { enum: ["new", "contacted", "closed"] }).notNull().default("new"),
    consentAcceptedAt: integer("consent_accepted_at", { mode: "timestamp_ms" }),
    consentVersion: text("consent_version"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("partner_leads_status_idx").on(table.status),
    index("partner_leads_created_idx").on(table.createdAt),
  ]
);

export const solutions = sqliteTable(
  "solutions",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    problemType: text("problem_type", {
      enum: ["stain", "odor", "scale", "postrenovation", "general"],
    }).notNull(),
    surface: text("surface", {
      enum: ["upholstery", "mattress", "carpet", "floor", "window", "facade", "kitchen", "bathroom", "other"],
    }).notNull(),
    material: text("material"),
    severity: text("severity", { enum: ["fresh", "set", "extreme"] }).notNull().default("fresh"),
    audience: text("audience", { enum: ["b2c", "b2b", "both"] }).notNull().default("both"),
    /** JSON-массив шагов diySteps: { order: number, instruction: string, tip?: string }[] */
    diySteps: text("diy_steps"),
    /** JSON-массив предупреждений warnings: string[] */
    warnings: text("warnings"),
    whenToCallPro: text("when_to_call_pro").notNull(),
    diyCostNote: text("diy_cost_note"),
    proTimeNote: text("pro_time_note"),
    /** JSON-массив синонимов и ключевых слов для поиска */
    searchKeywords: text("search_keywords"),
    relatedCategory: text("related_category"),
    status: text("status", { enum: ["draft", "published", "archived"] }).notNull().default("draft"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    uniqueIndex("solutions_slug_unique").on(table.slug),
    index("solutions_problem_type_idx").on(table.problemType),
    index("solutions_surface_idx").on(table.surface),
    index("solutions_status_idx").on(table.status),
  ]
);

export const solutionProducts = sqliteTable(
  "solution_products",
  {
    id: text("id").primaryKey(),
    solutionId: text("solution_id").notNull().references(() => solutions.id, { onDelete: "cascade" }),
    brandId: text("brand_id").references(() => brands.id, { onDelete: "set null" }),
    productId: text("product_id").references(() => products.id, { onDelete: "set null" }),
    role: text("role", { enum: ["recommended", "alternative"] }).notNull().default("recommended"),
    note: text("note"),
  },
  (table) => [
    index("solution_products_solution_idx").on(table.solutionId),
    index("solution_products_brand_idx").on(table.brandId),
  ]
);

export const intentKeywords = sqliteTable(
  "intent_keywords",
  {
    id: text("id").primaryKey(),
    keyword: text("keyword").notNull(),
    intent: text("intent", { enum: ["b2c", "b2b", "pro"] }).notNull(),
    weight: integer("weight").notNull().default(1),
    targetKind: text("target_kind", { enum: ["solution", "category", "brand"] }).notNull(),
    targetSlug: text("target_slug").notNull(),
  },
  (table) => [
    uniqueIndex("intent_keywords_keyword_unique").on(table.keyword),
    index("intent_keywords_intent_idx").on(table.intent),
    index("intent_keywords_target_idx").on(table.targetKind, table.targetSlug),
  ]
);

export const priceEstimates = sqliteTable(
  "price_estimates",
  {
    id: text("id").primaryKey(),
    solutionId: text("solution_id").references(() => solutions.id, { onDelete: "cascade" }),
    categoryId: text("category_id"),
    countryCode: text("country_code").notNull().default("BY"),
    city: text("city"),
    currency: text("currency").notNull().default("BYN"),
    priceMin: real("price_min").notNull(),
    priceMax: real("price_max").notNull(),
    unit: text("unit"),
    note: text("note"),
  },
  (table) => [
    index("price_estimates_solution_idx").on(table.solutionId),
    index("price_estimates_category_idx").on(table.categoryId),
    index("price_estimates_location_idx").on(table.countryCode, table.city),
  ]
);
