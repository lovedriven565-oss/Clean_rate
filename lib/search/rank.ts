import type { IntentClassification } from "./intent-router";
import type { Solution } from "@/lib/types";

export function matchesQuery(haystacks: Array<string | undefined>, needle: string): boolean {
  return haystacks.some((value) => value?.toLowerCase().includes(needle));
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

const SEARCH_STOP_WORDS = new Set([
  "как", "чем", "где", "для", "на", "в", "во", "с", "со", "и", "или",
  "от", "из", "по", "у", "не", "мой", "моя", "мои", "ли", "же", "это",
]);

/**
 * Грубый стем: первые 4 символа для длинных токенов ловят падежи
 * («дивана» → «дива» ⊂ «диване», «вино» ⊂ «вина…» не сработает — но «вино»
 * и так входит в ключ «вино на диване» как подстрока).
 */
function tokenStem(token: string): string {
  return token.length > 4 ? token.slice(0, 4) : token;
}

/**
 * Токен-ранкер: запрос разбивается на слова, каждое слово проверяется
 * вхождением стема в «заголовок + ключевые слова» протокола. Ловит
 * естественные формулировки («как вывести вино с дивана»), которые
 * не совпадают с ключом целиком. Используется как дополнение к
 * rankSolutions — целевой протокол от классификатора остаётся первым.
 */
export function rankSolutionsByTokens(solutions: Solution[], normalizedQuery: string): Solution[] {
  const tokens = normalizedQuery
    .split(/[^0-9a-zа-яё]+/i)
    .filter((t) => t.length > 1 && !SEARCH_STOP_WORDS.has(t));
  if (tokens.length === 0) return [];

  const scored = solutions
    .map((s) => {
      const text = [s.title, ...s.searchKeywords].join(" ").toLowerCase();
      const hits = tokens.reduce((sum, t) => sum + (text.includes(tokenStem(t)) ? 1 : 0), 0);
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
