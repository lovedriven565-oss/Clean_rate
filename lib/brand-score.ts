import type { Brand, BrandFocus, BrandScore, RankedBrand } from "./types";

/**
 * Веса «Индекса доверия профи». Формула публична и показывается пользователю:
 * верифицированная компания на бренде весит больше, чем упоминание в протоколе, а клики —
 * лишь слабый сигнал интереса.
 */
export const BRAND_SCORE_WEIGHTS = {
  verifiedCompany: 3,
  recommended: 2,
  alternative: 1,
  click: 1,
} as const;

export type BrandScoreInput = Omit<BrandScore, "score" | "adoptionScore" | "interestScore">;

/** Подсчёт реальной доли использования (верифицированные компании + протоколы) без учёта кликов. */
export function computeAdoptionScore(input: BrandScoreInput): number {
  return (
    input.verifiedCompanyCount * BRAND_SCORE_WEIGHTS.verifiedCompany +
    input.recommendedCount * BRAND_SCORE_WEIGHTS.recommended +
    input.alternativeCount * BRAND_SCORE_WEIGHTS.alternative
  );
}

/** Подсчёт интереса аудитории (только переходы/клики). */
export function computeInterestScore(input: BrandScoreInput): number {
  return input.clickCount;
}

export function computeBrandScore(input: BrandScoreInput): BrandScore {
  const adoptionScore = computeAdoptionScore(input);
  const interestScore = computeInterestScore(input);
  const score = adoptionScore + interestScore * BRAND_SCORE_WEIGHTS.click;
  return { ...input, score, adoptionScore, interestScore };
}

export function emptyBrandScore(brandId: string): BrandScore {
  return computeBrandScore({ brandId, verifiedCompanyCount: 0, recommendedCount: 0, alternativeCount: 0, clickCount: 0 });
}

/** Сортировка по индексу; при равенстве — по верифицированным компаниям, затем по имени. */
export function rankBrands(brands: Brand[], scores: Map<string, BrandScore>): RankedBrand[] {
  return brands
    .map((brand) => ({ ...brand, metrics: scores.get(brand.id) ?? emptyBrandScore(brand.id) }))
    .sort(
      (a, b) =>
        b.metrics.score - a.metrics.score ||
        b.metrics.verifiedCompanyCount - a.metrics.verifiedCompanyCount ||
        a.name.localeCompare(b.name, "ru")
    );
}

/**
 * Бренды-лидеры по фокусу (химия / техника / инвентарь). Плашку «Выбор профессионалов» получает
 * только бренд с ненулевым индексом — пустой лидерборд не раздаёт статусы.
 */
export function prosChoiceIds(ranked: RankedBrand[]): Set<string> {
  const winners = new Set<string>();
  const seen = new Set<BrandFocus>();
  for (const brand of ranked) {
    if (brand.metrics.score <= 0 || seen.has(brand.focus)) continue;
    seen.add(brand.focus);
    winners.add(brand.id);
  }
  return winners;
}
