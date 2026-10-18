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

const STOP_WORDS = new Set([
  "как", "чем", "где", "для", "на", "в", "во", "с", "со", "и", "или",
  "от", "из", "по", "у", "к", "о", "об", "не", "мой", "моя", "мои", "ли", "же", "это",
]);

/** Беглые гласные и корни-исключения в клининговой тематике (ковёр/ковра, пятно/пятен, запах, клей, шов/швы). */
const FLEETING_VOWEL_STEMS: Record<string, string> = {
  ковер: "ковр",
  пятен: "пятн",
  окон: "окн",
  стекол: "стекл",
  кресел: "кресл",
  полотенец: "полотенц",
  запах: "запах",
  клей: "кле",
  клеем: "кле",
  шов: "шов",
  шва: "шов",
  шве: "шов",
  швы: "шов",
  швов: "шов",
  швах: "шов",
  швами: "шов",
  шву: "шов",
  льда: "лед",
  льдом: "лед",
};

const RUSSIAN_SUFFIX_RE =
  /(?:иями|ями|ами|его|ого|ему|ому|ыми|ими|ешь|ите|ать|ять|ить|еть|уть|ти|ть|ей|ой|ий|ый|ая|яя|ое|ее|ые|ие|ов|ев|ам|ям|ах|ях|ом|ем|ую|юю|ью|ия|ии|ию|а|я|о|е|ы|и|у|ю|ь)$/i;

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ");
}

/**
 * Лёгкий русский стеммер без внешних зависимостей: нормализует ё→е,
 * схлопывает беглые гласные и отсекает падежные/множественные/глагольные окончания,
 * сохраняя корень длиной не менее 3 символов.
 */
export function stemRussian(word: string): string {
  const clean = word.trim().toLowerCase().replace(/ё/g, "е");
  if (!clean) return "";
  if (FLEETING_VOWEL_STEMS[clean]) return FLEETING_VOWEL_STEMS[clean];
  if (clean.length < 4) return clean;
  const stripped = clean.replace(RUSSIAN_SUFFIX_RE, "");
  const candidate = stripped.length >= 3 ? stripped : clean;
  return FLEETING_VOWEL_STEMS[candidate] ?? candidate;
}

/** Разбивает фразу на значимые русские/латинские основы слов (без предлогов и стоп-слов). */
export function tokenizeRussianStems(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/ё/g, "е")
    .split(/[^0-9a-zа-я]+/i)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token))
    .map(stemRussian)
    .filter(Boolean);
}

/**
 * Чистая функция классификации интента по словарю ключевых слов.
 * Совпадение — по вхождению подстроки в обе стороны ИЛИ по совпадению
 * морфологических основ (стеммов) во всех падежах и числах.
 * При нескольких совпадениях выигрывает наибольший вес, затем — самое длинное
 * совпавшее ключевое слово (более специфичный интент).
 */
export function classifyIntent(query: string, keywords: IntentKeyword[]): IntentClassification {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    return { intent: DEFAULT_INTENT, target: null, confidence: 0 };
  }

  const queryStems = tokenizeRussianStems(normalizedQuery);
  const queryStemSet = new Set(queryStems);

  let best: IntentKeyword | null = null;
  for (const entry of keywords) {
    const normalizedKeyword = normalize(entry.keyword);
    if (!normalizedKeyword) continue;

    let matches =
      normalizedQuery.includes(normalizedKeyword) || normalizedKeyword.includes(normalizedQuery);

    if (!matches && queryStems.length > 0) {
      const keywordStems = tokenizeRussianStems(normalizedKeyword);
      if (keywordStems.length > 0) {
        const allKeywordStemsInQuery = keywordStems.every((stem) => queryStemSet.has(stem));
        const allQueryStemsInKeyword =
          queryStems.length >= 2 && queryStems.every((stem) => keywordStems.includes(stem));
        matches = allKeywordStemsInQuery || allQueryStemsInKeyword;
      }
    }

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
