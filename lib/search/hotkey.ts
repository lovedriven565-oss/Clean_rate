/** Минимальный срез KeyboardEvent — чтобы хелпер тестировался без DOM. */
export interface HotkeyEventLike {
  key: string;
  code?: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
}

/**
 * Хоткей командного поиска в стиле Linear: `/` вне полей ввода и `⌘K` / `Ctrl+K` везде.
 * Проверяется и `key`, и физический `code`, чтобы хоткей работал в русской раскладке
 * (`Ctrl+Л` и клавиша «.» на месте `/`).
 */
export function isSearchHotkey(event: HotkeyEventLike, targetIsEditable: boolean): boolean {
  const modifier = Boolean(event.metaKey || event.ctrlKey);
  if (modifier && !event.altKey && (event.code === "KeyK" || event.key.toLowerCase() === "k")) return true;
  if (modifier || event.altKey || targetIsEditable) return false;
  return event.key === "/" || event.code === "Slash";
}

/** Поле ввода, где `/` — обычный символ, а не хоткей. */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || typeof target !== "object") return false;
  const el = target as { tagName?: string; isContentEditable?: boolean };
  return el.isContentEditable === true || el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT";
}
