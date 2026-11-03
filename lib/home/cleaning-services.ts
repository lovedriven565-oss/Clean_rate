import { companyPriceLabel, rankOrganicCompanies } from "@/lib/solutions/diagnostic";
import type { CategoryId, Company, PriceEstimate } from "@/lib/types";

export interface CleaningService {
  id: CategoryId;
  label: string;
}

/** Шесть денежных услуг для режима «Вызвать клининг» на первом экране. */
export const CLEANING_SERVICES: readonly CleaningService[] = [
  { id: "apartments", label: "Уборка квартир" },
  { id: "post-renovation", label: "После ремонта" },
  { id: "upholstery", label: "Химчистка мебели" },
  { id: "deep-cleaning", label: "Генеральная уборка" },
  { id: "windows", label: "Мытьё окон" },
  { id: "offices", label: "Офисы" },
];

/** Смета категории: точная по городу, иначе первая по стране; сметы решений (solutionId) не берём. */
export function pickCategoryEstimate(
  estimates: PriceEstimate[],
  categoryId: CategoryId,
  ctx: { countryCode: string; city: string },
): PriceEstimate | null {
  const list = estimates.filter((e) => !e.solutionId && e.categoryId === categoryId && e.countryCode === ctx.countryCode);
  return list.find((e) => e.city === ctx.city) ?? list[0] ?? null;
}

/** Лучшая органическая компания города по категории; оплата (promoted) на выбор не влияет. */
export function pickTopCompany(companies: Company[], categoryId: CategoryId, city: string): Company | null {
  const inCity = companies.filter((c) => c.city === city && c.categories.includes(categoryId));
  return rankOrganicCompanies(inCity)[0] ?? null;
}

/**
 * Цена в карточке клинера: «от X» только когда единица прайса компании совпадает
 * с единицей сметы выбранной услуги — иначе честная «Цена по запросу».
 */
export function cleanerCardPrice(
  company: Pick<Company, "priceFrom" | "priceUnit" | "city">,
  serviceUnit: string | null | undefined,
): string {
  const unit = company.priceUnit?.replace(/^(BYN|Br|руб\.?)\s*\//i, "");
  if (!company.priceFrom || !serviceUnit || unit !== serviceUnit) return "Цена по запросу";
  return companyPriceLabel(company);
}
