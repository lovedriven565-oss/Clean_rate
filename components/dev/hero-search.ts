import type { Solution, SolutionAudience } from "@/lib/types";
import { mergeRanked, rankSolutions, rankSolutionsByTokens } from "@/lib/search/rank";

/**
 * Локальный поиск прототипа A (/dev/design/a-vitrina).
 * Работает только на props Solution[] (опубликованные решения из
 * getFallbackSolutions) — без /api/search, D1, AI и аналитики.
 */

export type HeroAudience = "b2c" | "b2b" | "pro";

export const HERO_SEARCH_LIMIT = 5;

export interface HeroSearchItem {
  slug: string;
  title: string;
  href: `/solutions/${string}`;
}

export function normalizeHeroQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, " ");
}

function audienceMatches(solutionAudience: SolutionAudience, audience: HeroAudience): boolean {
  return solutionAudience === "both" || solutionAudience === audience;
}

/**
 * Возвращает до HERO_SEARCH_LIMIT опубликованных решений, подходящих запросу
 * и аудитории. "pro" не соответствует SolutionAudience (b2c|b2b|both): для неё
 * результат честно пуст — UI показывает границу и ссылку на /brands,
 * фиктивные pro-решения не выдумываются.
 */
export function searchHeroSolutions(
  query: string,
  audience: HeroAudience,
  solutions: Solution[],
): HeroSearchItem[] {
  const normalized = normalizeHeroQuery(query);
  if (!normalized || audience === "pro") return [];

  const eligible = solutions.filter(
    (s) => s.status === "published" && audienceMatches(s.audience, audience),
  );
  const ranked = mergeRanked(
    rankSolutions(eligible, normalized, null),
    rankSolutionsByTokens(eligible, normalized),
  );
  return ranked.slice(0, HERO_SEARCH_LIMIT).map((s) => ({
    slug: s.slug,
    title: s.title,
    href: `/solutions/${s.slug}`,
  }));
}

/**
 * Куда ведёт submit формы: первая подсказка или null.
 * Пустой запрос и отсутствие совпадений не навигируют — UI показывает
 * no-match c настоящей ссылкой на /solutions.
 */
export function heroSubmitTarget(items: HeroSearchItem[]): string | null {
  return items[0]?.href ?? null;
}

/** До 3 коротких примеров-чипов из первых searchKeywords опубликованных решений. */
export function heroExampleChips(solutions: Solution[], limit = 3): string[] {
  return solutions
    .filter((s) => s.status === "published" && s.searchKeywords.length > 0)
    .slice(0, limit)
    .map((s) => s.searchKeywords[0]);
}
