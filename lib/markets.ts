/**
 * Статический конфиг рынков платформы. Без БД — регион живёт в cookie (см. RegionProvider),
 * а не в URL, чтобы не трогать индексацию существующих страниц.
 */

export type CountryCode = "BY" | "RU" | "KZ";

export type CurrencyCode = "BYN" | "RUB" | "KZT";

export interface City {
  slug: string;
  name: string;
}

export interface Market {
  countryCode: CountryCode;
  name: string;
  /** Locale для Intl.NumberFormat/дат — ru-BY, ru-RU, ru-KZ */
  locale: string;
  currency: CurrencyCode;
  /** Телефонный код страны, для будущих форм/масок ввода */
  phoneCode: string;
  cities: City[];
}

export const MARKETS: Record<CountryCode, Market> = {
  BY: {
    countryCode: "BY",
    name: "Беларусь",
    locale: "ru-BY",
    currency: "BYN",
    phoneCode: "+375",
    cities: [
      { slug: "minsk", name: "Минск" },
      { slug: "brest", name: "Брест" },
    ],
  },
  RU: {
    countryCode: "RU",
    name: "Россия",
    locale: "ru-RU",
    currency: "RUB",
    phoneCode: "+7",
    cities: [
      { slug: "moscow", name: "Москва" },
      { slug: "spb", name: "Санкт-Петербург" },
    ],
  },
  KZ: {
    countryCode: "KZ",
    name: "Казахстан",
    locale: "ru-KZ",
    currency: "KZT",
    phoneCode: "+7",
    cities: [
      { slug: "almaty", name: "Алматы" },
      { slug: "astana", name: "Астана" },
    ],
  },
};

export const MARKET_LIST: Market[] = Object.values(MARKETS);

export const DEFAULT_COUNTRY_CODE: CountryCode = "BY";

export function isCountryCode(value: string): value is CountryCode {
  return value in MARKETS;
}

/** Всегда возвращает валидный рынок — при незнакомом коде откатывается на дефолтный (BY). */
export function getMarket(countryCode?: string | null): Market {
  if (countryCode && isCountryCode(countryCode)) return MARKETS[countryCode];
  return MARKETS[DEFAULT_COUNTRY_CODE];
}

export function getDefaultCity(countryCode: CountryCode = DEFAULT_COUNTRY_CODE): City {
  return MARKETS[countryCode].cities[0];
}

export function getCity(countryCode: CountryCode, citySlug?: string | null): City {
  const market = MARKETS[countryCode];
  return market.cities.find((city) => city.slug === citySlug) ?? market.cities[0];
}
