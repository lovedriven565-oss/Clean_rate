/**
 * Drizzle seed-скрипт для локальной D1.
 *
 * Запуск:
 *   npx tsx db/seed.ts               → генерирует migrations/seed.sql
 *   npx wrangler d1 execute cleaning-rating-db --local --file=migrations/seed.sql
 *
 * Скрипт идемпотентен: сначала очищает таблицы, затем вставляет свежие данные.
 * Использует drizzle-orm sql-шаблоны для типобезопасной генерации SQL.
 */

import { sql } from "drizzle-orm";
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  seedBrands,
  seedCampaigns,
  seedCategories,
  seedCompanies,
  seedIntentKeywords,
  seedPriceEstimates,
  seedProducts,
  seedSolutionProducts,
  seedSolutions,
  seedTimestamp,
} from "./seed-data";

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, "..", "migrations");

function esc(value: string | undefined | null): string {
  if (value === undefined || value === null) return "NULL";
  return `'${value.replace(/'/g, "''")}'`;
}

function num(value: number | undefined | null): string {
  if (value === undefined || value === null) return "NULL";
  return String(value);
}

function bool(value: boolean): string {
  return value ? "1" : "0";
}

function jsonArray(value: string[] | undefined): string {
  if (!value || value.length === 0) return "NULL";
  return esc(JSON.stringify(value));
}

const statements: string[] = [];

// --- Очистка (идемпотентность) ---
statements.push("DELETE FROM `analytics_events`;");
statements.push("DELETE FROM `campaigns`;");
statements.push("DELETE FROM `profile_claims`;");
statements.push("DELETE FROM `rating_sources`;");
statements.push("DELETE FROM `company_brands`;");
statements.push("DELETE FROM `company_categories`;");
statements.push("DELETE FROM `cleaning_companies`;");
statements.push("DELETE FROM `solution_products`;");
statements.push("DELETE FROM `price_estimates`;");
statements.push("DELETE FROM `intent_keywords`;");
statements.push("DELETE FROM `solutions`;");
statements.push("DELETE FROM `products`;");
statements.push("DELETE FROM `supplier_brands`;");
statements.push("DELETE FROM `suppliers`;");
statements.push("DELETE FROM `brands`;");

// --- Бренды ---
for (const brand of seedBrands) {
  statements.push(
    `INSERT INTO \`brands\` (\`id\`, \`slug\`, \`name\`, \`tagline\`, \`description\`, \`focus\`, \`website_url\`, \`affiliate_url\`, \`accent\`, \`is_sponsor\`, \`verified\`, \`status\`, \`created_at\`, \`updated_at\`) VALUES (${esc(brand.id)}, ${esc(brand.slug)}, ${esc(brand.name)}, ${esc(brand.tagline)}, ${esc(brand.description)}, ${esc(brand.focus)}, ${esc(brand.websiteUrl)}, ${esc(brand.affiliateUrl)}, ${esc(brand.accent)}, ${bool(brand.isSponsor)}, 0, 'published', ${num(seedTimestamp)}, ${num(seedTimestamp)});`
  );
}

// --- Компании ---
for (const company of seedCompanies) {
  statements.push(
    `INSERT INTO \`cleaning_companies\` (\`id\`, \`slug\`, \`name\`, \`legal_name\`, \`country_code\`, \`region\`, \`city\`, \`address\`, \`description\`, \`website_url\`, \`phone\`, \`email\`, \`telegram_url\`, \`price_from\`, \`price_unit\`, \`experience_years\`, \`cover_image\`, \`tags\`, \`guarantees\`, \`verified\`, \`promoted\`, \`status\`, \`created_at\`, \`updated_at\`) VALUES (${esc(company.id)}, ${esc(company.slug)}, ${esc(company.name)}, ${esc(company.legalName)}, 'BY', ${esc(company.city === "Минск" ? "Минская" : null)}, ${esc(company.city)}, ${esc(company.address)}, ${esc(company.description)}, ${esc(company.websiteUrl)}, ${esc(company.phone)}, ${esc(company.email)}, ${esc(company.telegramUrl)}, ${num(company.priceFrom)}, ${esc(company.priceUnit)}, ${num(company.experienceYears)}, ${esc(company.coverImage)}, ${jsonArray(company.tags)}, ${jsonArray(company.guarantees)}, ${bool(company.verified)}, ${bool(company.promoted)}, 'published', ${num(seedTimestamp)}, ${num(seedTimestamp)});`
  );
}

// --- Категории компаний (junction table) ---
for (const company of seedCompanies) {
  for (const categoryId of company.categories) {
    statements.push(
      `INSERT INTO \`company_categories\` (\`company_id\`, \`category_id\`) VALUES (${esc(company.id)}, ${esc(categoryId)});`
    );
  }
}

// --- Источники рейтинга ---
for (const company of seedCompanies) {
  if (company.rating) {
    const ratingId = `${company.id}-rating`;
    statements.push(
      `INSERT INTO \`rating_sources\` (\`id\`, \`company_id\`, \`source\`, \`source_url\`, \`rating\`, \`review_count\`, \`captured_at\`) VALUES (${esc(ratingId)}, ${esc(company.id)}, ${esc(company.rating.source)}, ${esc(company.rating.sourceUrl)}, ${num(company.rating.rating)}, ${num(company.rating.reviewCount)}, ${num(seedTimestamp)});`
    );
  }
}

// --- Связи компаний с брендами (техника) ---
// Связь считается подтверждённой (и попадает в «Индекс доверия профи»), только если
// сама компания верифицирована; у остальных остаётся pending до проверки.
for (const company of seedCompanies) {
  for (const brandId of company.equipment) {
    const status = company.verified ? "verified" : "pending";
    const verifiedAt = company.verified ? num(seedTimestamp) : "NULL";
    statements.push(
      `INSERT INTO \`company_brands\` (\`company_id\`, \`brand_id\`, \`evidence_status\`, \`verified_at\`) VALUES (${esc(company.id)}, ${esc(brandId)}, '${status}', ${verifiedAt});`
    );
  }
}

// --- Продукты (с профилями безопасности для eligibility gate) ---
for (const product of seedProducts) {
  statements.push(
    `INSERT INTO \`products\` (\`id\`, \`brand_id\`, \`slug\`, \`name\`, \`category\`, \`description\`, \`ph\`, \`compatible_surfaces\`, \`prohibited_surfaces\`, \`status\`, \`created_at\`, \`updated_at\`) VALUES (${esc(product.id)}, ${esc(product.brandId)}, ${esc(product.slug)}, ${esc(product.name)}, ${esc(product.category)}, ${esc(product.description)}, ${num(product.ph)}, ${jsonArray(product.compatibleSurfaces)}, ${jsonArray(product.prohibitedSurfaces)}, '${product.status}', ${num(seedTimestamp)}, ${num(seedTimestamp)});`
  );
}

// --- Рекламные кампании (Ad Engine) ---
for (const camp of seedCampaigns) {
  statements.push(
    `INSERT INTO \`campaigns\` (\`id\`, \`brand_id\`, \`product_id\`, \`name\`, \`placement\`, \`status\`, \`starts_at\`, \`ends_at\`, \`target_countries\`, \`target_categories\`, \`target_surfaces\`, \`target_solutions\`, \`max_impressions\`, \`max_clicks\`, \`current_impressions\`, \`current_clicks\`, \`title\`, \`description\`, \`cta_text\`, \`cta_url\`, \`cta_type\`, \`badge_text\`, \`priority\`, \`created_at\`, \`updated_at\`) VALUES (${esc(camp.id)}, ${esc(camp.brandId)}, ${esc(camp.productId)}, ${esc(camp.name)}, '${camp.placement}', '${camp.status}', ${num(camp.startsAt)}, ${num(camp.endsAt)}, ${jsonArray(camp.targetCountries)}, ${jsonArray(camp.targetCategories)}, ${jsonArray(camp.targetSurfaces)}, ${jsonArray(camp.targetSolutions)}, ${num(camp.maxImpressions)}, ${num(camp.maxClicks)}, ${num(camp.currentImpressions)}, ${num(camp.currentClicks)}, ${esc(camp.title)}, ${esc(camp.description)}, ${esc(camp.ctaText)}, ${esc(camp.ctaUrl)}, ${esc(camp.ctaType)}, ${esc(camp.badgeText)}, ${num(camp.priority)}, ${num(seedTimestamp)}, ${num(seedTimestamp)});`
  );
}

// --- Продуктовый граф решений (Solutions) ---
for (const sol of seedSolutions) {
  statements.push(
    `INSERT INTO \`solutions\` (\`id\`, \`slug\`, \`title\`, \`problem_type\`, \`surface\`, \`material\`, \`severity\`, \`audience\`, \`diy_steps\`, \`warnings\`, \`when_to_call_pro\`, \`diy_cost_note\`, \`pro_time_note\`, \`search_keywords\`, \`related_category\`, \`status\`, \`created_at\`, \`updated_at\`) VALUES (${esc(sol.id)}, ${esc(sol.slug)}, ${esc(sol.title)}, '${sol.problemType}', '${sol.surface}', ${esc(sol.material)}, '${sol.severity}', '${sol.audience}', ${esc(JSON.stringify(sol.diySteps))}, ${jsonArray(sol.warnings)}, ${esc(sol.whenToCallPro)}, ${esc(sol.diyCostNote)}, ${esc(sol.proTimeNote)}, ${jsonArray(sol.searchKeywords)}, ${esc(sol.relatedCategory)}, '${sol.status}', ${num(seedTimestamp)}, ${num(seedTimestamp)});`
  );
}

// --- Рекомендуемые средства в протоколах ---
for (const sp of seedSolutionProducts) {
  statements.push(
    `INSERT INTO \`solution_products\` (\`id\`, \`solution_id\`, \`brand_id\`, \`product_id\`, \`role\`, \`note\`) VALUES (${esc(sp.id)}, ${esc(sp.solutionId)}, ${esc(sp.brandId)}, ${esc(sp.productId)}, '${sp.role}', ${esc(sp.note)});`
  );
}

// --- Ключевые слова интента для поиска ---
for (const kw of seedIntentKeywords) {
  statements.push(
    `INSERT INTO \`intent_keywords\` (\`id\`, \`keyword\`, \`intent\`, \`weight\`, \`target_kind\`, \`target_slug\`) VALUES (${esc(kw.id)}, ${esc(kw.keyword)}, '${kw.intent}', ${num(kw.weight)}, '${kw.targetKind}', ${esc(kw.targetSlug)});`
  );
}

// --- Сметы стоимости по рынкам (BY/RU/KZ) ---
for (const pe of seedPriceEstimates) {
  statements.push(
    `INSERT INTO \`price_estimates\` (\`id\`, \`solution_id\`, \`category_id\`, \`country_code\`, \`city\`, \`currency\`, \`price_min\`, \`price_max\`, \`unit\`, \`note\`) VALUES (${esc(pe.id)}, ${esc(pe.solutionId)}, ${esc(pe.categoryId)}, '${pe.countryCode}', ${esc(pe.city)}, '${pe.currency}', ${num(pe.priceMin)}, ${num(pe.priceMax)}, ${esc(pe.unit)}, ${esc(pe.note)});`
  );
}

const sqlContent = statements.join("\n");
const sqlPath = join(migrationsDir, "seed.sql");
writeFileSync(sqlPath, sqlContent, "utf-8");

console.log(`✓ Seed SQL generated: ${sqlPath}`);
console.log(`  ${statements.length} statements`);
console.log(`  ${seedBrands.length} brands, ${seedCompanies.length} companies`);
console.log(`  ${seedProducts.length} products, ${seedCampaigns.length} campaigns`);
console.log(`  ${seedCompanies.reduce((acc, c) => acc + c.categories.length, 0)} category links`);
console.log(`  ${seedCompanies.filter((c) => c.rating).length} rating sources`);
console.log(`  ${seedCompanies.reduce((acc, c) => acc + c.equipment.length, 0)} brand links`);
console.log("");
console.log("Apply with:");
console.log("  npx wrangler d1 execute cleaning-rating-db --local --file=migrations/seed.sql");
