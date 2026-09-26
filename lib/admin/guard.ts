/**
 * Доступ к /admin.
 *
 * В проде раздел закрывается Cloudflare Access (Zero Trust): после прохождения
 * Access edge ставит заголовок cf-access-authenticated-user-email — подделать
 * его с клиента нельзя, Cloudflare срезает входящие cf-access-* заголовки.
 * Локально (next dev / тесты) раздел открыт.
 */
export function isAdminAllowed(headers: Headers): boolean {
  if (process.env.NEXTJS_ENV !== "production") return true;
  return headers.get("cf-access-authenticated-user-email") !== null;
}
