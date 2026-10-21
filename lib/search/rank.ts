import { SURFACE_LABELS } from "@/lib/solutions/meta";
import { tokenizeRussianStems, type IntentClassification } from "./intent-router";
import type { Solution } from "@/lib/types";

/**
 * Бытовые и химические синонимы по протоколам (по id или slug):
 * узкие протоколы содержат только маркеры самого загрязнения (без общих слов «окно», «диван», «пол»),
 * чтобы общий запрос «как помыть окно» не попадал в аварийный послестрой со скребком.
 */
export const SOLUTION_CHEMICAL_ALIASES: Record<string, string[]> = {
  "vino-na-divane": [
    "вино", "сок", "морс", "чай", "ягоды", "компот", "глинтвейн", "шампанское", "кола",
    "гранат", "вишня", "клубника", "черника", "свекла", "танин",
  ],
  "kofe-na-tekstile": [
    "кофе", "какао", "латте", "капучино", "эспрессо", "шоколад", "мороженое", "сливки",
    "молоко", "смесь", "йогурт", "соус", "подлива", "крем", "тирамису",
  ],
  "krov-na-matrase": [
    "кровь", "кровавый", "рана", "носом", "гемоглобин", "белок", "перекись",
  ],
  "mocha-i-zapah-matras": [
    "моча", "писал", "описался", "памперс", "горшок", "рвота", "тошнота", "ураты", "аммиак",
  ],
  "zapah-zhivotnyh-kover": [
    "кот", "кошка", "кошачий", "собака", "пес", "щенок", "котенок", "животное", "питомец",
    "метка", "пометил", "напрудил", "написал", "лоток",
  ],
  "flomaster-ruchka-na-divane": [
    "чернила", "паста", "шариковая", "гелевая", "маркер", "фломастер", "карандаш", "краска",
    "гуашь", "акварель", "зеленка", "йод", "помада", "тушь", "косметика", "штамп", "нарисовал",
  ],
  "vosk-zhvachka-na-kovre": [
    "жвачка", "жевательная", "резинка", "воск", "свеча", "свечка", "парафин", "стеарин",
    "пластилин", "слайм", "лизун", "смола", "прилипла",
  ],
  "poslestroy-zatirka-plitka": [
    "затирка", "фуга", "цемент", "плиточный", "раствор", "шпаклевка", "штукатурка", "гипс",
    "строительная", "послестрой",
  ],
  "poslestroy-okna-skotch": [
    "скотч", "лента", "малярный", "пленка", "наклейка", "стикер", "этикетка", "грунтовка",
    "монтажная", "пена", "прикипела",
  ],
  "zhir-vytyazhka-kuhnya": [
    "жир", "липкий", "масло", "копоть", "нагар", "гарь", "вытяжка", "решетка", "фильтр", "фартук",
  ],
  "vodny-kamen-dushevaya": [
    "известковый", "камень", "кальций", "жесткая", "белесый", "душ", "душевая", "кабина", "перегородка", "лейка",
  ],
  "nalet-chernaya-santehnika": [
    "черный", "черная", "матовый", "матовая", "смеситель", "кран", "облез", "посветлел", "pvd",
  ],
  "chernaya-plesen-shvy-vannaya": [
    "плесень", "грибок", "чернота", "черные", "почернел", "шов", "швы", "герметик", "силикон",
  ],
  "sledy-reziny-kleya-laminat": [
    "полосы", "подошва", "обувь", "колесики", "резина", "клей", "скотч",
  ],
  "zapah-syrosti-posle-potopa": [
    "потоп", "затопили", "залили", "соседи", "прорвало", "труба", "стояк", "сырость",
    "затхлый", "подвал", "сушка", "осушитель", "озонирование", "стяжка",
  ],
  "uborka-ofisa-posle-korporativa": [
    "офис", "корпоратив", "вечеринка", "праздник", "мероприятие", "бизнес", "коммерческий",
    "переговорная", "безнал", "договор", "акт",
  ],
  // Базовые технологические гиды (для частых общих вопросов)
  "guide-moika-okon-bez-razvodov": [
    "окно", "окна", "стекло", "стекла", "стеклопакет", "рама", "подоконник",
    "балкон", "лоджия", "зеркало", "разводы", "склидж", "водосгон", "окн",
  ],
  "guide-zapah-i-moika-holodilnika": [
    "холодильник", "морозилка", "морозильная", "камера", "полки", "дренаж", "протухло", "рыба", "мясо",
  ],
  "guide-chistka-duhovki-mikrovolnovki": [
    "духовка", "духовой", "противень", "микроволновка", "свч", "печь", "пригорело", "стеклокерамика", "плита",
  ],
  "guide-moika-pola-bez-razvodov": [
    "пол", "полы", "ламинат", "паркет", "кварцвинил", "линолеум", "швабра", "моп",
  ],
  "guide-obshchaya-chistka-divana": [
    "диван", "кресло", "обивка", "подлокотник", "засаленный", "мягкая", "мебель",
  ],
  "guide-obshchaya-chistka-kovra": [
    "ковер", "ковролин", "дорожка", "ворс", "палас", "ковр",
  ],
  "guide-chistka-matrasa-doma": [
    "матрас", "пот", "желтые", "чехол", "клещи",
  ],
  "guide-chistka-vanny-i-unitaza": [
    "ванна", "акриловая", "чугунная", "эмаль", "унитаз", "раковина", "умывальник", "санфаянс", "желтизна", "ржавчина", "мочевой", "ободок",
  ],
  "guide-chistka-stiralnoi-mashiny": [
    "стиральная", "стиралка", "барабан", "манжета", "резинка", "лоток", "накипь", "болото",
  ],
  "guide-generalnaya-uborka-kvartiry": [
    "генеральная", "поддерживающая", "квартира", "дом", "комната", "порядок",
  ],
};

/**
 * Общие глаголы действия («помыть», «почистить», «убрать», «вывести»):
 * сами по себе не должны привязывать запрос к чужому протоколу, если предмет
 * чистки в запросе не совпал (например, «как помыть натяжной потолок» не должен
 * попадать в «мойку окон» только из-за слова «помыть»).
 */
const GENERIC_ACTION_STEMS = new Set(
  [
    "помыть", "мыть", "мытье", "вымыть", "отмыть", "промыть", "смыть",
    "почистить", "чистить", "чистка", "очистить", "отчистить",
    "убрать", "уборка", "убраться", "удалить", "удаление",
    "вывести", "оттереть", "протереть", "освежить", "сделать", "дома", "своими", "руками",
  ].flatMap((w) => tokenizeRussianStems(w))
);

function aliasesForSolution(s: Solution): string[] {
  return SOLUTION_CHEMICAL_ALIASES[s.id] ?? SOLUTION_CHEMICAL_ALIASES[s.slug] ?? [];
}

export function matchesQuery(haystacks: Array<string | undefined>, needle: string): boolean {
  const normalizedNeedle = needle.toLowerCase().replace(/ё/g, "е");
  return haystacks.some((value) => value?.toLowerCase().replace(/ё/g, "е").includes(normalizedNeedle));
}

export function rankSolutions(
  solutions: Solution[],
  normalizedQuery: string,
  target: IntentClassification["target"]
): Solution[] {
  const bySlug = target?.kind === "solution" ? solutions.find((s) => s.slug === target.slug && !s.id.startsWith("guide-")) : undefined;
  const matched = solutions.filter(
    (s) =>
      s.id !== bySlug?.id &&
      matchesQuery(
        [s.title, s.material, ...s.searchKeywords, ...aliasesForSolution(s)],
        normalizedQuery
      )
  );
  return [...(bySlug ? [bySlug] : []), ...matched];
}

/**
 * Токен-ранкер с русской морфологией и весами полей:
 * - Предметные основы (вещество, поверхность, объект) дают основной вес (3 балла в заголовке/ключах, 1 балл в описании);
 * - Общие глаголы («помыть», «почистить») дают бонус (+1) ТОЛЬКО если уже совпал хотя бы один предметный токен.
 */
export function rankSolutionsByTokens(solutions: Solution[], normalizedQuery: string): Solution[] {
  const queryStems = tokenizeRussianStems(normalizedQuery);
  if (queryStems.length === 0) return [];

  const subjectStems = queryStems.filter((stem) => !GENERIC_ACTION_STEMS.has(stem));
  const actionStems = queryStems.filter((stem) => GENERIC_ACTION_STEMS.has(stem));
  const effectiveSubjectStems = subjectStems.length > 0 ? subjectStems : queryStems;

  const scored = solutions
    .map((s) => {
      const surfaceLabel = (SURFACE_LABELS as Record<string, string>)[s.surface] ?? s.surface;
      const aliases = aliasesForSolution(s);
      const primaryText = [s.title, ...s.searchKeywords, ...aliases].join(" ");
      const secondaryText = [
        surfaceLabel,
        s.material ?? "",
        ...s.diySteps.map((step) => `${step.instruction} ${step.tip ?? ""}`),
      ].join(" ");

      const primaryStems = new Set(tokenizeRussianStems(primaryText));
      const secondaryStems = new Set(tokenizeRussianStems(secondaryText));
      const rawPrimary = primaryText.toLowerCase().replace(/ё/g, "е");
      const rawSecondary = secondaryText.toLowerCase().replace(/ё/g, "е");

      let hits = 0;
      let primaryHits = 0;
      let matchedTokens = 0;
      for (const stem of effectiveSubjectStems) {
        if (primaryStems.has(stem) || rawPrimary.includes(stem)) {
          hits += 3;
          primaryHits += 1;
          matchedTokens += 1;
        } else if (secondaryStems.has(stem) || rawSecondary.includes(stem)) {
          hits += 1;
          matchedTokens += 1;
        }
      }

      // Если ни один предметный корень не совпал — не притягиваем протокол за одно слово «помыть»
      if (matchedTokens === 0) {
        return { solution: s, hits: 0, primaryHits: 0, matchedTokens: 0, isGuide: s.id.startsWith("guide-") };
      }

      for (const stem of actionStems) {
        if (primaryStems.has(stem) || rawPrimary.includes(stem)) {
          hits += 2;
          primaryHits += 1;
        }
      }

      return {
        solution: s,
        hits,
        primaryHits,
        matchedTokens,
        isGuide: s.id.startsWith("guide-"),
      };
    })
    .filter((x) => x.hits > 0);

  // Если в запросе есть только общие действия + поверхность (1 предметный корень, например «помыть окно»),
  // базовый технологический гид (isGuide) получает приоритет перед аварийным послестроем.
  const onlyGeneralSurfaceQuery = effectiveSubjectStems.length <= 1 && actionStems.length > 0;

  scored.sort((a, b) => {
    if (onlyGeneralSurfaceQuery && a.isGuide !== b.isGuide && a.matchedTokens === b.matchedTokens) {
      return a.isGuide ? -1 : 1;
    }
    return (
      b.matchedTokens - a.matchedTokens ||
      b.primaryHits - a.primaryHits ||
      b.hits - a.hits
    );
  });
  return scored.map((x) => x.solution);
}

/** Объединение двух ранкеров без дублей, порядок первого сохраняется. */
export function mergeRanked(first: Solution[], second: Solution[]): Solution[] {
  return [...new Map([...first, ...second].map((s) => [s.id, s])).values()];
}
