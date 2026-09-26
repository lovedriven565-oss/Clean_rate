import type { Metadata } from "next";
import { ENABLED_MARKETS } from "@/lib/markets";

/**
 * Публичный адрес сайта для canonical/sitemap/OpenGraph.
 * Задаётся через NEXT_PUBLIC_SITE_URL (wrangler vars / .env); fallback — рабочий домен платформы.
 */
export const SITE_NAME = "Клининг Рейтинг";

/**
 * Версия политики конфиденциальности, под которую зафиксировано согласие
 * в B2B-формах. Менять при существенном обновлении текста /privacy.
 */
export const PRIVACY_CONSENT_VERSION = "privacy-2026-09";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://cleaning-rating.by").replace(/\/+$/, "");

export function absoluteUrl(path = "/"): string {
  return new URL(path, `${SITE_URL}/`).toString();
}

/**
 * canonical + hreflang-заготовка для страницы. Регион живёт в cookie, поэтому все локали
 * открытых рынков (ENABLED_MARKETS) указывают на один URL. При переезде на /{country}/{city}/ —
 * подставить региональные адреса здесь, вызывающий код менять не придётся.
 *
 * Next.js не мерджит вложенный `alternates` из layout и page — поэтому хелпер обязателен
 * везде, где страница задаёт собственный canonical.
 */
export function pageAlternates(path = "/"): NonNullable<Metadata["alternates"]> {
  const url = absoluteUrl(path);
  return {
    canonical: url,
    languages: Object.fromEntries([
      ...ENABLED_MARKETS.map((market) => [market.locale, url]),
      ["ru", url],
      ["x-default", url],
    ]),
  };
}
