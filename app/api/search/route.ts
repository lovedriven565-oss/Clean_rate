import { NextResponse } from "next/server";
import {
  KeywordProvider,
  type IntentClassification,
  type SearchProvider,
} from "@/lib/search/intent-router";
import { getSearchBindings, SemanticProvider } from "@/lib/search/semantic";
import {
  getAllBrands,
  getAllCompanies,
  getAllSolutions,
  getIntentKeywords,
  recordAnalyticsEvent,
} from "@/lib/db/queries";
import { matchesQuery, mergeRanked, rankSolutions, rankSolutionsByTokens } from "@/lib/search/rank";
import { getMarket, isCountryCode } from "@/lib/markets";
import { checkRateLimit, tooManyRequests } from "@/lib/security/guard";
import type { Brand, Company, Solution } from "@/lib/types";

const REGION_COOKIE = "ch_region";
const RESULT_LIMIT = 6;

export interface SearchResultSolution {
  slug: string;
  title: string;
  problemType: Solution["problemType"];
  audience: Solution["audience"];
}

export interface SearchResultCompany {
  slug: string;
  name: string;
  city: string;
  priceFrom?: number;
  priceUnit?: string;
}

export interface SearchResultBrand {
  slug: string;
  name: string;
  tagline: string;
  focus: Brand["focus"];
}

export interface SearchResponse {
  query: string;
  intent: IntentClassification["intent"];
  target: IntentClassification["target"];
  confidence: number;
  solutions: SearchResultSolution[];
  companies: SearchResultCompany[];
  brands: SearchResultBrand[];
}

function readCookieValue(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  const match = cookieHeader.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function countryFromRegionCookie(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const [countryCode] = raw.split(":");
  return countryCode && isCountryCode(countryCode) ? countryCode : undefined;
}

function rankBrands(brands: Brand[], normalizedQuery: string, target: IntentClassification["target"]): Brand[] {
  const bySlug = target?.kind === "brand" ? brands.find((b) => b.slug === target.slug) : undefined;
  const matched = brands.filter(
    (b) => b.slug !== bySlug?.slug && matchesQuery([b.name, b.tagline, b.slug], normalizedQuery)
  );
  return [...(bySlug ? [bySlug] : []), ...matched];
}

function rankCompanies(companies: Company[], normalizedQuery: string, cityNames: string[]): Company[] {
  const inMarket = companies.filter((c) => cityNames.includes(c.city));
  const matched = inMarket.filter((c) =>
    matchesQuery([c.name, c.city, ...c.tags], normalizedQuery)
  );
  // Если явных совпадений нет — не показываем случайные компании рынка,
  // чтобы не подменять «умный» поиск шумом.
  return matched.length > 0 ? matched : [];
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") ?? "").trim();

  const countryCode = countryFromRegionCookie(
    readCookieValue(request.headers.get("cookie"), REGION_COOKIE)
  );
  const market = getMarket(countryCode);
  const cityNames = market.cities.map((c) => c.name);

  if (!query) {
    const empty: SearchResponse = {
      query: "",
      intent: "b2c",
      target: null,
      confidence: 0,
      solutions: [],
      companies: [],
      brands: [],
    };
    return NextResponse.json(empty, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  }

  if (!(await checkRateLimit(request, "SEARCH_LIMITER", "search"))) return tooManyRequests();

  const [keywords, solutions, brands, companies, searchEnv] = await Promise.all([
    getIntentKeywords(),
    getAllSolutions(),
    getAllBrands(),
    getAllCompanies(),
    getSearchBindings(),
  ]);

  // Семантический провайдер (Workers AI + Vectorize) при наличии биндингов,
  // иначе — ключевые слова. Интерфейс SearchProvider скрывает разницу.
  const provider: SearchProvider = searchEnv
    ? new SemanticProvider(searchEnv, new KeywordProvider(keywords))
    : new KeywordProvider(keywords);
  const classification = await provider.classify(query);
  const normalizedQuery = query.trim().toLowerCase();

  const solutionResults = mergeRanked(
    rankSolutions(solutions, normalizedQuery, classification.target),
    rankSolutionsByTokens(solutions, normalizedQuery)
  ).slice(0, RESULT_LIMIT);
  const brandResults = rankBrands(brands, normalizedQuery, classification.target).slice(0, RESULT_LIMIT);
  const companyResults =
    classification.intent === "pro"
      ? []
      : rankCompanies(companies, normalizedQuery, cityNames).slice(0, RESULT_LIMIT);

  const response: SearchResponse = {
    query,
    intent: classification.intent,
    target: classification.target,
    confidence: classification.confidence,
    solutions: solutionResults.map((s) => ({
      slug: s.slug,
      title: s.title,
      problemType: s.problemType,
      audience: s.audience,
    })),
    companies: companyResults.map((c) => ({
      slug: c.slug,
      name: c.name,
      city: c.city,
      priceFrom: c.priceFrom,
      priceUnit: c.priceUnit,
    })),
    brands: brandResults.map((b) => ({
      slug: b.slug,
      name: b.name,
      tagline: b.tagline,
      focus: b.focus,
    })),
  };

  // Пропуски поиска — будущий «индекс спроса»: какие проблемы ищут и не находят.
  // Записываются в analytics_events (entity_id="search") и видны в /admin-отчётах.
  if (classification.confidence < 0.5) {
    await recordAnalyticsEvent({
      entityType: "page",
      entityId: "search",
      eventType: "view",
      path: "/api/search",
      countryCode,
      metadata: { query, confidence: classification.confidence, intent: classification.intent },
    });
  }

  // Компании зависят от cookie региона: общий CDN-кеш отдал бы чужой рынок, поэтому только private.
  return NextResponse.json(response, {
    headers: { "Cache-Control": "private, max-age=60", Vary: "Cookie" },
  });
}
