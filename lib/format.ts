import { MARKETS, type CurrencyCode, type Market } from "@/lib/markets";

export function formatCurrency(value: number): string {
  const formatted = new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
  return `${formatted} BYN`;
}

/** Цена компании с учётом единицы измерения ("м²", "окно", "шт" и т.п.) */
export function formatPriceFrom(value: number, unit?: string): string {
  return unit ? `${formatCurrency(value)}/${unit}` : formatCurrency(value);
}

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

function localeForCurrency(currency: CurrencyCode): string {
  const found = Object.values(MARKETS).find((market) => market.currency === currency);
  return found?.locale ?? "ru-RU";
}

export function formatBYN(value: number): string {
  return `${new Intl.NumberFormat("ru-RU").format(Math.round(value))} BYN`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(Math.round(value));
}

export function formatRating(value: number): string {
  return value.toFixed(1);
}

export function formatSignedNumber(value: number): string {
  const rounded = Math.round(value);
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${formatNumber(rounded)}`;
}
