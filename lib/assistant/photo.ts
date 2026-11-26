/**
 * Фото-триаж ChistoLab (открытая бета, runtime-флаг PHOTO_ASSIST_ENABLED).
 *
 * Архитектурный инвариант: изображение видит только классификатор — модель
 * обязана вернуть ОДИН токен из белого списка категорий или служебный статус.
 * Текст ответа собирается детерминированно из проверенной базы протоколов
 * (buildPhotoProtocolAnswer): фото никогда не попадает в свободный
 * текстовый режим консультанта, модель не выдаёт рецепты и не определяет
 * материал — его подтверждает пользователь.
 *
 * Модуль чистый (без I/O кроме ai.run): валидация байтов, парсинг вывода
 * модели и сборка ответа тестируются без Workers runtime.
 */

import {
  buildContextualWarnings,
  buildKnowledgePool,
  buildProtocolAnswer,
  buildVerdict,
  filterSafeProducts,
  getFollowUpQuestions,
  getMaterialOptions,
  type AssistantAnswer,
  type AssistantContext,
  type AssistantSolutionSummary,
} from "@/lib/assistant/engine";
import { mergeRanked, rankSolutions, rankSolutionsByTokens } from "@/lib/search/rank";
import { relatedSolutions } from "@/lib/solutions/meta";
import type {
  ProductSafetyProfile,
  Solution,
} from "@/lib/types";

/** Мультимодальная модель Workers AI: видит фото, отвечает одним токеном. */
export const PHOTO_MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";

/** Жёсткий потолок байтов файла на сервере (клиент сжимает до ~1.5 МБ). */
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
/** Максимальная сторона изображения — отсекает простыни megapixeles до ai.run. */
export const PHOTO_MAX_DIMENSION = 2048;
/** Один вызов модели, без авторетраев: повтор удваивает расход Neurons. */
export const PHOTO_TIMEOUT_MS = 20_000;
/** Дефолт дневного бюджета попыток, если PHOTO_DAILY_BUDGET не задан. */
export const PHOTO_DAILY_BUDGET_DEFAULT = 40;

export type PhotoMime = "image/jpeg" | "image/png" | "image/webp";

export const PHOTO_ACCEPTED_MIMES: readonly PhotoMime[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

/* ---------- Валидация файла по сигнатуре и размерам ---------- */

/** Определяет реальный формат по magic bytes — Content-Type клиенту не доверяем. */
export function detectImageMime(bytes: Uint8Array): PhotoMime | null {
  if (bytes.length < 12) return null;
  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  // WebP: "RIFF" .... "WEBP"
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

function u16be(b: Uint8Array, o: number): number {
  return (b[o] << 8) | b[o + 1];
}
function u16le(b: Uint8Array, o: number): number {
  return b[o] | (b[o + 1] << 8);
}
function u24le(b: Uint8Array, o: number): number {
  return b[o] | (b[o + 1] << 8) | (b[o + 2] << 16);
}
function u32be(b: Uint8Array, o: number): number {
  return ((b[o] << 24) >>> 0) + (b[o + 1] << 16) + (b[o + 2] << 8) + b[o + 3];
}

/** Размеры из заголовка без декодирования: PNG IHDR, JPEG SOF, WebP VP8/VP8L/VP8X. */
export function readImageSize(bytes: Uint8Array): { width: number; height: number } | null {
  const mime = detectImageMime(bytes);
  if (!mime) return null;

  if (mime === "image/png") {
    // IHDR: длина(4) + "IHDR"(4) + width(4 BE) + height(4 BE) — сразу после 8-байтной сигнатуры
    if (bytes.length < 24) return null;
    const width = u32be(bytes, 16);
    const height = u32be(bytes, 20);
    return width > 0 && height > 0 ? { width, height } : null;
  }

  if (mime === "image/jpeg") {
    // Сканируем маркеры до первого SOF (FFC0–FFCF кроме DHT/DAC/RST):
    // height/width — big-endian сразу после маркера и длины сегмента.
    let o = 2;
    while (o + 9 < bytes.length) {
      if (bytes[o] !== 0xff) return null;
      const marker = bytes[o + 1];
      // SOF0..SOF15, исключая DHT(C4), JPG(C8), DAC(CC)
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        const height = u16be(bytes, o + 5);
        const width = u16be(bytes, o + 7);
        return width > 0 && height > 0 ? { width, height } : null;
      }
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
        o += 2; // маркеры без длины
        continue;
      }
      const segLen = u16be(bytes, o + 2);
      if (segLen < 2) return null;
      o += 2 + segLen;
    }
    return null;
  }

  // WebP
  if (bytes.length < 30) return null;
  const chunk = String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15]);
  if (chunk === "VP8X") {
    const width = 1 + u24le(bytes, 24);
    const height = 1 + u24le(bytes, 27);
    return { width, height };
  }
  if (chunk === "VP8 ") {
    // lossy: start code 9D 01 2A на offset 23, w/h 14-bit LE на 26/28
    if (bytes[23] !== 0x9d || bytes[24] !== 0x01 || bytes[25] !== 0x2a) return null;
    const width = u16le(bytes, 26) & 0x3fff;
    const height = u16le(bytes, 28) & 0x3fff;
    return width > 0 && height > 0 ? { width, height } : null;
  }
  if (chunk === "VP8L") {
    // lossless: сигнатура 0x2F, затем 4 байта packed-размеров (14 bit каждый)
    if (bytes[20] !== 0x2f) return null;
    const b1 = bytes[21], b2 = bytes[22], b3 = bytes[23], b4 = bytes[24];
    const width = 1 + (((b1 & 0x3f) << 8) | b2);
    const height = 1 + (((b3 & 0xf) << 10) | (b4 << 2) | ((b1 & 0xc0) >> 6));
    return { width, height };
  }
  return null;
}

export interface ValidatedPhoto {
  mime: PhotoMime;
  width: number;
  height: number;
  /** Байты для base64 — уже проверенный буфер. */
  bytes: Uint8Array;
}

/**
 * Полная проверка загрузки: сигнатура совпадает с заявленным типом,
 * размеры в пределах лимита, declared MIME (если передан) не противоречит.
 */
export function validatePhotoUpload(
  bytes: Uint8Array,
  declaredMime?: string | null
): ValidatedPhoto | null {
  if (bytes.length === 0 || bytes.length > PHOTO_MAX_BYTES) return null;
  const mime = detectImageMime(bytes);
  if (!mime || !PHOTO_ACCEPTED_MIMES.includes(mime)) return null;
  if (declaredMime && declaredMime !== mime) return null;
  const size = readImageSize(bytes);
  if (!size) return null;
  if (size.width > PHOTO_MAX_DIMENSION || size.height > PHOTO_MAX_DIMENSION) return null;
  if (size.width < 32 || size.height < 32) return null;
  return { mime, width: size.width, height: size.height, bytes };
}

/* ---------- Белый список категорий и вывод модели ---------- */

export interface PhotoCategory {
  id: string;
  /** Человекочитаемое название для текста ответа. */
  label: string;
  /**
   * Поисковый запрос по проверенной базе протоколов. Формируется нами,
   * а не моделью: токены совпадают с searchKeywords/алиасами решений.
   */
  query: string;
}

export const PHOTO_CATEGORIES: readonly PhotoCategory[] = [
  {
    id: "stain_upholstery",
    label: "Пятно на мягкой мебели",
    query: "пятно вино сок кофе чай диван обивка велюр",
  },
  {
    id: "stain_hard",
    label: "Пятно на твёрдой поверхности",
    query: "пятно пол ламинат паркет плитка камень",
  },
  {
    id: "odor_textile",
    label: "Запах на матрасе или текстиле",
    query: "запах моча пот матрас постельное бельё",
  },
  {
    id: "scale",
    label: "Известковый налёт",
    query: "налёт известковый смеситель сантехника камень",
  },
  {
    id: "grease",
    label: "Жир и нагар на кухне",
    query: "жир нагар копоть кухня плита вытяжка",
  },
  {
    id: "post_renovation",
    label: "Следы после ремонта",
    query: "послестроительная уборка пыль затирка следы ремонт",
  },
  {
    id: "carpet",
    label: "Пятно или запах на ковре",
    query: "пятно запах ковёр ковролин ворс",
  },
  {
    id: "window",
    label: "Окна и стёкла",
    query: "мыть окна стекло разводы стеклопакет",
  },
] as const;

const PHOTO_CATEGORY_IDS = new Set(PHOTO_CATEGORIES.map((c) => c.id));

/** Служебные статусы, которые модель может вернуть вместо категории. */
export type PhotoModelVerdict =
  | { kind: "category"; categoryId: string }
  | { kind: "unclear" }
  | { kind: "not_cleaning" }
  | { kind: "personal_data" }
  | { kind: "invalid" };

const UNCLEAR_TOKENS = new Set(["unclear", "unknown", "none", "unsure", "other"]);
const NOT_CLEANING_TOKENS = new Set(["not_cleaning", "notcleaning", "offtopic", "other_topic"]);
const PERSONAL_TOKENS = new Set(["personal_data", "personal", "document", "face", "selfie"]);

/**
 * Жёсткий парсер вывода классификатора: принимает только строку-одиночный
 * токен из белого списка (или JSON-обёртку {"category":"..."} с ним же).
 * Любой произвольный текст, рецепты или инъекция → invalid → безопасный отказ.
 */
export function parsePhotoModelOutput(raw: string | null | undefined): PhotoModelVerdict {
  if (!raw) return { kind: "invalid" };
  const text = raw.trim().toLowerCase();
  if (!text) return { kind: "invalid" };

  const jsonMatch = text.match(/"(?:category|id|result|verdict)"\s*:\s*"([a-z_]+)"/);
  const token = (jsonMatch?.[1] ?? (text.match(/^[a-z_]+$/)?.[0] ?? "")).toLowerCase();
  if (!token) return { kind: "invalid" };

  if (PHOTO_CATEGORY_IDS.has(token)) return { kind: "category", categoryId: token };
  if (UNCLEAR_TOKENS.has(token)) return { kind: "unclear" };
  if (NOT_CLEANING_TOKENS.has(token)) return { kind: "not_cleaning" };
  if (PERSONAL_TOKENS.has(token)) return { kind: "personal_data" };
  return { kind: "invalid" };
}

export const PHOTO_SYSTEM_PROMPT = [
  "Ты — модуль фото-триажа платформы ChistoLab по клинингу.",
  "По изображению выбери РОВНО ОДНУ категорию загрязнения из списка или служебный статус.",
  "Разрешённые ответы (только один токен, без пояснений):",
  PHOTO_CATEGORIES.map((c) => c.id).join(" | "),
  "| unclear | not_cleaning | personal_data",
  "Правила:",
  "- unclear — задача видна, но не относится к чистке поверхностей, либо фото слишком тёмное/нечёткое/не показывает загрязнение.",
  "- not_cleaning — на фото вообще нет уборочной задачи (еда, люди, природа, техника).",
  "- personal_data — на фото документы, чеки, лица людей, номерные знаки или личные вещи: не анализируй такое фото.",
  "- Никогда не давай рецептов, названий средств, советов и описаний — только токен.",
].join("\n");

const PHOTO_USER_TEXT =
  "Выбери одну категорию загрязнения на этом фото или служебный статус. Ответь одним токеном.";

/**
 * Один вызов Workers AI (Llama 4 Scout, vision). Без авторетраев:
 * ошибка/таймаут обрабатывается маршрутом как unavailable — повторный
 * вызов удвоил бы расход Neurons.
 */
export async function classifyStainPhoto(
  ai: Ai,
  image: Pick<ValidatedPhoto, "mime" | "bytes">
): Promise<PhotoModelVerdict> {
  // base64 порциями: String.fromCharCode(...bytes) падает на больших массивах
  let binary = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < image.bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...image.bytes.subarray(i, i + CHUNK));
  }
  const dataUrl = `data:${image.mime};base64,${btoa(binary)}`;

  const result = await ai.run(PHOTO_MODEL, {
    messages: [
      { role: "system", content: PHOTO_SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: PHOTO_USER_TEXT },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      },
    ],
    max_tokens: 16,
    temperature: 0,
  });

  const r = result as {
    response?: unknown;
    choices?: { message?: { content?: unknown } }[];
  };
  const text =
    typeof r.response === "string"
      ? r.response
      : typeof r.choices?.[0]?.message?.content === "string"
        ? r.choices[0].message.content
        : null;
  return parsePhotoModelOutput(text);
}

/* ---------- Строгий путь ответа из проверенной базы ---------- */

function photoDisclaimer(context?: AssistantContext): string {
  const materialNote = context?.material
    ? ""
    : " Материал покрытия по фото не подтверждён — сначала сделайте пробу состава на скрытом участке.";
  return `Разбор сделан по фото и является ориентиром, а не диагнозом: точный тип загрязнения и материал лучше подтвердить словами.${materialNote}`;
}

function buildPhotoSolutionSummary(
  s: Solution,
  context?: AssistantContext
): AssistantSolutionSummary {
  return {
    id: s.id,
    slug: s.slug,
    title: s.title,
    surface: s.surface,
    material: s.material,
    problemType: s.problemType,
    severity: s.severity,
    relatedCategory: s.relatedCategory,
    diyCostNote: s.diyCostNote,
    proTimeNote: s.proTimeNote,
    whenToCallPro: s.whenToCallPro,
    isGuide: s.id.startsWith("guide-"),
  };
}

/**
 * Собирает AssistantAnswer из протокола проверенной базы: категория фото
 * превращается в поисковый запрос, ранкеры находят решение, ответ —
 * детерминированный (mode "protocol"), без LLM-переформулировки.
 * null — если по категории нет подходящего протокола (честный unclear).
 */
export function buildPhotoProtocolAnswer(params: {
  categoryId: string;
  context?: AssistantContext;
  solutions: Solution[];
  safetyMap: Map<string, ProductSafetyProfile>;
}): AssistantAnswer | null {
  const category = PHOTO_CATEGORIES.find((c) => c.id === params.categoryId);
  if (!category) return null;

  const pool = buildKnowledgePool(params.solutions);
  const query = category.query;
  const ranked = mergeRanked(
    rankSolutions(pool, query, null),
    rankSolutionsByTokens(pool, query)
  );
  const primary = ranked[0];
  if (!primary) return null;

  const ordered = [primary, ...relatedSolutions(primary, pool, 2)];
  const products = filterSafeProducts(
    params.context?.material ? { ...primary, material: params.context.material } : primary,
    params.safetyMap
  );
  const warnings = [
    photoDisclaimer(params.context),
    ...buildContextualWarnings(primary, params.context),
  ];

  const baseVerdict = buildVerdict(primary, params.context);
  // Без подтверждённого материала DIY-вердикт не выдаём: тест на скрытом
  // участке обязателен, честнее «осторожно».
  const verdict =
    params.context?.material || baseVerdict.recommendation !== "diy"
      ? baseVerdict
      : {
          recommendation: "caution" as const,
          badge: baseVerdict.badge,
          summary: `Материал покрытия не подтверждён — сначала проверьте совместимость на скрытом участке. ${baseVerdict.summary}`,
        };

  const orderedSteps = [...primary.diySteps].sort((a, b) => a.order - b.order);

  return {
    mode: "protocol",
    text: buildProtocolAnswer(
      `Фото: ${category.label.toLowerCase()}`,
      primary,
      products,
      params.context
    ),
    verdict,
    firstAid: orderedSteps[0]?.instruction,
    solution: buildPhotoSolutionSummary(primary, params.context),
    steps: orderedSteps,
    products,
    warnings,
    alternatives: ordered.slice(1, 4).map((s) => ({
      id: s.id,
      slug: s.slug,
      title: s.title,
      surface: s.surface,
      problemType: s.problemType,
    })),
    materialOptions: getMaterialOptions(primary.surface),
    followUpQuestions: getFollowUpQuestions(primary),
    confidence: 0.55,
    viaPhoto: true,
  };
}

/** Запасные ответы без AI-разбора: честные уточнения, никогда не «рецепт». */
export function buildPhotoFallbackAnswer(
  kind: "unclear" | "not_cleaning" | "personal_data" | "unavailable",
  pool: Solution[]
): AssistantAnswer {
  const alternatives = pool.slice(0, 4).map((s) => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    surface: s.surface,
    problemType: s.problemType,
  }));

  const copy: Record<typeof kind, { badge: string; text: string }> = {
    unclear: {
      badge: "Не удалось уверенно определить задачу",
      text: "По фото не получилось однозначно понять, что нужно очистить. Опишите задачу словами (что испачкалось и на какой поверхности) или выберите ближайший протокол ниже — точность будет выше.",
    },
    not_cleaning: {
      badge: "Это не задача чистки",
      text: "На фото не видно уборочной задачи. Расскажите словами, что нужно отмыть или вывести — подберём проверенный протокол или мастера в вашем городе.",
    },
    personal_data: {
      badge: "Фото не подходит для разбора",
      text: "Мы не анализируем фото с документами, лицами и личными вещами. Пришлите кадр только самого загрязнения на поверхности — или просто опишите задачу словами.",
    },
    unavailable: {
      badge: "Фото-разбор временно недоступен",
      text: "Сервис фото-подсказки сейчас перегружен или на техническом обслуживании. Опишите задачу словами — текстовый технолог работает в обычном режиме.",
    },
  };
  const c = copy[kind];
  return {
    mode: "empty",
    text: c.text,
    verdict: {
      recommendation: "caution",
      badge: c.badge,
      summary: "Фото-разбор — вспомогательный сценарий: проверенные инструкции работают и без него.",
    },
    steps: [],
    products: [],
    warnings: [],
    alternatives,
    materialOptions: [],
    followUpQuestions: [
      "Как помыть окна без разводов",
      "Пятно красного вина или сока на диване",
      "Запах в холодильнике — чем помыть внутри",
    ],
    confidence: 0,
    viaPhoto: true,
  };
}
