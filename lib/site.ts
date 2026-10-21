import type { Metadata } from "next";
import { ENABLED_MARKETS } from "@/lib/markets";

/**
 * Публичный адрес сайта для canonical/sitemap/OpenGraph.
 * Задаётся через NEXT_PUBLIC_SITE_URL (wrangler vars / .env); fallback — рабочий домен платформы.
 */
export const SITE_NAME = "ChistoLab";

/** Домен платформы и доменная зона (используются в логотипе, OG и бейджах). */
export const SITE_DOMAIN = "chistolab.pro";
export const SITE_TLD = ".pro";

/** Короткий слоган для OG-картинок, манифеста и подписи логотипа. */
export const SITE_TAGLINE = "Лаборатория решений чистоты и честный рейтинг компаний";

/**
 * Монограмма знака (favicon, логотип, OG, бейдж): первые буквы слов или CamelCase-частей SITE_NAME.
 * Для "ChistoLab" даёт "CL", для двухсловного названия — первые буквы двух слов.
 */
export const SITE_MONOGRAM = (() => {
  const words = SITE_NAME.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return words
      .slice(0, 2)
      .map((word) => word[0]!.toUpperCase())
      .join("");
  }
  const capitals = SITE_NAME.match(/[A-ZА-ЯЁ]/g);
  if (capitals && capitals.length >= 2) {
    return capitals.slice(0, 2).join("");
  }
  return SITE_NAME.slice(0, 2).toUpperCase();
})();

/** Фирменные цвета для растровых картинок (ImageResponse не читает CSS-переменные). */
export const BRAND_COLORS = {
  ink: "#0d1110",
  inkSoft: "#161d1b",
  primary: "#176347",
  primaryBright: "#a0e637",
  brand: "#92db24",
  brandForeground: "#0c1d17",
  paper: "#f4f6f5",
  muted: "#9caba4",
} as const;

/**
 * Версия политики конфиденциальности, под которую зафиксировано согласие
 * в B2B-формах. Менять при существенном обновлении текста /privacy.
 */
export const PRIVACY_CONSENT_VERSION = "privacy-2026-10-zero-pii";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://chistolab.pro").replace(/\/+$/, "");

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
