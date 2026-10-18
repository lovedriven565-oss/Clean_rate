import { CATEGORY_SLUGS } from "@/lib/categories";
import type { Category, CategoryId, IntentKeyword, SearchIntent, Solution } from "@/lib/types";

/** Окно радара: текущие N дней против предыдущих N дней. */
export const DEMAND_WINDOW_DAYS = 30;

export const INTENT_LABELS: Record<SearchIntent, string> = {
  b2c: "Для дома B2C",
  b2b: "Для бизнеса B2B",
  pro: "Для профи PRO",
};

/** Агрегат analytics_events: число событий сущности за текущее и предыдущее окно. */
export interface DemandEventCount {
  entityType: string;
  entityId: string;
  eventType: string;
  period: "current" | "previous";
  count: number;
}

/** Пропущенный поиск (confidence < 0.5) из /api/search — «ищут и не находят». */
export interface MissedSearch {
  query: string;
  intent?: SearchIntent;
}

export interface DemandTopic {
  slug: string;
  title: string;
  keywords: number;
  weight: number;
  views: number;
  previousViews: number;
}

export interface DemandIntentShare {
  intent: SearchIntent;
  label: string;
  weight: number;
  /** Доля веса ключей интента, 0–100. */
  share: number;
  missed: number;
}

export interface DemandCategoryTrend {
  id: CategoryId;
  name: string;
  current: number;
  previous: number;
  /** Изменение к предыдущему окну в процентах; null — в прошлом окне событий не было. */
  delta: number | null;
}

export interface DemandRadar {
  windowDays: number;
  hasEvents: boolean;
  topics: DemandTopic[];
  intents: DemandIntentShare[];
  categories: DemandCategoryTrend[];
  missedQueries: { query: string; count: number }[];
}

const TOP_TOPICS = 8;
const TOP_MISSED = 8;

export function percentDelta(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * «Радар спроса» для /admin: чистая функция поверх индекса интентов (веса ключей) и обезличенных
 * событий. Без событий (dev, пустая D1) радар честно показывает только семантический вес ключей.
 */
export function buildDemandRadar(input: {
  keywords: IntentKeyword[];
  solutions: Solution[];
  categories: Category[];
  companies: { id: string; slug: string; categories: CategoryId[] }[];
  events: DemandEventCount[];
  missed: MissedSearch[];
}): DemandRadar {
  const { keywords, solutions, categories, companies, events, missed } = input;
  const solutionBySlug = new Map(solutions.map((s) => [s.slug, s]));

  // 1. Темы: ключи интентов, сгруппированные по протоколу + реальные просмотры его страницы.
  const topics = new Map<string, DemandTopic>();
  for (const keyword of keywords) {
    if (keyword.targetKind !== "solution") continue;
    const solution = solutionBySlug.get(keyword.targetSlug);
    if (!solution) continue;
    const topic = topics.get(solution.slug) ?? {
      slug: solution.slug,
      title: solution.title,
      keywords: 0,
      weight: 0,
      views: 0,
      previousViews: 0,
    };
    topic.keywords += 1;
    topic.weight += keyword.weight;
    topics.set(solution.slug, topic);
  }

  // 2. Интерес к категориям: просмотры протоколов, посадочных и действия с карточками компаний.
  const categoryCounts = new Map<CategoryId, { current: number; previous: number }>();
  const categoryBySlug = new Map(Object.entries(CATEGORY_SLUGS).map(([id, slug]) => [slug, id as CategoryId]));
  const companyCategories = new Map<string, CategoryId[]>();
  for (const company of companies) {
    companyCategories.set(company.id, company.categories);
    companyCategories.set(company.slug, company.categories);
  }
  function bumpCategory(id: CategoryId | undefined, period: DemandEventCount["period"], count: number) {
    if (!id) return;
    const entry = categoryCounts.get(id) ?? { current: 0, previous: 0 };
    entry[period] += count;
    categoryCounts.set(id, entry);
  }

  for (const event of events) {
    if (event.entityType === "page" && event.eventType === "view") {
      const [, section, slug] = event.entityId.split("/");
      if (section === "solutions" && slug) {
        const solution = solutionBySlug.get(slug);
        if (!solution) continue;
        const topic = topics.get(slug) ?? {
          slug,
          title: solution.title,
          keywords: 0,
          weight: 0,
          views: 0,
          previousViews: 0,
        };
        if (event.period === "current") topic.views += event.count;
        else topic.previousViews += event.count;
        topics.set(slug, topic);
        bumpCategory(solution.relatedCategory, event.period, event.count);
      } else if (section === "companies" && slug) {
        for (const id of companyCategories.get(slug) ?? []) bumpCategory(id, event.period, event.count);
      } else if (slug) {
        // Посадочные /[city]/[category]: /minsk/himchistka-mebeli
        bumpCategory(categoryBySlug.get(slug), event.period, event.count);
      }
    } else if (event.entityType === "company") {
      for (const id of companyCategories.get(event.entityId) ?? []) bumpCategory(id, event.period, event.count);
    }
  }

  // 3. Распределение интентов: доля веса ключей + пропущенные запросы по интентам.
  const intentOrder: SearchIntent[] = ["b2c", "b2b", "pro"];
  const totalWeight = keywords.reduce((sum, k) => sum + k.weight, 0);
  const intents = intentOrder.map((intent) => {
    const weight = keywords.filter((k) => k.intent === intent).reduce((sum, k) => sum + k.weight, 0);
    return {
      intent,
      label: INTENT_LABELS[intent],
      weight,
      share: totalWeight > 0 ? Math.round((weight / totalWeight) * 100) : 0,
      missed: missed.filter((m) => m.intent === intent).length,
    };
  });

  // 4. Пропущенные запросы: нормализованы и сгруппированы.
  const missedCounts = new Map<string, number>();
  for (const { query } of missed) {
    const normalized = query.trim().toLowerCase().replace(/\s+/g, " ");
    if (normalized) missedCounts.set(normalized, (missedCounts.get(normalized) ?? 0) + 1);
  }

  return {
    windowDays: DEMAND_WINDOW_DAYS,
    hasEvents: events.length > 0,
    topics: [...topics.values()]
      .sort((a, b) => b.views - a.views || b.weight - a.weight || a.title.localeCompare(b.title, "ru"))
      .slice(0, TOP_TOPICS),
    intents,
    categories: categories
      .map((category) => {
        const counts = categoryCounts.get(category.id) ?? { current: 0, previous: 0 };
        return { id: category.id, name: category.name, ...counts, delta: percentDelta(counts.current, counts.previous) };
      })
      .sort((a, b) => b.current - a.current || a.name.localeCompare(b.name, "ru")),
    missedQueries: [...missedCounts.entries()]
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count || a.query.localeCompare(b.query, "ru"))
      .slice(0, TOP_MISSED),
  };
}
