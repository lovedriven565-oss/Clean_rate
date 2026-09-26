import { MARKETS, getMarketByCity, type CurrencyCode, type Market } from "@/lib/markets";

/**
 * Форматирование цены в валюте рынка (BYN/RUB/KZT) через Intl.NumberFormat.
 * Принимает либо код валюты, либо объект рынка — так удобнее вызывать из RegionProvider.
 */
export function formatMarketCurrency(value: number, market: Market | CurrencyCode): string {
  const { locale, currency } = typeof market === "string" ? { locale: localeForCurrency(market), currency: market } : market;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

/** Цена компании в валюте рынка с учётом единицы измерения ("м²", "окно", "шт" и т.п.) */
export function formatMarketPriceFrom(value: number, market: Market | CurrencyCode, unit?: string): string {
  const formatted = formatMarketCurrency(value, market);
  return unit ? `${formatted}/${unit}` : formatted;
}

/** Цена компании в валюте её рынка: валюта определяется городом компании, а не регионом посетителя. */
export function formatCompanyPriceFrom(priceFrom: number, company: { city: string; priceUnit?: string }): string {
  return formatMarketPriceFrom(priceFrom, getMarketByCity(company.city), company.priceUnit);
}

function localeForCurrency(currency: CurrencyCode): string {
  const found = Object.values(MARKETS).find((market) => market.currency === currency);
  return found?.locale ?? "ru-RU";
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(Math.round(value));
}

export function formatRating(value: number): string {
  return value.toFixed(1);
}

/** Русское склонение: pluralize(3, ["шаг", "шага", "шагов"]) → "3 шага" */
export function pluralize(count: number, forms: [string, string, string]): string {
  const abs = Math.abs(count) % 100;
  const last = abs % 10;
  const form =
    abs > 10 && abs < 20 ? forms[2] : last > 1 && last < 5 ? forms[1] : last === 1 ? forms[0] : forms[2];
  return `${count} ${form}`;
}

export function formatSignedNumber(value: number): string {
  const rounded = Math.round(value);
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${formatNumber(rounded)}`;
}
