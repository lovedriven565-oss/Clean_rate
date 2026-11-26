"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  type City,
  type CountryCode,
  type CurrencyCode,
  type Market,
  DEFAULT_COUNTRY_CODE,
  MARKETS,
  getCity,
  getMarket,
  isEnabledCountry,
} from "@/lib/markets";

const COOKIE_NAME = "ch_region";
const COOKIE_MAX_AGE_DAYS = 365;

interface RegionState {
  countryCode: CountryCode;
  citySlug: string;
}

interface RegionContextValue extends RegionState {
  market: Market;
  city: City;
  currency: CurrencyCode;
  /**
   * false во время SSR и для посетителей без подтверждённого региона: компоненты
   * показывают нейтральный текст без города и валюты. true только когда регион
   * реально известен — из cookie (автодетект CF-IPCountry для RU/BY) или после
   * ручного выбора в шапке. Без cookie дефолт на Минск не применяется.
   */
  resolved: boolean;
  setRegion: (countryCode: CountryCode, citySlug?: string) => void;
}

const DEFAULT_STATE: RegionState = {
  countryCode: DEFAULT_COUNTRY_CODE,
  citySlug: MARKETS[DEFAULT_COUNTRY_CODE].cities[0].slug,
};

const RegionContext = createContext<RegionContextValue | null>(null);

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
}

function parseRegionCookie(raw: string | undefined): RegionState | null {
  if (!raw) return null;
  const [countryCode, citySlug] = raw.split(":");
  // Cookie выключенного рынка (например, устаревшая KZ до запуска) игнорируется → регион по умолчанию;
  // скрытый город открытого рынка (spb) откатывается на первый открытый (getCity).
  if (!countryCode || !isEnabledCountry(countryCode)) return null;
  return { countryCode, citySlug: getCity(countryCode, citySlug).slug };
}

/**
 * Регион хранится в cookie на клиенте, без IP-редиректов и без региональных URL —
 * это SEO-безопасно и не влияет на индексацию существующих страниц.
 */
export function RegionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<RegionState>(DEFAULT_STATE);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const parsed = parseRegionCookie(readCookie(COOKIE_NAME));
      if (!parsed) return; // нет cookie (не RU/BY) — остаёмся нейтральными, resolved не включаем
      setState((current) => {
        if (current.countryCode === parsed.countryCode && current.citySlug === parsed.citySlug) {
          return current;
        }
        return parsed;
      });
      setResolved(true);
    });
  }, []);

  const setRegion = useCallback((countryCode: CountryCode, citySlug?: string) => {
    const next: RegionState = { countryCode, citySlug: getCity(countryCode, citySlug).slug };
    setState(next);
    setResolved(true);
    writeCookie(COOKIE_NAME, `${next.countryCode}:${next.citySlug}`);
  }, []);

  const value = useMemo<RegionContextValue>(() => {
    const market = getMarket(state.countryCode);
    const city = getCity(state.countryCode, state.citySlug);
    return { ...state, market, city, currency: market.currency, resolved, setRegion };
  }, [state, resolved, setRegion]);

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
}

export function useRegion(): RegionContextValue {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error("useRegion() должен вызываться внутри <RegionProvider>");
  return ctx;
}
