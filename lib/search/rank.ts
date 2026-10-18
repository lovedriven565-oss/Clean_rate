import { tokenizeRussianStems, type IntentClassification } from "./intent-router";
import type { Solution } from "@/lib/types";

export function matchesQuery(haystacks: Array<string | undefined>, needle: string): boolean {
  const normalizedNeedle = needle.toLowerCase().replace(/ё/g, "е");
  return haystacks.some((value) => value?.toLowerCase().replace(/ё/g, "е").includes(normalizedNeedle));
}

export function rankSolutions(
  solutions: Solution[],
  normalizedQuery: string,
  target: IntentClassification["target"]
): Solution[] {
  const bySlug = target?.kind === "solution" ? solutions.find((s) => s.slug === target.slug) : undefined;
  const matched = solutions.filter(
    (s) => s.slug !== bySlug?.slug && matchesQuery([s.title, ...s.searchKeywords], normalizedQuery)
  );
  return [...(bySlug ? [bySlug] : []), ...matched];
}

/**
 * Токен-ранкер с русской морфологией: запрос и текст протокола разбиваются
 * на значимые основы слов (`tokenizeRussianStems`), что позволяет находить
 * протоколы в любых падежах и числах («пятно от вина», «запах на ковре»,
 * «почистить матраса», «после ремонтов»).
 */
export function rankSolutionsByTokens(solutions: Solution[], normalizedQuery: string): Solution[] {
  const queryStems = tokenizeRussianStems(normalizedQuery);
  if (queryStems.length === 0) return [];

  const scored = solutions
    .map((s) => {
      const combined = [s.title, ...s.searchKeywords].join(" ");
      const docStems = new Set(tokenizeRussianStems(combined));
      const rawText = combined.toLowerCase().replace(/ё/g, "е");
      const hits = queryStems.reduce(
        (sum, stem) => sum + (docStems.has(stem) || rawText.includes(stem) ? 1 : 0),
        0
      );
      return { solution: s, hits };
    })
    .filter((x) => x.hits > 0);
  scored.sort((a, b) => b.hits - a.hits);
  return scored.map((x) => x.solution);
}

/** Объединение двух ранкеров без дублей, порядок первого сохраняется. */
export function mergeRanked(first: Solution[], second: Solution[]): Solution[] {
  return [...new Map([...first, ...second].map((s) => [s.id, s])).values()];
}
