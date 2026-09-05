/**
 * Интент-роутер умного поиска CLEANHUB.
 *
 * Архитектура — адаптер `SearchProvider`: сейчас единственная реализация —
 * `KeywordProvider`, работающая на таблице `intent_keywords` (D1/seed), без
 * внешних вызовов. Позже подключается `AiProvider` (Workers AI embeddings)
 * за тем же интерфейсом, без изменения вызывающего кода (API route, UI).
 */

import type { IntentKeyword, IntentTargetKind, SearchIntent } from "@/lib/types";

export interface IntentTarget {
  kind: IntentTargetKind;
  slug: string;
}

export interface IntentClassification {
  intent: SearchIntent;
  target: IntentTarget | null;
  /** 0..1 — уверенность классификации. 0, если ни одно ключевое слово не совпало. */
  confidence: number;
  /** Ключевое слово из словаря, давшее лучшее совпадение (для отладки/аналитики). */
  matchedKeyword?: string;
}

const DEFAULT_INTENT: SearchIntent = "b2c";
const MAX_WEIGHT = 10;

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Чистая функция классификации интента по словарю ключевых слов.
 * Совпадение — по вхождению подстроки в обе стороны (запрос содержит ключ
 * или ключ содержит запрос), чтобы ловить как «диван», так и «диван кожаный».
 * При нескольких совпадениях выигрывает наибольший вес, затем — самое длинное
 * совпавшее ключевое слово (более специфичный интент).
 */
export function classifyIntent(query: string, keywords: IntentKeyword[]): IntentClassification {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    return { intent: DEFAULT_INTENT, target: null, confidence: 0 };
  }

  let best: IntentKeyword | null = null;
  for (const entry of keywords) {
    const normalizedKeyword = normalize(entry.keyword);
    if (!normalizedKeyword) continue;

    const matches = normalizedQuery.includes(normalizedKeyword) || normalizedKeyword.includes(normalizedQuery);
    if (!matches) continue;

    if (
      !best ||
      entry.weight > best.weight ||
      (entry.weight === best.weight && normalizedKeyword.length > normalize(best.keyword).length)
    ) {
      best = entry;
    }
  }

  if (!best) {
    return { intent: DEFAULT_INTENT, target: null, confidence: 0 };
  }

  return {
    intent: best.intent,
    target: { kind: best.targetKind, slug: best.targetSlug },
    confidence: Math.min(1, best.weight / MAX_WEIGHT),
    matchedKeyword: best.keyword,
  };
}

/**
 * Адаптер источника классификации — позволяет подменить движок
 * (ключевые слова → эмбеддинги) без изменения вызывающего кода.
 */
export interface SearchProvider {
  classify(query: string): Promise<IntentClassification> | IntentClassification;
}

/** Текущая реализация: работает на статическом/D1-словаре intent_keywords. */
export class KeywordProvider implements SearchProvider {
  constructor(private readonly keywords: IntentKeyword[]) {}

  classify(query: string): IntentClassification {
    return classifyIntent(query, this.keywords);
  }
}
