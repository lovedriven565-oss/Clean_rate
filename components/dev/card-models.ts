import type { Company, RatingSource, Solution } from "@/lib/types";
import { formatCompanyPriceFrom, pluralize } from "@/lib/format";
import {
  AUDIENCE_LABELS,
  PROBLEM_TYPE_LABELS,
  SEVERITY_LABELS,
  SURFACE_LABELS,
  solutionSummary,
} from "@/lib/solutions/meta";

/**
 * Модели карточек прототипа A (/dev/design/a-vitrina, этап 1.5).
 * Чистые функции: task и company строятся из реальных данных, product и ad —
 * явные образцы без выдуманных цен, рейтингов, ссылок и совместимости.
 */

export type CardKind = "task" | "product" | "company" | "ad";
export type CardBadgeTone = "demo" | "sponsor" | "ad" | "info";

export interface CardFact {
  label: string;
  value: string;
}

export interface CardBadge {
  label: string;
  tone: CardBadgeTone;
  title?: string;
}

export interface CardQuickView {
  points: string[];
  cautions: string[];
  source: string;
}

export interface CardModel {
  id: string;
  kind: CardKind;
  kindLabel: string;
  title: string;
  summary: string;
  facts: CardFact[];
  badges: CardBadge[];
  /** undefined — слота изображения нет; объект — слот есть и может оказаться недоступным. */
  img?: { src: string; alt: string };
  href: string | null;
  hrefLabel: string;
  quick: CardQuickView;
}

export const CARD_KIND_LABELS: Record<CardKind, string> = {
  task: "Задача",
  product: "Средство",
  company: "Компания",
  ad: "Реклама",
};

export const RISK_NOTE =
  "Справочная информация, не оферта и не гарантия результата. Проверьте на незаметном участке и следуйте инструкции производителя — решение и ответственность за применение за вами.";

const TASK_IMAGES: Record<string, string> = {
  stain: "/dev/a-tasks/stains.jpg",
  odor: "/dev/a-tasks/odors.jpg",
  scale: "/dev/a-tasks/bathroom.jpg",
  postrenovation: "/dev/a-tasks/renovation.jpg",
  general: "/dev/a-tasks/office.jpg",
};

function taskImage(s: Pick<Solution, "surface" | "problemType">): string {
  if (s.surface === "kitchen") return "/dev/a-tasks/kitchen.jpg";
  if (s.surface === "bathroom" || s.surface === "window") return "/dev/a-tasks/bathroom.jpg";
  return TASK_IMAGES[s.problemType] ?? TASK_IMAGES.general;
}

export function clampText(text: string, max: number): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.5 ? cut.slice(0, space) : cut).replace(/[\s,.;:—-]+$/, "")}…`;
}

export function buildTaskCard(solution: Solution): CardModel {
  const steps = solution.diySteps.slice(0, 3).map((s) => clampText(s.instruction, 160));
  const points = [...steps];
  if (solution.whenToCallPro) points.push(`Когда звать мастера: ${clampText(solution.whenToCallPro, 160)}`);
  return {
    id: `task-${solution.slug}`,
    kind: "task",
    kindLabel: CARD_KIND_LABELS.task,
    title: solution.title,
    summary: solutionSummary(solution, 140),
    facts: [
      { label: "Поверхность", value: SURFACE_LABELS[solution.surface] },
      { label: "Тип", value: PROBLEM_TYPE_LABELS[solution.problemType] },
      { label: "Сложность", value: SEVERITY_LABELS[solution.severity] },
      { label: "Протокол", value: pluralize(solution.diySteps.length, ["шаг", "шага", "шагов"]) },
    ],
    badges: [{ label: AUDIENCE_LABELS[solution.audience], tone: "info" }],
    // Тематическая фотография не показывает конкретный результат — alt пустой.
    img: { src: taskImage(solution), alt: "" },
    href: `/solutions/${solution.slug}`,
    hrefLabel: "Открыть протокол",
    quick: {
      points,
      cautions: solution.warnings.slice(0, 3).map((w) => clampText(w, 160)),
      source: "Типовой протокол платформы, справочный характер.",
    },
  };
}

const RATING_SOURCE_LABELS: Record<RatingSource, string> = {
  google: "Google",
  yandex: "Яндекс",
  unverified: "источник не подтверждён",
  new: "новая компания",
};

/**
 * Отображение рейтинга или факта доверия:
 * 1. При подтверждённом источнике (Google/Яндекс) и наличии отзывов — честная оценка.
 * 2. Если компания — спонсор или верифицирована редакцией, но внешних отзывов нет —
 *    выводим статус доверия («Спонсор показа · Профиль проверен» / «Профиль проверен редакцией»).
 * 3. Иначе — честное «Рейтинг не публикуется».
 */
export function companyRatingText(
  company: Pick<Company, "ratingSource" | "baseRating" | "reviewCount" | "promoted" | "verified">,
): string {
  const source = company.ratingSource;
  if ((source === "google" || source === "yandex") && company.reviewCount > 0 && company.baseRating > 0) {
    return `${company.baseRating.toFixed(1)} · ${pluralize(company.reviewCount, ["отзыв", "отзыва", "отзывов"])} · ${RATING_SOURCE_LABELS[source]}`;
  }
  if (company.promoted && company.verified) {
    return "Спонсор показа · Профиль проверен";
  }
  if (company.promoted) {
    return "Спонсор показа";
  }
  if (company.verified) {
    return "Профиль проверен редакцией";
  }
  return "Рейтинг не публикуется";
}

export function buildCompanyCard(company: Company): CardModel {
  const badges: CardBadge[] = [];
  if (company.verified) {
    badges.push({ label: "Профиль проверен", tone: "info", title: "Контакты и юрлицо проверены редакцией." });
  }
  if (company.promoted) {
    badges.push({ label: "Спонсор", tone: "sponsor", title: "Платное размещение. Органический рейтинг не зависит от оплаты." });
  }
  const price = company.priceFrom ? `от ${formatCompanyPriceFrom(company.priceFrom, company)}` : "Цена по запросу";
  return {
    id: `company-${company.slug}`,
    kind: "company",
    kindLabel: CARD_KIND_LABELS.company,
    title: company.name,
    summary: clampText(company.description, 140),
    facts: [
      { label: "Город", value: company.city },
      { label: "Рейтинг", value: companyRatingText(company) },
      { label: "Цена", value: price },
    ],
    badges,
    href: `/companies/${company.slug}`,
    hrefLabel: "Профиль компании",
    quick: {
      points: [
        ...(company.experienceYears ? [`Опыт: ${pluralize(company.experienceYears, ["год", "года", "лет"])}`] : []),
        ...(company.guarantees ?? []).slice(0, 2).map((g) => `Гарантия: ${clampText(g, 120)}`),
        ...(company.address ? [`Адрес: ${company.address}`] : []),
      ],
      cautions: [
        "Цена ориентировочная: итог определяется после оценки объёма и условий.",
        ...(company.promoted
          ? ["Размещение спонсорское: позиция в блоке не зависит от органического балла."]
          : company.ratingSource === "unverified" || company.ratingSource === "new"
            ? ["Внешний рейтинг Google/Яндекс пока не подтверждён."]
            : []),
      ],
      source: company.promoted
        ? "Спонсор платформы. Профиль и контакты проверены редакцией."
        : `Источник рейтинга: ${RATING_SOURCE_LABELS[company.ratingSource ?? "unverified"]}.`,
    },
  };
}

/** Явный демо-образец: каждое поле, которого нет в контракте продукта, помечено как не указанное. */
export function buildProductSampleCard(): CardModel {
  return {
    id: "product-sample",
    kind: "product",
    kindLabel: CARD_KIND_LABELS.product,
    title: "Образец карточки средства",
    summary: "Макет структуры. Название, назначение и состав появятся из паспорта реального продукта.",
    facts: [
      { label: "Назначение", value: "не указано" },
      { label: "Ограничения", value: "не указаны" },
      { label: "Цена", value: "не указана" },
      { label: "Наличие", value: "не указано" },
    ],
    badges: [{ label: "Демо-образец", tone: "demo", title: "Не реальный продукт: данных в каталоге пока нет." }],
    img: { src: "/dev/a-missing/product-sample.jpg", alt: "Изображение средства не загружено" },
    href: null,
    hrefLabel: "Страница средства появится вместе с данными",
    quick: {
      points: [
        "Назначение и подходящие поверхности — из инструкции производителя.",
        "Цена и наличие — от продавца, с датой актуальности.",
      ],
      cautions: ["Совместимость с материалом не заявлена: данных нет."],
      source: "Источник: паспорт продукта и инструкция производителя (после появления данных).",
    },
  };
}

/** Рекламный образец: отдельная маркировка, без ссылок, цен и утверждений о составе. */
export function buildAdSampleCard(): CardModel {
  return {
    id: "ad-sample",
    kind: "ad",
    kindLabel: CARD_KIND_LABELS.ad,
    title: "Образец рекламного размещения",
    summary: "Платный формат вне органической выдачи. Оплата не влияет на порядок решений, рейтинг и допуск.",
    facts: [
      { label: "Рекламодатель", value: "не указан (образец)" },
      { label: "Формат", value: "нативная карточка" },
    ],
    badges: [{ label: "Реклама", tone: "ad", title: "Платное размещение." }],
    href: null,
    hrefLabel: "Ссылка не подключена (образец)",
    quick: {
      points: ["Показывается только при допущенной кампании; без кампании блока нет."],
      cautions: ["Рекламное утверждение не является рекомендацией платформы."],
      source: "Маркировка «Реклама» обязательна и не скрывается.",
    },
  };
}

export const LONG_CONTENT_TITLE =
  "Очень длинное название карточки для проверки переноса: средство для удаления застарелых многослойных загрязнений с натуральных поверхностей";

/** Синтетический образец для витрины состояний (подписан как макет). */
export function buildLongContentSample(): CardModel {
  const words = "очень длинное описание без пробелов-разрывов ".repeat(8);
  return {
    id: "long-sample",
    kind: "task",
    kindLabel: CARD_KIND_LABELS.task,
    title: LONG_CONTENT_TITLE,
    summary: words.trim(),
    facts: [
      { label: "Поверхность", value: "Натуральный камень, мрамор, известняк и другие пористые материалы" },
      { label: "Тип", value: "Сложный случай" },
    ],
    badges: [{ label: "Макет состояния", tone: "demo" }],
    href: null,
    hrefLabel: "Макет без ссылки",
    quick: {
      points: [words.trim(), words.trim()],
      cautions: [words.trim()],
      source: "Макет для проверки длинного содержимого.",
    },
  };
}
