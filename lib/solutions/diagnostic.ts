import type {
  Company,
  DiyStep,
  PriceEstimate,
  Solution,
  SolutionProblemType,
  SolutionSurface,
} from "@/lib/types";
import { formatCompanyPriceFrom, formatMarketCurrency } from "@/lib/format";
import { PROBLEM_TYPES, PROBLEM_TYPE_LABELS, SURFACES, SURFACE_LABELS } from "@/lib/solutions/meta";

/**
 * Чистая логика диагностики «поверхность → проблема → протокол».
 * Работает только на данных (published-решения, сметы, компании):
 * без сети, cookie, аналитики и выдуманных полей.
 *
 * Контекст региона передаётся параметром (прод: регион из RegionProvider);
 * по умолчанию — DIAGNOSTIC_CONTEXT (Минск, BY), на нём же живут dev-прототипы.
 */

export interface DiagnosticContext {
  countryCode: string;
  city: string;
}

export const DIAGNOSTIC_CONTEXT: DiagnosticContext = { countryCode: "BY", city: "Минск" } as const;

export const DIAGNOSTIC_RISK_NOTE =
  "Справочная информация, не оферта и не гарантия результата. Проверьте на незаметном участке и следуйте инструкции производителя: ответственность за применение за вами.";

export const DIAGNOSTIC_STEP_LIMIT = 2;
export const PRO_COMPANY_LIMIT = 3;

export interface SurfaceOption {
  id: SolutionSurface;
  label: string;
  count: number;
}

export interface ProblemOption {
  id: SolutionProblemType;
  label: string;
  count: number;
}

export interface DiagnosticSelection {
  surface?: SolutionSurface;
  problem?: SolutionProblemType;
  /** slug протокола, если для сочетания их несколько */
  variant?: string;
}

export interface ResolvedSelection {
  surface: SolutionSurface | null;
  problem: SolutionProblemType | null;
  protocols: Solution[];
  solution: Solution | null;
}

const published = (solutions: Solution[]) => solutions.filter((s) => s.status === "published");

export function listSurfaces(solutions: Solution[]): SurfaceOption[] {
  const list = published(solutions);
  return SURFACES.map((id) => ({ id, label: SURFACE_LABELS[id], count: list.filter((s) => s.surface === id).length })).filter(
    (option) => option.count > 0,
  );
}

export function listProblems(solutions: Solution[], surface: SolutionSurface): ProblemOption[] {
  const list = published(solutions).filter((s) => s.surface === surface);
  return PROBLEM_TYPES.map((id) => ({ id, label: PROBLEM_TYPE_LABELS[id], count: list.filter((s) => s.problemType === id).length })).filter(
    (option) => option.count > 0,
  );
}

/** Все типы проблем со счётчиками по published-решениям — для первого шага диагностики главной. */
export function listAllProblems(solutions: Solution[]): ProblemOption[] {
  const list = published(solutions);
  return PROBLEM_TYPES.map((id) => ({ id, label: PROBLEM_TYPE_LABELS[id], count: list.filter((s) => s.problemType === id).length })).filter(
    (option) => option.count > 0,
  );
}

export function findProtocols(solutions: Solution[], surface: SolutionSurface, problem: SolutionProblemType): Solution[] {
  return published(solutions).filter((s) => s.surface === surface && s.problemType === problem);
}

/** Приводит выбор к существующему: неизвестные поверхность/проблема/вариант заменяются первыми доступными. */
export function resolveSelection(solutions: Solution[], selection: DiagnosticSelection): ResolvedSelection {
  const surfaces = listSurfaces(solutions);
  const surface = surfaces.find((s) => s.id === selection.surface)?.id ?? surfaces[0]?.id ?? null;
  if (!surface) return { surface: null, problem: null, protocols: [], solution: null };
  const problems = listProblems(solutions, surface);
  const problem = problems.find((p) => p.id === selection.problem)?.id ?? problems[0]?.id ?? null;
  if (!problem) return { surface, problem: null, protocols: [], solution: null };
  const protocols = findProtocols(solutions, surface, problem);
  const solution = protocols.find((s) => s.slug === selection.variant) ?? protocols[0] ?? null;
  return { surface, problem, protocols, solution };
}

export { nextRadioIndex } from "@/lib/utils";

// --- Смета ---

/**
 * Смета решения для региона: предпочитаем точную по городу, иначе первую по стране.
 * Сметы по категориям (без solutionId) намеренно не используются.
 */
export function pickEstimate(
  estimates: PriceEstimate[],
  solution: Solution,
  ctx: DiagnosticContext = DIAGNOSTIC_CONTEXT,
): PriceEstimate | null {
  const forSolution = estimates.filter(
    (e) => e.solutionId === solution.id && e.countryCode === ctx.countryCode,
  );
  return forSolution.find((e) => e.city === ctx.city) ?? forSolution[0] ?? null;
}

export interface EstimateView {
  min: string;
  max: string;
  unit?: string;
  note?: string;
  city: string;
}

export function formatEstimate(estimate: PriceEstimate, ctx: DiagnosticContext = DIAGNOSTIC_CONTEXT): EstimateView {
  const currency = estimate.currency as "BYN" | "RUB" | "KZT";
  return {
    min: formatMarketCurrency(estimate.priceMin, currency),
    max: formatMarketCurrency(estimate.priceMax, currency),
    unit: estimate.unit,
    note: estimate.note,
    city: estimate.city ?? ctx.city,
  };
}

// --- Результат диагностики ---

export interface DiagnosticResult {
  slug: string;
  title: string;
  href: string;
  /** «Не делайте» выводится первым блоком */
  warnings: string[];
  steps: DiyStep[];
  totalSteps: number;
  hiddenSteps: number;
  whenToCallPro: string;
  diyCostNote?: string;
  proTimeNote?: string;
  estimate: EstimateView | null;
}

export function buildDiagnosticResult(
  solution: Solution,
  estimates: PriceEstimate[],
  maxSteps: number = DIAGNOSTIC_STEP_LIMIT,
  ctx: DiagnosticContext = DIAGNOSTIC_CONTEXT,
): DiagnosticResult {
  const ordered = [...solution.diySteps].sort((a, b) => a.order - b.order);
  const steps = ordered.slice(0, maxSteps);
  const estimate = pickEstimate(estimates, solution, ctx);
  return {
    slug: solution.slug,
    title: solution.title,
    href: `/solutions/${solution.slug}`,
    warnings: solution.warnings,
    steps,
    totalSteps: ordered.length,
    hiddenSteps: ordered.length - steps.length,
    whenToCallPro: solution.whenToCallPro,
    diyCostNote: solution.diyCostNote,
    proTimeNote: solution.proTimeNote,
    estimate: estimate ? formatEstimate(estimate, ctx) : null,
  };
}

// --- Компании ---

/** tel: с реальным номером: оставляем цифры и ведущий плюс. */
export function telHref(phone: string): string {
  const trimmed = phone.trim();
  return `tel:${trimmed.startsWith("+") ? "+" : ""}${trimmed.replace(/\D/g, "")}`;
}

export interface ExternalRating {
  value: number;
  count: number;
  source: "Google" | "Яндекс";
}

/** Рейтинг публикуется только при подтверждённом внешнем источнике (Google/Яндекс) и наличии отзывов. */
export function externalRating(
  company: Pick<Company, "ratingSource" | "baseRating" | "reviewCount">,
): ExternalRating | null {
  const { ratingSource: source, baseRating, reviewCount } = company;
  if ((source !== "google" && source !== "yandex") || reviewCount <= 0 || baseRating <= 0) return null;
  return { value: baseRating, count: reviewCount, source: source === "google" ? "Google" : "Яндекс" };
}

export const covers = (company: Company, solution?: Pick<Solution, "relatedCategory">) =>
  !solution?.relatedCategory || company.categories.includes(solution.relatedCategory);

/**
 * Органический порядок «по доверию»: релевантность категории, проверенный профиль,
 * подтверждённая внешняя оценка (балл, число отзывов), опыт, название.
 * Поле promoted здесь намеренно не читается: оплата на порядок не влияет.
 * Без решения релевантность категории не учитывается (общая подборка компаний).
 */
export function rankOrganicCompanies(list: Company[], solution?: Pick<Solution, "relatedCategory">): Company[] {
  const key = (c: Company) => {
    const rating = externalRating(c);
    return [
      covers(c, solution) ? 1 : 0,
      c.verified ? 1 : 0,
      rating ? 1 : 0,
      rating?.value ?? 0,
      rating?.count ?? 0,
      c.experienceYears ?? 0,
    ];
  };
  return [...list].sort((a, b) => {
    const ka = key(a);
    const kb = key(b);
    for (let i = 0; i < ka.length; i++) if (ka[i] !== kb[i]) return kb[i] - ka[i];
    return a.name.localeCompare(b.name, "ru");
  });
}

/** Спонсорский слот: только промо-компания из городов региона, подходящая по категории решения. */
export function pickSponsor(
  list: Company[],
  solution: Solution,
  cities: readonly string[] = [DIAGNOSTIC_CONTEXT.city],
): Company | null {
  const candidates = list.filter((c) => c.promoted && cities.includes(c.city) && covers(c, solution));
  return rankOrganicCompanies(candidates, solution)[0] ?? null;
}

export interface ProCompanies {
  sponsor: Company | null;
  organic: Company[];
}

export function buildProCompanies(
  list: Company[],
  solution: Solution,
  options: { limit?: number; cities?: readonly string[] } = {},
): ProCompanies {
  const cities = options.cities ?? [DIAGNOSTIC_CONTEXT.city];
  const inRegion = list.filter((c) => cities.includes(c.city));
  const sponsor = pickSponsor(inRegion, solution, cities);
  const organic = rankOrganicCompanies(inRegion, solution)
    .filter((c) => c.id !== sponsor?.id)
    .slice(0, options.limit ?? PRO_COMPANY_LIMIT);
  return { sponsor, organic };
}

export interface EscalationOffer {
  /** Нижняя граница сметы мастера в валюте рынка («60 Br»), null — сметы для рынка нет. */
  priceFrom: string | null;
  unit?: string;
  /** Первая органическая компания региона с прямым контактом; спонсор сюда не попадает. */
  company: Company | null;
}

/**
 * Мостик в конце DIY-протокола: смета «от» и мастер для быстрого звонка.
 * Компания берётся из органического порядка (как в блоке «Вызвать мастера»), без учёта оплаты.
 */
export function buildEscalation(
  solution: Solution,
  estimates: PriceEstimate[],
  companies: Company[],
  ctx: DiagnosticContext & { cities?: readonly string[] } = DIAGNOSTIC_CONTEXT,
): EscalationOffer {
  const estimate = pickEstimate(estimates, solution, ctx);
  const { organic } = buildProCompanies(companies, solution, { cities: ctx.cities ?? [ctx.city], limit: companies.length });
  const company = organic.find((c) => covers(c, solution) && (c.phone || c.telegramUrl)) ?? null;
  return {
    priceFrom: estimate ? formatMarketCurrency(estimate.priceMin, estimate.currency as "BYN" | "RUB" | "KZT") : null,
    unit: estimate?.unit,
    company,
  };
}

/** Цена «от» без выдуманных значений; валюта в единице измерения (например «BYN/мес») убирается. */
export function companyPriceLabel(company: Pick<Company, "priceFrom" | "priceUnit" | "city">): string {
  if (!company.priceFrom) return "Цена по запросу";
  const unit = company.priceUnit?.replace(/^(BYN|Br|руб\.?)\s*\//i, "");
  return `от ${formatCompanyPriceFrom(company.priceFrom, { city: company.city, priceUnit: unit })}`;
}
