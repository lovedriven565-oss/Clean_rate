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
  /** Домен Яндекс Карт для ссылок «Маршрут» */
  mapsHost: string;
  /**
   * Рынок открыт для пользователей: есть в селекторе региона, hreflang и копирайте.
   * Выключенный рынок остаётся в конфиге (данные, сметы), но не показывается, пока в нём нет компаний.
   */
  enabled: boolean;
  cities: City[];
}

export const MARKETS: Record<CountryCode, Market> = {
  BY: {
    countryCode: "BY",
    name: "Беларусь",
    locale: "ru-BY",
    currency: "BYN",
    phoneCode: "+375",
    mapsHost: "yandex.by",
    enabled: true,
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
    mapsHost: "yandex.ru",
    enabled: false,
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
    mapsHost: "yandex.kz",
    enabled: false,
    cities: [
      { slug: "almaty", name: "Алматы" },
      { slug: "astana", name: "Астана" },
    ],
  },
};

export const MARKET_LIST: Market[] = Object.values(MARKETS);

/** Рынки, открытые пользователям (селектор региона, hreflang, формы). */
export const ENABLED_MARKETS: Market[] = MARKET_LIST.filter((market) => market.enabled);

export const DEFAULT_COUNTRY_CODE: CountryCode = "BY";

export function isCountryCode(value: string): value is CountryCode {
  return value in MARKETS;
}

export function isEnabledCountry(value: string): value is CountryCode {
  return isCountryCode(value) && MARKETS[value].enabled;
}

/**
 * Всегда возвращает валидный открытый рынок: незнакомый или выключенный код (например, старая
 * cookie RU) откатывается на дефолтный (BY).
 */
export function getMarket(countryCode?: string | null): Market {
  if (countryCode && isEnabledCountry(countryCode)) return MARKETS[countryCode];
  return MARKETS[DEFAULT_COUNTRY_CODE];
}

/** Рынок по названию города компании; неизвестный город — дефолтный рынок. */
export function getMarketByCity(cityName: string): Market {
  return MARKET_LIST.find((market) => market.cities.some((city) => city.name === cityName)) ?? MARKETS[DEFAULT_COUNTRY_CODE];
}

export function getDefaultCity(countryCode: CountryCode = DEFAULT_COUNTRY_CODE): City {
  return MARKETS[countryCode].cities[0];
}

export function getCity(countryCode: CountryCode, citySlug?: string | null): City {
  const market = MARKETS[countryCode];
  return market.cities.find((city) => city.slug === citySlug) ?? market.cities[0];
}
