import { isCategoryId } from "@/lib/categories";
import { formatMarketCurrency } from "@/lib/format";
import { ENABLED_MARKETS, MARKETS, openCities, type CountryCode } from "@/lib/markets";
import type { CategoryId } from "@/lib/types";

export type PartnerPlan = "base" | "pro";

/** Ориентир медиа-бюджета PRO Спонсор по рынку (плейсхолдер: утверждает владелец). */
export const PRO_BUDGET_FROM: Record<CountryCode, number> = { BY: 149, RU: 4500, KZ: 24000 };

export const NON_OFFER_DISCLAIMER =
  "Не является публичной офертой. Информационный ориентир медиа-бюджета; размещение оформляется прямым B2B-договором вне сайта.";

/** «от 149 Br/мес», «от 4 500 ₽/мес», «от 24 000 ₸/мес» — в валюте рынка (Intl, неразрывные пробелы). */
export function formatProBudget(countryCode: CountryCode): string {
  return `от ${formatMarketCurrency(PRO_BUDGET_FROM[countryCode], MARKETS[countryCode])}/мес`;
}

export interface PartnerPrefill {
  companyName?: string;
  city?: string;
  plan?: PartnerPlan;
  categoryIds: CategoryId[];
}

const MAX_COMPANY_LENGTH = 120;

/**
 * Авто-заполнение формы партнёра из ссылки профиля компании:
 * `?company=&city=&plan=&categories=a,b`. Невалидные значения отбрасываются: город — только открытый,
 * категории — только известные. null — в ссылке нечего подставить.
 */
export function parsePartnerPrefill(params: URLSearchParams): PartnerPrefill | null {
  const company = params.get("company")?.trim().slice(0, MAX_COMPANY_LENGTH);
  const cityParam = params.get("city")?.trim();
  const planParam = params.get("plan");
  const city = ENABLED_MARKETS.flatMap(openCities).find((c) => c.name === cityParam)?.name;
  const plan = planParam === "base" || planParam === "pro" ? planParam : undefined;
  const categoryIds = Array.from(
    new Set((params.get("categories") ?? "").split(",").map((id) => id.trim()).filter(isCategoryId))
  );

  const prefill: PartnerPrefill = {
    companyName: company && company.length >= 2 ? company : undefined,
    city,
    plan,
    categoryIds,
  };
  return prefill.companyName || prefill.city || prefill.plan || categoryIds.length > 0 ? prefill : null;
}

/** Ссылка «Подтвердить профиль» / «Занять PRO-слот» со страницы компании — сразу к форме. */
export function partnerClaimHref(
  company: { name: string; city: string; categories: readonly string[] },
  plan: PartnerPlan
): string {
  const params = new URLSearchParams({ company: company.name, city: company.city, plan });
  if (company.categories.length > 0) params.set("categories", company.categories.join(","));
  return `/for-partners?${params.toString()}#partner-form`;
}
