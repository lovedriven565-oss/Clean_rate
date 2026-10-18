/**
 * Zero-PII: полные контакты B2B-заявки уходят только транзитом в Telegram отдела партнёрств,
 * а в D1 (зарубежная БД Cloudflare) остаются сведения о юрлице/бренде и обезличенный след контакта.
 */

/** Что пишется в D1 вместо имени контактного лица. */
export const TRANSIT_CONTACT_LABEL = "Транзитно в Telegram";
export const CONTACT_HASH_PREFIX = "tg-sha256:";
const CONTACT_HASH_HEX_LENGTH = 16;

/**
 * Нормализация перед хешированием: один и тот же телефон в любом формате
 * (`+375 (29) 123-45-67` и `375291234567`) даёт один дайджест — для поиска дублей заявок.
 */
export function normalizeContact(contact: string): string {
  const trimmed = contact.trim().toLowerCase();
  if (trimmed.includes("@")) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 7 ? digits : trimmed;
}

/**
 * Необратимый SHA-256 дайджест контакта `tg-sha256:<16 hex>`. Перец (`PII_HASH_PEPPER`, секрет Workers)
 * защищает от перебора по словарю телефонов: без него хеш короткого номера восстановим брутфорсом.
 */
export async function hashContactForAudit(contact: string, pepper = ""): Promise<string> {
  const material = pepper ? `${pepper}:${normalizeContact(contact)}` : normalizeContact(contact);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(material));
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${CONTACT_HASH_PREFIX}${hex.slice(0, CONTACT_HASH_HEX_LENGTH)}`;
}

export interface RedactedLeadPii {
  /** Метка транзита вместо ФИО или null, если имя не указывали. */
  contactName: string | null;
  contactHash: string;
}

/** Обезличивает персональные поля заявки перед записью в D1. Свободный текст в D1 не пишется вовсе. */
export async function redactLeadPii(
  lead: { contactName?: string | null; contact: string },
  pepper = ""
): Promise<RedactedLeadPii> {
  return {
    contactName: lead.contactName?.trim() ? TRANSIT_CONTACT_LABEL : null,
    contactHash: await hashContactForAudit(lead.contact, pepper),
  };
}

export function piiHashPepper(): string {
  return process.env.PII_HASH_PEPPER ?? "";
}
