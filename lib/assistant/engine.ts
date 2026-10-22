/**
 * AI-консультант ChistoLab.
 *
 * Архитектурный инвариант: модель НЕ генерирует советы свободно — она
 * формулирует ответ строго по фактам найденных проверенных протоколов.
 * Если протокола нет, ответ честно сообщает об этом и предлагает выбор поверхности.
 * Продукты с productId дополнительно проходят гейт безопасности (pH/поверхности),
 * как и реклама.
 *
 * Без AI-биндинга endpoint работает в детерминированном режиме:
 * отдаёт структурированный ответ, собранный из данных протокола и контекста триажа.
 */

import { checkProductSafety } from "@/lib/ads/eligibility";
import { ASSISTANT_GUIDES } from "@/lib/assistant/guides";
import { relatedSolutions, SURFACE_LABELS, SEVERITY_LABELS } from "@/lib/solutions/meta";
import { mergeRanked, rankSolutions, rankSolutionsByTokens } from "@/lib/search/rank";
import { EMBEDDING_MODEL, SEMANTIC_THRESHOLD, type SemanticEnv } from "@/lib/search/semantic";
import type {
  CategoryId,
  DiyStep,
  IntentKeyword,
  PriceEstimate,
  ProductSafetyProfile,
  Solution,
  SolutionProblemType,
  SolutionProduct,
  SolutionSeverity,
  SolutionSurface,
} from "@/lib/types";
import { classifyIntent } from "@/lib/search/intent-router";

/** LLM переформулирует и адаптирует строго факты протокола под ситуацию пользователя. */
export const ANSWER_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
/** Быстрая резервная модель Workers AI на случай перегрузки или таймаута 70B. */
export const FALLBACK_ANSWER_MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";

export type AssistantTiming = "fresh" | "dried" | "washed";

export interface AssistantContext {
  /** Давность пятна или факт предварительного замывания бытовой химией */
  timing?: AssistantTiming;
  /** Уточнённый материал покрытия (например: «Велюр или флок», «Натуральный мрамор / камень») */
  material?: string;
  /** Явно выбранный пользователем протокол из предложенных альтернатив */
  solutionSlug?: string;
  /** Код страны (BY/RU/KZ) для включения региональной сметы в контекст ответа */
  countryCode?: string;
}

export interface AssistantProduct {
  id?: string;
  brandId?: string;
  brandName?: string;
  productId?: string;
  productName?: string;
  role: "recommended" | "alternative";
  note?: string;
  ph?: number;
  /** true — состав прошёл гейт безопасности по паспорту продукта. */
  verified: boolean;
}

export interface AssistantAlternative {
  id: string;
  slug: string;
  title: string;
  surface: SolutionSurface;
  problemType: SolutionProblemType;
}

export interface AssistantVerdict {
  recommendation: "diy" | "caution" | "pro";
  badge: string;
  summary: string;
}

export interface AssistantSolutionSummary {
  id: string;
  slug: string;
  title: string;
  surface: SolutionSurface;
  material?: string;
  problemType: SolutionProblemType;
  severity: SolutionSeverity;
  relatedCategory?: CategoryId;
  diyCostNote?: string;
  proTimeNote?: string;
  whenToCallPro: string;
  /** true — протокол собран ИИ-технологом индивидуально под нестандартный запрос вне статической базы */
  isCustom?: boolean;
  /** true — базовая технологическая карта (гид) без отдельной страницы /solutions/[slug] */
  isGuide?: boolean;
}

export interface AssistantAnswer {
  /** answer — LLM-сформулированный текст; protocol — детерминированная выжимка; empty — нет данных. */
  mode: "answer" | "protocol" | "empty";
  text: string;
  verdict: AssistantVerdict;
  firstAid?: string;
  solution?: AssistantSolutionSummary;
  steps: DiyStep[];
  products: AssistantProduct[];
  warnings: string[];
  alternatives: AssistantAlternative[];
  materialOptions: string[];
  followUpQuestions: string[];
  confidence: number;
}

const RETRIEVAL_TOP_K = 3;

const SURFACE_MATERIAL_OPTIONS: Record<SolutionSurface, string[]> = {
  upholstery: ["Велюр или флок", "Рогожка или шенилл", "Светлая обивка", "Кожа / замша / нубук"],
  mattress: ["Трикотажный чехол", "Жаккард", "Наполнитель кокос / ППУ", "Детский матрас"],
  carpet: ["Синтетический ворс", "Шерсть / шёлк ручной работы", "Длинный ворс (шегги)", "Коммерческий ковролин"],
  floor: ["Керамогранит / плитка", "Натуральный мрамор / камень", "Ламинат / паркет", "Кварцвинил / линолеум"],
  window: ["Стеклопакет и белый ПВХ", "Ламинированный / тёмный профиль", "Панорамное остекление", "Тонированное стекло"],
  facade: ["Керамогранит / камень", "Оштукатуренный фасад", "Витринное остекление"],
  kitchen: ["Нержавеющая сталь", "Алюминиевая сетка фильтра", "Глянцевый / МДФ фасад", "Керамический фартук"],
  bathroom: ["Стекло и хромированная латунь", "Чёрная матовая сантехника (PVD)", "Цементные швы и силикон", "Акрил / эмаль ванны"],
  other: ["Коммерческий ковролин", "Офисная мебель и оргтехника", "Стеклянные перегородки"],
};

const DELICATE_MATERIAL_RE = /велюр|флок|кож|замш|нубук|шерст|шелк|шёлк|мрамор|камен|ламинат|паркет|алюмин|глянц|черн|pvd|акрил|эмал/i;

export function getMaterialOptions(surface: SolutionSurface): string[] {
  return SURFACE_MATERIAL_OPTIONS[surface] ?? SURFACE_MATERIAL_OPTIONS.other;
}

export function getFollowUpQuestions(solution: Solution): string[] {
  switch (solution.problemType) {
    case "stain":
      return [
        `Что делать, если пятно (${solution.title.toLowerCase()}) уже высохло и остался ореол?`,
        `Мы уже замывали пятно мылом или Ванишем — как теперь убрать развод?`,
        `Какое средство безопасно для деликатного покрытия (${solution.material ?? SURFACE_LABELS[solution.surface].toLowerCase()})?`,
      ];
    case "odor":
      return [
        "Почему запах возвращается после обычной стирки или уксуса?",
        "Поможет ли энзимный спрей, если пятно старое и ушло в наполнитель?",
        "В каких случаях нужна промывка экстрактором или озонирование?",
      ];
    case "scale":
      return [
        "Как убрать налёт и не испортить хром или чёрное матовое покрытие?",
        "Чем отличается удаление свежего налёта от въевшегося водного камня?",
        "Как защитить поверхность, чтобы налёт и плесень не появлялись снова?",
      ];
    case "postrenovation":
      return [
        "Как понять, какая затирка на плитке — цементная или эпоксидная?",
        "Чем оттереть засохший скотч и клей, чтобы не поцарапать поверхность?",
        "Когда после ремонта выгоднее вызвать бригаду с роторной машиной и водососом?",
      ];
    default:
      return [
        "Что сделать в первую очередь, чтобы не закрепить загрязнение?",
        "Какие бытовые средства категорически нельзя применять в этой задаче?",
        "В каком случае домашняя чистка не поможет и нужен мастер?",
      ];
  }
}

/**
 * Извлекает текст ответа модели из результата ai.run.
 * Workers AI может вернуть как простую форму `{ response: "text" }`,
 * так и OpenAI-совместимую `chat.completion`, где текст лежит в
 * `choices[0].message.content`, а `response` — распарсенный объект.
 */
function extractAiText(result: unknown): string | null {
  if (!result || typeof result !== "object") return null;
  const r = result as {
    response?: unknown;
    choices?: { message?: { content?: unknown } }[];
  };
  if (typeof r.response === "string" && r.response.trim()) return r.response.trim();
  const content = r.choices?.[0]?.message?.content;
  if (typeof content === "string" && content.trim()) return content.trim();
  if (r.response && typeof r.response === "object") {
    try {
      return JSON.stringify(r.response);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Вызывает Workers AI с каскадным переключением на быструю модель 8B,
 * если основная модель 70B вернула ошибку или пустой ответ.
 */
async function runChatCompletionWithFallback(
  ai: Ai,
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  maxTokens: number,
  temperature: number
): Promise<string | null> {
  const models = [ANSWER_MODEL, FALLBACK_ANSWER_MODEL];
  for (const model of models) {
    try {
      const result = await ai.run(model as Parameters<Ai["run"]>[0], {
        messages,
        max_tokens: maxTokens,
        temperature,
      });
      const text = extractAiText(result);
      if (text) return text;
    } catch (err) {
      console.error(`[assistant:ai_model_error:${model}]`, err);
    }
  }
  return null;
}

/**
 * LLM-классификатор запасного уровня: если ни векторный поиск, ни словарь,
 * ни морфологический токен-ранкер не нашли протокол (нестандартная бытовая формулировка),
 * просим модель сопоставить вопрос со списком проверенных протоколов.
 */
async function matchSolutionWithLlm(
  ai: Ai,
  query: string,
  solutions: Solution[]
): Promise<Solution | null> {
  if (solutions.length === 0) return null;
  try {
    const catalog = solutions
      .map((s) => `- ${s.id}: ${s.title} (${SURFACE_LABELS[s.surface]}, ${s.material ?? s.problemType})`)
      .join("\n");
    const result = await ai.run(ANSWER_MODEL, {
      messages: [
        {
          role: "system",
          content:
            "Ты — классификатор задач чистки ChistoLab. Выбери ОДИН наиболее подходящий идентификатор протокола из списка ниже для вопроса пользователя (учитывай химическую природу загрязнения и тип поверхности). Если вопрос совсем не связан с уборкой или чисткой, ответь NONE. В ответе верни ТОЛЬКО идентификатор или NONE, без других слов.",
        },
        {
          role: "user",
          content: `ПРОТОКОЛЫ:\n${catalog}\n\nВОПРОС: ${query}`,
        },
      ],
      max_tokens: 40,
      temperature: 0,
    });
    const raw = extractAiText(result)?.toLowerCase() ?? "";
    const cleaned = raw.replace(/[^a-z0-9-]/g, "");
    return solutions.find((s) => s.id === cleaned || s.slug === cleaned) ?? null;
  } catch {
    return null;
  }
}

/** Объединяет опубликованные SEO-протоколы с базовыми технологическими гидами без дублей по id. */
export function buildKnowledgePool(solutions: Solution[]): Solution[] {
  const publishedSolutions = solutions.filter((s) => s.status === "published");
  const base = publishedSolutions.length > 0 ? publishedSolutions : solutions;
  const existingIds = new Set(base.map((s) => s.id));
  return [...base, ...ASSISTANT_GUIDES.filter((g) => !existingIds.has(g.id))];
}

/**
 * Находит релевантные протоколы: векторный поиск при биндингах,
 * затем классификация по словарю + взвешенный морфологический токен-ранкер
 * (включая базовые технологические карты мойки окон, полов, духовки, холодильника и т.д.),
 * а при нулевом совпадении и наличии AI — семантический выбор протокола через LLM.
 */
export async function retrieveSolutions(
  env: SemanticEnv | null,
  query: string,
  solutions: Solution[],
  keywords: IntentKeyword[]
): Promise<{ solutions: Solution[]; confidence: number }> {
  const pool = buildKnowledgePool(solutions);

  if (env?.AI && env?.VECTORIZE) {
    try {
      const result = await env.AI.run(EMBEDDING_MODEL, { text: [query] });
      const data = (result as { data?: number[][] }).data;
      if (data?.[0]) {
        const found = await env.VECTORIZE.query(data[0], { topK: RETRIEVAL_TOP_K });
        const byId = new Map(pool.map((s) => [s.id, s]));
        const ranked = found.matches
          .filter((m) => m.score >= SEMANTIC_THRESHOLD)
          .map((m) => ({ solution: byId.get(m.id), score: m.score }))
          .filter((m): m is { solution: Solution; score: number } => Boolean(m.solution));
        if (ranked.length > 0) {
          return {
            solutions: ranked.map((m) => m.solution),
            confidence: ranked[0].score,
          };
        }
      }
    } catch (err) {
      console.error("[assistant:retrieve_error]", err);
    }
  }

  const classification = classifyIntent(query, keywords);
  const normalized = query.trim().toLowerCase();
  const byTokens = rankSolutionsByTokens(pool, normalized);
  const byTarget = rankSolutions(pool, normalized, classification.target);

  // Токен-ранкер учитывает все слова запроса («как помыть окно» → гид мойки окон без разводов,
  // а не узкий послестрой со скотчем), поэтому при отсутствии прямого совпадения solution-ключа
  // первыми идут результаты токен-ранкера.
  const ranked =
    classification.target?.kind === "solution"
      ? mergeRanked(byTarget, byTokens)
      : mergeRanked(byTokens, byTarget);

  if (ranked.length > 0) {
    const confidence =
      classification.confidence > 0
        ? classification.confidence
        : Math.min(0.88, 0.5 + ranked.length * 0.12);
    return { solutions: ranked.slice(0, RETRIEVAL_TOP_K), confidence };
  }

  if (env?.AI && normalized.length >= 3) {
    const llmMatched = await matchSolutionWithLlm(env.AI, query, pool);
    if (llmMatched) {
      const related = relatedSolutions(llmMatched, pool, RETRIEVAL_TOP_K - 1);
      return {
        solutions: [llmMatched, ...related],
        confidence: 0.72,
      };
    }
  }

  return { solutions: [], confidence: 0 };
}

/**
 * Продукты протокола, прошедшие гейт: item с productId обязан пройти
 * checkProductSafety; brandId-only строки — редакционные из проверенного
 * протокола, помечаются verified=false (нет паспорта для проверки pH).
 */
export function filterSafeProducts(
  solution: Solution,
  safetyMap: Map<string, ProductSafetyProfile>
): AssistantProduct[] {
  return (solution.recommendedProducts ?? []).flatMap((sp: SolutionProduct): AssistantProduct[] => {
    const profile = sp.productId ? safetyMap.get(sp.productId) : undefined;
    if (sp.productId) {
      if (!profile) return [];
      const check = checkProductSafety({ product: profile, surface: solution.surface, solution });
      if (!check.safe) return [];
      return [
        {
          id: sp.id,
          brandId: sp.brandId,
          brandName: sp.brandName,
          productId: sp.productId,
          productName: sp.productName ?? profile.name,
          role: sp.role,
          note: sp.note,
          ph: profile.ph,
          verified: true,
        },
      ];
    }
    return [
      {
        id: sp.id,
        brandId: sp.brandId,
        brandName: sp.brandName,
        productName: sp.productName,
        role: sp.role,
        note: sp.note,
        verified: false,
      },
    ];
  });
}

/** Строит чёткий вердикт «Справитесь сами vs Осторожно vs Нужен мастер» с учётом уточнений пользователя. */
export function buildVerdict(solution: Solution, context?: AssistantContext): AssistantVerdict {
  const timing = context?.timing;
  const material = context?.material ?? "";
  const isDelicate = DELICATE_MATERIAL_RE.test(material);

  if (timing === "washed") {
    return {
      recommendation: "pro",
      badge: "Высокий риск ореола · Рекомендуем экстракцию мастером",
      summary:
        "Если пятно уже замывали бытовым мылом, пеной или «Ванишем», щелочной ПАВ и часть пигмента ушли вглубь наполнителя. Повторное замывание сверху часто даёт жёсткий контурный развод — надёжнее промыть участок профессиональным экстрактором с кислотным ополаскивателем.",
    };
  }

  if (timing === "dried") {
    return {
      recommendation: "caution",
      badge: "Застарелое загрязнение · Строго по времени выдержки",
      summary:
        "Высохший пигмент или кристаллы уже связались с волокнами. Не трите поверхность силой: дайте составу из протокола поработать положенное время. Если через 1–2 подхода след не сходит — остановитесь и вызовите мастера, чтобы не повредить структуру материала.",
    };
  }

  if (isDelicate) {
    return {
      recommendation: "caution",
      badge: `Деликатное покрытие (${material}) · Обязателен тест на скрытом участке`,
      summary: `Для покрытия «${material}» критически важно проверить состав на незаметном участке или шве и строго соблюдать ограничения из блока «Осторожно» ниже.`,
    };
  }

  if (solution.severity === "extreme") {
    return {
      recommendation: "caution",
      badge: "Сложная задача · Оцените масштаб перед началом",
      summary: `${solution.whenToCallPro}`,
    };
  }

  return {
    recommendation: "diy",
    badge: "Высокий шанс вывести дома по протоколу",
    summary: `При свежем загрязнении задача решается самостоятельно за ${solution.diySteps.length} шага${solution.diyCostNote ? ` (бюджет: ${solution.diyCostNote})` : ""}. Главное — начать с первого шага и не нарушать запреты для покрытия.`,
  };
}

/** Дополнительные предупреждения, если пользователь уточнил стадию пятна или капризный материал. */
export function buildContextualWarnings(solution: Solution, context?: AssistantContext): string[] {
  const extra: string[] = [];
  if (context?.timing === "washed") {
    extra.push(
      "Вы уже замывали участок бытовой химией: не наносите поверх хлорный или концентрированный щелочной пятновыводитель — реакция с остатками ПАВ в поролоне закрепит жёлтый или белесый ореол."
    );
  } else if (context?.timing === "dried") {
    extra.push(
      "Пятно уже высохло: не пытайтесь отскоблить корочку всухую или залить кипятком — сначала размягчите загрязнение составом из шага 1–2 протокола."
    );
  }
  if (context?.material && DELICATE_MATERIAL_RE.test(context.material)) {
    extra.push(
      `Уточнённый материал («${context.material}»): перед основным нанесением обязательно сделайте пробу на скрытом участке и дождитесь полного высыхания (5–10 минут).`
    );
  }
  return [...extra, ...solution.warnings];
}

/** Детерминированная выжимка протокола — подробный экспертный ответ без LLM (dev, тесты, фолбэк при сбое AI). */
export function buildProtocolAnswer(
  query: string,
  solution: Solution,
  products: AssistantProduct[],
  context?: AssistantContext
): string {
  const surfaceLabel =
    (SURFACE_LABELS as Record<string, string>)[solution.surface] ?? solution.surface;
  const targetMaterial = context?.material ?? solution.material ?? surfaceLabel.toLowerCase();
  const timingNote =
    context?.timing === "washed"
      ? "Так как пятно уже пытались замывать, главная задача — сначала вытянуть остатки бытовой пены влажной микрофиброй без втирания и оценить, не ушёл ли пигмент в глубину наполнителя."
      : context?.timing === "dried"
        ? "Поскольку загрязнение уже высохло, механическое трение щёткой только повредит покрытие — работайте через размягчение и экспозицию состава по шагам."
        : "Главное правило в первые минуты — работать от краёв к центру промакивающими движениями, не загоняя загрязнение глубже и не переувлажняя основу.";

  const steps = solution.diySteps
    .slice(0, 6)
    .map((s) => `${s.order}. ${s.instruction}${s.tip ? ` (Совет технолога: ${s.tip})` : ""}`)
    .join("\n");

  const productNotes = products
    .map((p) => {
      const label = [p.brandName, p.note].filter(Boolean).join(": ");
      return p.ph !== undefined ? `${label} (pH ${p.ph})` : label;
    })
    .filter(Boolean)
    .slice(0, 3);

  const parts = [
    `По вашему запросу «${query}» подобран проверенный технологический протокол «${solution.title}» (покрытие: ${targetMaterial}).`,
    timingNote,
    "",
    "Шаги по протоколу:",
    steps,
  ];
  if (solution.warnings.length > 0) {
    parts.push("", `Осторожно: ${solution.warnings.join(" ")}`);
  }
  if (productNotes.length > 0) {
    parts.push(`Проверенные средства из протокола: ${productNotes.join("; ")}.`);
  }
  parts.push("", `Если не поможет: ${solution.whenToCallPro}`);
  return parts.join("\n");
}

/** Системная инструкция для LLM: строгая роль технолога ChistoLab и запрет на галлюцинации. */
export const ASSISTANT_SYSTEM_PROMPT = [
  "Ты — главный технолог по клинингу и химчистке платформы ChistoLab (chistolab.pro).",
  "Твоя задача — дать пользователю максимально полезный, точный и исчерпывающий экспертный ответ СТРОГО на основе переданного проверенного протокола.",
  "ЖЕЛЕЗНЫЕ ПРАВИЛА БЕЗОПАСНОСТИ:",
  "1. Запрещено выдумывать средства, народные рецепты (уксус, соду, ацетон, белизну, кипяток), концентрации, pH и шаги, которых нет в протоколе.",
  "2. Если пользователь спрашивает про смежное загрязнение (например, морс или сок вместо вина, какао вместо кофе), прямо поясни, почему этот протокол подходит по химическому составу пятна, и проведи по его шагам.",
  "3. Обязательно учитывай уточнения пользователя (свежее или высохшее пятно, замывали ли уже мылом/Ванишем, какой материал поверхности).",
  "4. Пиши чётко, живо, без воды и без markdown-разметки (без звёздочек ** и решёток #), разделяя мысль на 3 коротких абзаца:",
  "   — Абзац 1 (Суть и первое действие): почему пятно ведёт себя так на этом покрытии и что сделать прямо сейчас в первую очередь (с учётом советов технолога из шагов).",
  "   — Абзац 2 (Главный риск и выбор средства): чего категорически нельзя делать на этом материале и какой тип состава из протокола безопасен (с упоминанием pH, если указан).",
  "   — Абзац 3 (Прогноз: когда справитесь сами, а когда нужен мастер): честный критерий, в какой ситуации домашняя чистка поможет, а когда лучше не рисковать вещью и вызвать мастера с экстрактором/спецоборудованием.",
].join("\n");

/** Промпт суммаризации: все факты протокола (включая tips, смету и контекст триажа) + явный запрет выдумывать. */
export function buildGroundedPrompt(
  query: string,
  solution: Solution,
  products: AssistantProduct[],
  context?: AssistantContext,
  estimateSummary?: string | null
): string {
  const surfaceLabel =
    (SURFACE_LABELS as Record<string, string>)[solution.surface] ?? solution.surface;
  const severityLabel =
    (SEVERITY_LABELS as Record<string, string>)[solution.severity] ?? solution.severity;
  const steps = solution.diySteps
    .map((s) => `${s.order}. ${s.instruction}${s.tip ? ` [Важный нюанс: ${s.tip}]` : ""}`)
    .join("\n");
  const productLines = products
    .map(
      (p) =>
        `- ${[p.brandName, p.note].filter(Boolean).join(": ")}${p.ph !== undefined ? ` (pH ${p.ph})` : ""}${p.role === "recommended" ? " [основное]" : " [альтернатива]"}`
    )
    .join("\n");

  const timingLabel =
    context?.timing === "fresh"
      ? "Свежее загрязнение (только что случилось)"
      : context?.timing === "dried"
        ? "Загрязнение уже высохло / старше 24 часов"
        : context?.timing === "washed"
          ? "Участок УЖЕ пытались замывать бытовым мылом, пеной или Ванишем"
          : null;

  return [
    "Ты — консультант ChistoLab по чистке. Отвечай конкретно, экспертно и по делу, строго на основе проверенного протокола ниже.",
    "Запрещено выдумывать средства, концентрации, шаги и совместимость. Если данных не хватает — скажи прямо и посоветуй обратиться к мастеру.",
    "",
    `ПРОТОКОЛ: ${solution.title}`,
    `Поверхность: ${surfaceLabel}${solution.material ? `, базовый материал: ${solution.material}` : ""} (сложность по базе: ${severityLabel})`,
    context?.material ? `Уточнённый материал пользователя: ${context.material}` : "",
    timingLabel ? `Состояние загрязнения у пользователя: ${timingLabel}` : "",
    `Пошаговая технология и секреты:\n${steps}`,
    solution.warnings.length ? `Строгие запреты (Осторожно): ${solution.warnings.join(" ")}` : "",
    productLines ? `Проверенные средства:\n${productLines}` : "",
    solution.diyCostNote ? `Ориентир затрат на домашнюю чистку: ${solution.diyCostNote}` : "",
    solution.proTimeNote ? `Время работы мастера: ${solution.proTimeNote}` : "",
    estimateSummary ? `Ориентир цены вызова мастера в регионе пользователя: ${estimateSummary}` : "",
    `Когда вызывать мастера: ${solution.whenToCallPro}`,
    "",
    `ВОПРОС ПОЛЬЗОВАТЕЛЯ: ${query}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Системный промпт для открытого режима ИИ-технолога ChistoLab:
 * когда запрос пользователя выходит за рамки готовых карточек базы
 * (например, «как помыть натяжной потолок», «чем оттереть суперклей со стола», «как отмыть утюг»),
 * модель генерирует полноценный технологический протокол по строгим химическим законам безопасности.
 */
export const OPEN_EXPERT_SYSTEM_PROMPT = [
  "Ты — главный технолог по клинингу и химчистке платформы ChistoLab (chistolab.pro).",
  "Пользователь задал вопрос по чистке/уборке, для которого в статической базе ещё нет готовой карточки.",
  "Твоя задача — составить точный, безопасный и исчерпывающий технологический протокол в формате JSON.",
  "ЖЕЛЕЗНЫЕ ЗАКОНЫ ХИМИЧЕСКОЙ БЕЗОПАСНОСТИ CHISTOLAB (нарушать запрещено):",
  "1. Кислоты (pH < 6, уксус, лимонная/соляная кислота) СТРОГО ЗАПРЕЩЕНЫ на мраморе, травертине, известняке, эмали ванн, акриле, алюминии, хромированной эконом-фурнитуре и чёрной матовой сантехнике (PVD).",
  "2. Щелочи (pH > 9.5, каустик, антижиры, сода с трением) СТРОГО ЗАПРЕЩЕНЫ на алюминии, шерсти, шёлке, вискозе, коже, нубуке, ламинате, паркете и каталитической эмали духовок.",
  "3. Горячая вода (> 40°C), пар и фен СТРОГО ЗАПРЕЩЕНЫ на белковых пятнах (кровь, яйцо, молоко) и запахах мочи — белок сворачивается и закрепляется навсегда.",
  "4. Ацетон, растворитель 646 и бензин СТРОГО ЗАПРЕЩЕНЫ на ПВХ-пластике, лакированном дереве, синтетических тканях, флоке, акриле и натяжных потолках.",
  "5. На любом деликатном покрытии обязателен предварительный тест на скрытом участке.",
  "Если вопрос НЕ имеет никакого отношения к уборке, чистке, пятнам, запахам или уходу за домом/вещами — верни JSON: {\"isCleaningTopic\": false}.",
  "Для любого вопроса по чистке/уборке верни ТОЛЬКО валидный JSON без markdown-обёрток со следующей структурой:",
  "{",
  '  "isCleaningTopic": true,',
  '  "title": "Краткое и точное название задачи",',
  '  "surface": "upholstery" | "mattress" | "carpet" | "floor" | "window" | "kitchen" | "bathroom" | "other",',
  '  "material": "уточнённый материал поверхности",',
  '  "problemType": "stain" | "odor" | "scale" | "postrenovation" | "general",',
  '  "relatedCategory": "apartments" | "offices" | "upholstery" | "windows" | "post-renovation" | "deep-cleaning",',
  '  "recommendation": "diy" | "caution" | "pro",',
  '  "badge": "Короткий статус вердикта (например: Можно справиться дома · Пошаговый протокол)",',
  '  "summary": "Пояснение вердикта в 1–2 предложениях",',
  '  "text": "Экспертное заключение технолога в 2–3 абзацах (без звёздочек ** и решёток #): физика/химия загрязнения, первое действие и выбор безопасного pH",',
  '  "steps": [',
  '    { "order": 1, "instruction": "Чёткое действие шага 1", "tip": "Профессиональный нюанс технолога" },',
  '    { "order": 2, "instruction": "Чёткое действие шага 2", "tip": "Профессиональный нюанс технолога" },',
  '    { "order": 3, "instruction": "Чёткое действие шага 3" }',
  "  ],",
  '  "warnings": ["Строгий запрет 1 с объяснением последствия для материала", "Строгий запрет 2"],',
  '  "whenToCallPro": "В каком случае домашняя чистка опасна и нужен профессионал со спецтехникой",',
  '  "diyCostNote": "Ориентир стоимости домашних средств в BYN",',
  '  "proTimeNote": "Ориентир времени работы мастера"',
  "}",
].join("\n");

const VALID_SURFACES = new Set<SolutionSurface>([
  "upholstery", "mattress", "carpet", "floor", "window", "facade", "kitchen", "bathroom", "other",
]);
const VALID_PROBLEM_TYPES = new Set<SolutionProblemType>([
  "stain", "odor", "scale", "postrenovation", "general",
]);
const VALID_CATEGORIES = new Set<CategoryId>([
  "apartments", "offices", "upholstery", "windows", "post-renovation", "deep-cleaning",
]);

/** Минимальные маркеры клининговой темы — страховка от ложного isCleaningTopic:false. */
const CLEANING_TOPIC_HINT_RE =
  /чист|мыт|мойк|пятн|загрязн|оттер|отмы|вывест|вывод|налет|налёт|запах|кле|жир|пыль|уборк|развод|копоть|нагар|плесен|грибок|ржавчин|след|воня/i;

interface OpenExpertJson {
  isCleaningTopic?: boolean;
  title?: string;
  surface?: string;
  material?: string;
  problemType?: string;
  relatedCategory?: string;
  recommendation?: "diy" | "caution" | "pro";
  badge?: string;
  summary?: string;
  text?: string;
  steps?: Array<{ order?: number; instruction?: string; tip?: string }>;
  warnings?: string[];
  whenToCallPro?: string;
  diyCostNote?: string;
  proTimeNote?: string;
}

/**
 * Генерирует индивидуальный технологический протокол через Cloudflare LLM для любого
 * вопроса по чистке, которого ещё нет в статической базе, с соблюдением законов pH.
 */
export async function generateOpenExpertAnswer(
  ai: Ai,
  query: string,
  context: AssistantContext | undefined,
  pool: Solution[]
): Promise<AssistantAnswer | null> {
  const contextLines = [
    context?.material ? `Уточнённый материал пользователя: ${context.material}` : "",
    context?.timing === "fresh"
      ? "Состояние: свежее загрязнение"
      : context?.timing === "dried"
        ? "Состояние: уже высохло / застарелое"
        : context?.timing === "washed"
          ? "Состояние: уже пытались замывать мылом или бытовой химией"
          : "",
  ]
    .filter(Boolean)
    .join("\n");

  const userPrompt = contextLines ? `${contextLines}\n\nВОПРОС: ${query}` : `ВОПРОС: ${query}`;

  const raw = await runChatCompletionWithFallback(
    ai,
    [
      { role: "system", content: OPEN_EXPERT_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    1400,
    0.2
  );

  if (!raw) return null;

  try {
    // Пробуем извлечь JSON-объект из ответа модели
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]) as OpenExpertJson;
        // Вопрос явно про чистку, но модель ошибочно вернула isCleaningTopic:false —
        // не выбрасываем ответ, а собираем протокол из остальных полей.
        if (parsed.isCleaningTopic === false && !CLEANING_TOPIC_HINT_RE.test(query)) {
          return null;
        }
        const surface: SolutionSurface = VALID_SURFACES.has(parsed.surface as SolutionSurface)
          ? (parsed.surface as SolutionSurface)
          : "other";
        const problemType: SolutionProblemType = VALID_PROBLEM_TYPES.has(
          parsed.problemType as SolutionProblemType
        )
          ? (parsed.problemType as SolutionProblemType)
          : "general";
        const relatedCategory: CategoryId = VALID_CATEGORIES.has(parsed.relatedCategory as CategoryId)
          ? (parsed.relatedCategory as CategoryId)
          : "apartments";

        const steps: DiyStep[] = (parsed.steps ?? [])
          .filter((s) => Boolean(s.instruction?.trim()))
          .map((s, idx) => ({
            order: s.order ?? idx + 1,
            instruction: s.instruction!.trim(),
            tip: s.tip?.trim() || undefined,
          }));

        const warnings = (parsed.warnings ?? []).map((w) => w.trim()).filter(Boolean);
        const recommendation =
          parsed.recommendation === "diy" || parsed.recommendation === "pro"
            ? parsed.recommendation
            : "caution";

        const closestAlternatives: AssistantAlternative[] = pool
          .filter((s) => s.surface === surface || s.relatedCategory === relatedCategory)
          .slice(0, 3)
          .map((s) => ({
            id: s.id,
            slug: s.slug,
            title: s.title,
            surface: s.surface,
            problemType: s.problemType,
          }));

        return {
          mode: "answer",
          text:
            parsed.text?.trim() ||
            `Технологический разбор по запросу «${query}» подготовлен с учётом безопасности покрытия.`,
          verdict: {
            recommendation,
            badge:
              parsed.badge?.trim() ||
              "Индивидуальный протокол технолога ChistoLab · Сделайте тест на скрытом участке",
            summary:
              parsed.summary?.trim() ||
              "Протокол составлен ИИ-технологом по правилам химической совместимости материалов. Перед применением проверьте состав на незаметном участке.",
          },
          firstAid: steps[0]?.instruction,
          solution: {
            id: "custom-ai-protocol",
            slug: "custom-ai-protocol",
            title: parsed.title?.trim() || `Разбор задачи: ${query}`,
            surface,
            material: parsed.material?.trim() || context?.material,
            problemType,
            severity: context?.timing === "washed" ? "extreme" : context?.timing === "dried" ? "set" : "fresh",
            relatedCategory,
            diyCostNote: parsed.diyCostNote?.trim(),
            proTimeNote: parsed.proTimeNote?.trim(),
            whenToCallPro:
              parsed.whenToCallPro?.trim() ||
              "Если после первой бережной попытки загрязнение не сходит или покрытие деликатное — остановитесь и вызовите профильного мастера.",
            isCustom: true,
          },
          steps,
          products: [],
          warnings,
          alternatives: closestAlternatives,
          materialOptions: getMaterialOptions(surface),
          followUpQuestions: [
            `Чем безопасно заменить профессиональное средство для задачи «${parsed.title?.trim() || query}»?`,
            "Что делать, если пятно или налёт уже застарелые?",
            "Как не оставить разводов и ореола после высыхания?",
          ],
          confidence: 0.78,
        };
      } catch {
        // Модель ответила прозой без JSON — ниже отдадим текстовую консультацию
      }
    }
  } catch (err) {
    console.error("[assistant:open_expert_error]", err);
  }

  // Фолбэк: модель вернула содержательный текст без JSON —
  // текстовая консультация технолога лучше тупикового «нет протокола».
  const prose = raw.replace(/```(?:json)?/gi, "").trim();
  const looksLikeJsonFragment = prose.startsWith("{") || prose.startsWith("[");
  if (!looksLikeJsonFragment && prose.length >= 80) {
    const closestAlternatives: AssistantAlternative[] = pool.slice(0, 3).map((s) => ({
      id: s.id,
      slug: s.slug,
      title: s.title,
      surface: s.surface,
      problemType: s.problemType,
    }));
    return {
      mode: "answer",
      text: prose.slice(0, 3000),
      verdict: {
        recommendation: "caution",
        badge: "Разбор ИИ-технолога · Сделайте тест на скрытом участке",
        summary:
          "Ответ составлен ИИ-технологом ChistoLab по правилам химической совместимости материалов. Перед применением любого средства проверьте его на незаметном участке.",
      },
      solution: {
        id: "custom-ai-protocol",
        slug: "custom-ai-protocol",
        title: `Разбор задачи: ${query}`,
        surface: "other",
        material: context?.material,
        problemType: "general",
        severity: context?.timing === "washed" ? "extreme" : "fresh",
        relatedCategory: "apartments",
        whenToCallPro:
          "Если загрязнение не сходит после первой бережной попытки или покрытие деликатное — остановитесь и вызовите профильного мастера.",
        isCustom: true,
      },
      steps: [],
      products: [],
      warnings: [],
      alternatives: closestAlternatives,
      materialOptions: getMaterialOptions("other"),
      followUpQuestions: [
        "Какое средство безопасно для деликатного покрытия?",
        "Что делать, если загрязнение уже застарелое?",
        "В каком случае лучше вызвать профессионала?",
      ],
      confidence: 0.7,
    };
  }
  return null;
}

function formatEstimateSummaryForPrompt(
  solution: Solution,
  estimates?: PriceEstimate[],
  countryCode = "BY"
): string | null {
  if (!estimates || estimates.length === 0) return null;
  const match =
    estimates.find(
      (e) => (e.solutionId === solution.id || e.solutionId === solution.slug) && e.countryCode === countryCode
    ) ??
    estimates.find((e) => e.solutionId === solution.id || e.solutionId === solution.slug);
  if (!match) return null;
  return `${match.priceMin}–${match.priceMax} ${match.currency}${match.unit ? ` за ${match.unit}` : ""}${match.note ? ` (${match.note})` : ""}`;
}

export async function consult(params: {
  env: SemanticEnv | null;
  query: string;
  context?: AssistantContext;
  solutions: Solution[];
  keywords: IntentKeyword[];
  safetyMap: Map<string, ProductSafetyProfile>;
  estimates?: PriceEstimate[];
}): Promise<AssistantAnswer> {
  const { env, solutions, keywords, safetyMap, context, estimates } = params;
  const query = params.query.trim();
  const pool = buildKnowledgePool(solutions);

  const { solutions: retrieved, confidence } = await retrieveSolutions(env, query, solutions, keywords);

  // Если пользователь явно кликнул альтернативный протокол в карточке — делаем его основным
  const explicit = context?.solutionSlug
    ? pool.find((s) => s.id === context.solutionSlug || s.slug === context.solutionSlug)
    : undefined;
  const ordered = explicit
    ? [explicit, ...retrieved.filter((s) => s.id !== explicit.id)]
    : retrieved;

  const primary = ordered[0];

  if (!primary) {
    // Если точного протокола в базе нет, но подключён Cloudflare Workers AI —
    // генерируем полноценный индивидуальный протокол по законам химической безопасности ChistoLab!
    if (env?.AI && query.length >= 3) {
      const openAnswer = await generateOpenExpertAnswer(env.AI, query, context, pool);
      if (openAnswer) {
        return openAnswer;
      }
    }

    const fallbackAlternatives: AssistantAlternative[] = pool
      .slice(0, 4)
      .map((s) => ({
        id: s.id,
        slug: s.slug,
        title: s.title,
        surface: s.surface,
        problemType: s.problemType,
      }));

    return {
      mode: "empty",
      text: "Точного проверенного протокола под такую формулировку в базе пока нет — мы не выдумываем непроверенные рецепты, чтобы вы не испортили покрытие. Выберите ближайшую задачу ниже или уточните поверхность и тип пятна.",
      verdict: {
        recommendation: "caution",
        badge: "Нужно уточнить поверхность и тип загрязнения",
        summary:
          "Укажите в вопросе, на какой поверхности (диван, матрас, ковёр, плитка, окно, сантехника, холодильник, духовка) и от чего образовалось пятно или запах — либо выберите готовый протокол ниже.",
      },
      steps: [],
      products: [],
      warnings: [],
      alternatives: fallbackAlternatives,
      materialOptions: [],
      followUpQuestions: [
        "Как помыть окна без разводов",
        "Пятно красного вина или сока на диване",
        "Запах в холодильнике — чем помыть внутри",
      ],
      confidence,
    };
  }

  const products = filterSafeProducts(primary, safetyMap);
  const warnings = buildContextualWarnings(primary, context);
  const verdict = buildVerdict(primary, context);
  const orderedSteps = [...primary.diySteps].sort((a, b) => a.order - b.order);
  const firstAid = orderedSteps[0]?.instruction;

  const extraRelated =
    ordered.length > 1
      ? ordered.slice(1)
      : relatedSolutions(primary, pool, 2);

  const alternatives: AssistantAlternative[] = extraRelated.slice(0, 3).map((s) => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    surface: s.surface,
    problemType: s.problemType,
  }));

  const base: Omit<AssistantAnswer, "mode" | "text"> = {
    verdict,
    firstAid,
    solution: {
      id: primary.id,
      slug: primary.slug,
      title: primary.title,
      surface: primary.surface,
      material: primary.material,
      problemType: primary.problemType,
      severity: primary.severity,
      relatedCategory: primary.relatedCategory,
      diyCostNote: primary.diyCostNote,
      proTimeNote: primary.proTimeNote,
      whenToCallPro: primary.whenToCallPro,
      isGuide: primary.id.startsWith("guide-"),
    },
    steps: orderedSteps,
    products,
    warnings,
    alternatives,
    materialOptions: getMaterialOptions(primary.surface),
    followUpQuestions: getFollowUpQuestions(primary),
    confidence,
  };

  if (env?.AI) {
    try {
      const estimateSummary = formatEstimateSummaryForPrompt(
        primary,
        estimates,
        context?.countryCode ?? "BY"
      );
      const userPrompt = buildGroundedPrompt(query, primary, products, context, estimateSummary);
      const text = await runChatCompletionWithFallback(
        env.AI,
        [
          { role: "system", content: ASSISTANT_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        700,
        0.2
      );
      if (text) return { ...base, mode: "answer", text };
    } catch (err) {
      console.error("[assistant:answer_error]", err);
    }
  }

  return {
    ...base,
    mode: "protocol",
    text: buildProtocolAnswer(query, primary, products, context),
  };
}
