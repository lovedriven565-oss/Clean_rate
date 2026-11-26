import { ENABLED_MARKETS, openCities } from "@/lib/markets";

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
  ink: "#1a1a1a",
  inkSoft: "#262626",
  primary: "#0f7a5f",
  primaryBright: "#c8f03d",
  brand: "#c8f03d",
  brandForeground: "#1a1a1a",
  mint: "#2eb89a",
  paper: "#f7f7f7",
  muted: "#a3a3a3",
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

/** Стабильный @id организации — связывает WebSite, HowTo, LocalBusiness в @graph. */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

/** Единый узел Organization для Schema.org-графов сайта. */
export function buildOrganizationNode(): Record<string, unknown> {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/logo.png"),
      width: 512,
      height: 512,
    },
    description:
      "Лаборатория решений чистоты: пошаговые протоколы, честный рейтинг клининговых компаний и бренды для профи.",
  };
}

export interface SiteAlternates {
  canonical: string;
  languages: Record<string, string>;
}

/** canonical + hreflang для глобальных страниц (решения, бренды, сервисные разделы).
 * Региональных URL у этих страниц нет — все рынки читают один канонический адрес,
 * поэтому дублирующие ru-BY/ru-RU/ru-KZ на один URL не выводим: для Google это
 * сигнал «страницы идентичны», а не региональное разделение.
 *
 * Next.js не мерджит вложенный `alternates` из layout и page — поэтому хелпер обязателен
 * везде, где страница задаёт собственный canonical.
 */
export function pageAlternates(path = "/"): SiteAlternates {
  const url = absoluteUrl(path);
  return {
    canonical: url,
    languages: {
      ru: url,
      "x-default": url,
    },
  };
}

/**
 * OpenGraph + Twitter-карточка страницы с canonical URL.
 * Без этого дочерние страницы наследуют openGraph главной из root layout
 * (og:url = SITE_URL), и шаринг подстраниц показывает главную.
 */
export function pageSocialMeta(
  path: string,
  title: string,
  description: string,
  type: "website" | "article" = "website"
) {
  return {
    openGraph: { title, description, url: absoluteUrl(path), type },
    twitter: { card: "summary_large_image" as const, title, description },
  };
}

/**
 * canonical + перекрёстный hreflang для региональных URL `/{city}` и `/{city}/{category}`.
 * Каждому открытому рынку соответствует его первый открытый город: BY→minsk,
 * RU→moscow, KZ→almaty. `includeCitySlugs` позволяет не отдавать hreflang на
 * региональную страницу, которая сама noindex (тонкая посадочная).
 */
export function cityAlternates(
  citySlug: string,
  categorySlug?: string,
  options?: { includeCitySlugs?: ReadonlySet<string> }
): SiteAlternates {
  const pathFor = (slug: string) => (categorySlug ? `/${slug}/${categorySlug}` : `/${slug}`);
  const canonical = absoluteUrl(pathFor(citySlug));
  const languages: Record<string, string> = {};
  let xDefault: string | undefined;

  for (const market of ENABLED_MARKETS) {
    const cities = openCities(market);
    const city = cities.find((c) => c.slug === citySlug) ?? cities[0];
    if (!city) continue;
    if (options?.includeCitySlugs && !options.includeCitySlugs.has(city.slug)) continue;
    const url = absoluteUrl(pathFor(city.slug));
    languages[market.locale] = url;
    // x-default один на весь hreflang-кластер: URL первого индексируемого рынка,
    // а не canonical текущей страницы (иначе он «плавает» от города к городу).
    xDefault ??= url;
  }

  languages.ru = canonical;
  languages["x-default"] = xDefault ?? canonical;

  return { canonical, languages };
}
