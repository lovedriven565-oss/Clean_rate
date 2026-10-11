/**
 * Доступ к /admin.
 *
 * В проде раздел закрывается Cloudflare Access (Zero Trust): после прохождения
 * Access edge ставит заголовок cf-access-authenticated-user-email — подделать
 * его с клиента нельзя, Cloudflare срезает входящие cf-access-* заголовки.
 * Локально раздел открыт только при явном development (next dev / NEXTJS_ENV=development).
 * Отсутствие переменных в проде не открывает админку: на Workers NEXTJS_ENV не задан по умолчанию,
 * поэтому проверка «!== production» оставляла бы раздел публичным.
 */
export function isAdminAllowed(headers: Headers): boolean {
  if (headers.get("cf-access-authenticated-user-email") !== null) return true;
  return process.env.NEXTJS_ENV === "development" || process.env.NODE_ENV === "development";
}
