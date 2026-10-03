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
 * Чистая логика диагностики прототипа A (/dev/design/a-vitrina, этап 1.6).
 * Работает только на props (published-решения, сметы, seed-компании):
 * без сети, cookie, аналитики и выдуманных полей.
 */

/** Контекст прототипа фиксирован: Минск, Беларусь. Cookie ch_region не читается и не пишется. */
export const DIAGNOSTIC_CONTEXT = { countryCode: "BY", city: "Минск" } as const;

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

/** Roving-tabindex для radiogroup: индекс следующего элемента или null, если клавиша не навигационная. */
export function nextRadioIndex(key: string, current: number, length: number): number | null {
  if (length <= 0) return null;
  switch (key) {
    case "ArrowRight":
    case "ArrowDown":
      return (current + 1) % length;
    case "ArrowLeft":
    case "ArrowUp":
      return (current - 1 + length) % length;
    case "Home":
      return 0;
    case "End":
      return length - 1;
    default:
      return null;
  }
}

// --- Смета ---

/** Смета решения для Минска. Сметы по категориям (без solutionId) намеренно не используются. */
export function pickEstimate(estimates: PriceEstimate[], solution: Solution): PriceEstimate | null {
  const forSolution = estimates.filter(
    (e) => e.solutionId === solution.id && e.countryCode === DIAGNOSTIC_CONTEXT.countryCode,
  );
  return forSolution.find((e) => e.city === DIAGNOSTIC_CONTEXT.city) ?? forSolution[0] ?? null;
}

export interface EstimateView {
  min: string;
  max: string;
  unit?: string;
  note?: string;
  city: string;
}

export function formatEstimate(estimate: PriceEstimate): EstimateView {
  const currency = estimate.currency as "BYN" | "RUB" | "KZT";
  return {
    min: formatMarketCurrency(estimate.priceMin, currency),
    max: formatMarketCurrency(estimate.priceMax, currency),
    unit: estimate.unit,
    note: estimate.note,
    city: estimate.city ?? DIAGNOSTIC_CONTEXT.city,
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
): DiagnosticResult {
  const ordered = [...solution.diySteps].sort((a, b) => a.order - b.order);
  const steps = ordered.slice(0, maxSteps);
  const estimate = pickEstimate(estimates, solution);
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
    estimate: estimate ? formatEstimate(estimate) : null,
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

const covers = (company: Company, solution: Solution) =>
  !solution.relatedCategory || company.categories.includes(solution.relatedCategory);

/**
 * Органический порядок «по доверию»: релевантность категории, проверенный профиль,
 * подтверждённая внешняя оценка (балл, число отзывов), опыт, название.
 * Поле promoted здесь намеренно не читается: оплата на порядок не влияет.
 */
export function rankOrganicCompanies(list: Company[], solution: Solution): Company[] {
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

/** Спонсорский слот: только промо-компания города, подходящая по категории решения. */
export function pickSponsor(list: Company[], solution: Solution): Company | null {
  const candidates = list.filter((c) => c.promoted && c.city === DIAGNOSTIC_CONTEXT.city && covers(c, solution));
  return rankOrganicCompanies(candidates, solution)[0] ?? null;
}

export interface ProCompanies {
  sponsor: Company | null;
  organic: Company[];
}

export function buildProCompanies(
  list: Company[],
  solution: Solution,
  options: { limit?: number } = {},
): ProCompanies {
  const inCity = list.filter((c) => c.city === DIAGNOSTIC_CONTEXT.city);
  const sponsor = pickSponsor(inCity, solution);
  const organic = rankOrganicCompanies(inCity, solution)
    .filter((c) => c.id !== sponsor?.id)
    .slice(0, options.limit ?? PRO_COMPANY_LIMIT);
  return { sponsor, organic };
}

/** Цена «от» без выдуманных значений; валюта в единице измерения (например «BYN/мес») убирается. */
export function companyPriceLabel(company: Pick<Company, "priceFrom" | "priceUnit" | "city">): string {
  if (!company.priceFrom) return "Цена по запросу";
  const unit = company.priceUnit?.replace(/^(BYN|Br|руб\.?)\s*\//i, "");
  return `от ${formatCompanyPriceFrom(company.priceFrom, { city: company.city, priceUnit: unit })}`;
}
