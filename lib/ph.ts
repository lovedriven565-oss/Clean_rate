import {
  ACID_RISK_PH,
  ACID_SENSITIVE_SURFACES,
  ALKALI_RISK_PH,
  ALKALI_SENSITIVE_SURFACES,
  checkProductSafety,
} from "@/lib/ads/eligibility";
import { SURFACE_LABELS, isSurface } from "@/lib/solutions/meta";
import type { ProductSafetyProfile } from "@/lib/types";

export const PH_MIN = 0;
export const PH_MAX = 14;

export type PhZone = "acid" | "mild-acid" | "neutral" | "mild-alkali" | "alkali";

/** Зоны шкалы: верхняя граница (не включительно для кислот, включительно для нейтрали). */
export const PH_ZONES: { zone: PhZone; from: number; to: number; label: string }[] = [
  { zone: "acid", from: 0, to: 3, label: "Сильная кислота" },
  { zone: "mild-acid", from: 3, to: 6, label: "Кислотный" },
  { zone: "neutral", from: 6, to: 8, label: "Нейтральный" },
  { zone: "mild-alkali", from: 8, to: 11, label: "Щелочной" },
  { zone: "alkali", from: 11, to: 14, label: "Сильная щёлочь" },
];

export function clampPh(ph: number): number {
  return Math.min(PH_MAX, Math.max(PH_MIN, ph));
}

export function phZone(ph: number): PhZone {
  const value = clampPh(ph);
  if (value < 3) return "acid";
  if (value < 6) return "mild-acid";
  if (value <= 8) return "neutral";
  if (value <= 11) return "mild-alkali";
  return "alkali";
}

export function phZoneLabel(ph: number): string {
  const zone = phZone(ph);
  return PH_ZONES.find((z) => z.zone === zone)!.label;
}

/** Позиция маркера на шкале, 0–100 %. */
export function phPosition(ph: number): number {
  return (clampPh(ph) / PH_MAX) * 100;
}

/** Опасные для поверхности участки шкалы — те же пороги, что в фильтре безопасности. */
export function riskZonesForSurface(surface: string): { from: number; to: number }[] {
  const key = surface.toLowerCase();
  const zones: { from: number; to: number }[] = [];
  if (ACID_SENSITIVE_SURFACES.has(key)) zones.push({ from: PH_MIN, to: ACID_RISK_PH });
  if (ALKALI_SENSITIVE_SURFACES.has(key)) zones.push({ from: ALKALI_RISK_PH, to: PH_MAX });
  return zones;
}

export type SurfaceVerdict = "ok" | "caution" | "forbidden";

/** Поверхности и материалы из паспортов продуктов и фильтра безопасности. */
const MATERIAL_LABELS: Record<string, string> = {
  marble: "Мрамор",
  limestone: "Известняк",
  travertine: "Травертин",
  terrazzo: "Терраццо",
  concrete: "Бетон",
  enamel: "Эмаль",
  cement: "Цемент",
  wool: "Шерсть",
  silk: "Шёлк",
  natural_wood: "Дерево",
  linoleum: "Линолеум",
  aluminum: "Алюминий",
  leather: "Кожа",
};

export function surfaceLabel(value: string): string {
  if (isSurface(value)) return SURFACE_LABELS[value];
  return MATERIAL_LABELS[value] ?? value;
}

/**
 * Вердикт для пары «средство × поверхность». Запрет берётся из того же фильтра безопасности,
 * что допускает рекламу (checkProductSafety), — шкала не может разойтись с реальной проверкой.
 * «Можно» — только при явном допуске производителя или нейтральном pH; иначе «осторожно».
 */
export function surfaceVerdict(product: ProductSafetyProfile, surface: string): { verdict: SurfaceVerdict; reason?: string } {
  const safety = checkProductSafety({ product, surface });
  if (!safety.safe) return { verdict: "forbidden", reason: safety.reason };
  if (product.compatibleSurfaces?.some((s) => s.toLowerCase() === surface.toLowerCase())) return { verdict: "ok" };
  if (product.ph !== undefined && phZone(product.ph) === "neutral") return { verdict: "ok" };
  return { verdict: "caution", reason: "Производитель не указывает эту поверхность: проверьте на незаметном участке." };
}
