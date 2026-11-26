/**
 * Очищает пропущенный поисковый запрос перед записью в «Радар спроса»:
 * отсекает email, телефонные номера, адреса с длинными числами и ссылки,
 * сохраняя только поисковые слова (Zero-PII).
 */
export function sanitizeDemandSearchQuery(raw: string): string | null {
  let q = raw.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "");
  q = q.replace(/[\d+()\-\s]{5,}/g, " ");
  q = q.replace(/https?:\/\/\S+/gi, " ");
  q = q.replace(/[^\p{L}\p{N}\s-]/gu, " ");
  q = q.trim().replace(/\s+/g, " ");
  if (q.length < 2 || !/\p{L}/u.test(q)) return null;
  return q.slice(0, 80);
}
