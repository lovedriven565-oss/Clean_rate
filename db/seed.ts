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
import { seedBrands, seedCategories, seedCompanies, seedTimestamp } from "./seed-data";

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
for (const company of seedCompanies) {
  for (const brandId of company.equipment) {
    statements.push(
      `INSERT INTO \`company_brands\` (\`company_id\`, \`brand_id\`, \`evidence_status\`) VALUES (${esc(company.id)}, ${esc(brandId)}, 'pending');`
    );
  }
}

const sqlContent = statements.join("\n");
const sqlPath = join(migrationsDir, "seed.sql");
writeFileSync(sqlPath, sqlContent, "utf-8");

console.log(`✓ Seed SQL generated: ${sqlPath}`);
console.log(`  ${statements.length} statements`);
console.log(`  ${seedBrands.length} brands, ${seedCompanies.length} companies`);
console.log(`  ${seedCompanies.reduce((acc, c) => acc + c.categories.length, 0)} category links`);
console.log(`  ${seedCompanies.filter((c) => c.rating).length} rating sources`);
console.log(`  ${seedCompanies.reduce((acc, c) => acc + c.equipment.length, 0)} brand links`);
console.log("");
console.log("Apply with:");
console.log("  npx wrangler d1 execute cleaning-rating-db --local --file=migrations/seed.sql");
