import type { BrandFocus, ProductCategory } from "./types";

export const focusLabels: Record<BrandFocus, string> = {
  technika: "Техника",
  himiya: "Химия",
  inventory: "Инвентарь",
  service: "Сервис",
};

export const productCategoryLabels: Record<ProductCategory, string> = {
  extractors: "Экстракторы",
  chemistry: "Химия",
  robots: "Роботы-пылесосы",
  windows: "Мойка окон",
  inventory: "Инвентарь",
};

/**
 * Оценивает относительную яркость hex-цвета (#RRGGBB).
 * При luminance > 0.55 (например, фирменный жёлтый Kärcher #FFC800) возвращает true,
 * что гарантирует WCAG-контрастный тёмный текст поверх светлого фона.
 */
export function isLightColor(hexColor?: string): boolean {
  if (!hexColor || !hexColor.startsWith("#")) return false;
  const hex = hexColor.slice(1);
  if (hex.length !== 3 && hex.length !== 6) return false;
  const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.55;
}
