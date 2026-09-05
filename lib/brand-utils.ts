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
