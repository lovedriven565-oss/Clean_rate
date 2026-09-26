import type { Solution, SolutionAudience, SolutionProblemType, SolutionSeverity, SolutionSurface } from "@/lib/types";

/** Человекочитаемые подписи для фасетов графа решений — единый источник для фильтров, карточек и SEO. */

export const PROBLEM_TYPE_LABELS: Record<SolutionProblemType, string> = {
  stain: "Пятна",
  odor: "Запахи",
  scale: "Налёт и камень",
  postrenovation: "После ремонта",
  general: "Уборка",
};

export const SURFACE_LABELS: Record<SolutionSurface, string> = {
  upholstery: "Мебель",
  mattress: "Матрас",
  carpet: "Ковёр",
  floor: "Пол",
  window: "Окна",
  facade: "Фасад",
  kitchen: "Кухня",
  bathroom: "Ванная",
  other: "Другое",
};

export const SEVERITY_LABELS: Record<SolutionSeverity, string> = {
  fresh: "Свежее",
  set: "Застарелое",
  extreme: "Сложный случай",
};

export const AUDIENCE_LABELS: Record<SolutionAudience, string> = {
  b2c: "Для дома",
  b2b: "Для бизнеса",
  both: "Дом и бизнес",
};

export const PROBLEM_TYPES = Object.keys(PROBLEM_TYPE_LABELS) as SolutionProblemType[];
export const SURFACES = Object.keys(SURFACE_LABELS) as SolutionSurface[];

export function isProblemType(value: string | null | undefined): value is SolutionProblemType {
  return !!value && value in PROBLEM_TYPE_LABELS;
}

export function isSurface(value: string | null | undefined): value is SolutionSurface {
  return !!value && value in SURFACE_LABELS;
}

/** Короткое описание для карточек и meta description — первый шаг протокола без хвоста. */
export function solutionSummary(solution: Solution, maxLength = 150): string {
  const first = solution.diySteps[0]?.instruction ?? solution.whenToCallPro;
  if (first.length <= maxLength) return first;
  const cut = first.slice(0, maxLength);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

/** Похожие решения: сначала та же поверхность, затем тот же тип проблемы, затем та же категория. */
export function relatedSolutions(solution: Solution, all: Solution[], limit = 3): Solution[] {
  const others = all.filter((s) => s.slug !== solution.slug);
  const score = (s: Solution) =>
    (s.surface === solution.surface ? 4 : 0) +
    (s.problemType === solution.problemType ? 2 : 0) +
    (s.relatedCategory && s.relatedCategory === solution.relatedCategory ? 1 : 0);
  return others
    .map((s) => ({ s, score: score(s) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ s }) => s);
}
