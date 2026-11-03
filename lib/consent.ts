/**
 * Согласие на внешнюю аналитику (Яндекс Метрика, Cloudflare Web Analytics).
 * Cookie `ch_consent`: "all" — счётчики разрешены, "essential" — отклонены,
 * отсутствие значения — пользователь ещё не выбирал (баннер показывается).
 * Собственная аналитика платформы Zero-PII (без cookies и идентификаторов)
 * относится к технически необходимой и от согласия не зависит.
 */

export type ConsentValue = "all" | "essential";

export const CONSENT_COOKIE = "ch_consent";
const CONSENT_MAX_AGE_DAYS = 365;

/** CustomEvent для мгновенной реакции компонентов после выбора в баннере. */
export const CONSENT_EVENT = "ch:consent";

export function readConsent(): ConsentValue | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`));
  const value = match ? decodeURIComponent(match[1]) : null;
  return value === "all" || value === "essential" ? value : null;
}

export function writeConsent(value: ConsentValue) {
  if (typeof document === "undefined") return;
  const maxAge = CONSENT_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${maxAge}; samesite=lax`;
  window.dispatchEvent(new CustomEvent<ConsentValue>(CONSENT_EVENT, { detail: value }));
}
