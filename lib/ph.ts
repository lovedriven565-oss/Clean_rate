import {
  ACID_RISK_PH,
  ACID_SENSITIVE_SURFACES,
  ALKALI_RISK_PH,
  ALKALI_SENSITIVE_SURFACES,
  checkProductSafety,
} from "@/lib/ads/eligibility";
import { seedProducts, type SeedProduct } from "@/db/seed-data";
import { SURFACE_LABELS, isSurface } from "@/lib/solutions/meta";
import type { ProductSafetyProfile, Solution, SolutionSurface } from "@/lib/types";

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

export type SafetyTrafficLight = "green" | "yellow" | "red";

export interface HumanSafetyBadge {
  light: SafetyTrafficLight;
  verdict: SurfaceVerdict;
  label: string;
  detail: string;
  className: string;
  proPhLabel: string | null;
  compatibleLabels: string[];
  prohibitedLabels: string[];
}

export function formatProPhLabel(ph?: number | null): string | null {
  if (typeof ph !== "number" || !Number.isFinite(ph)) return null;
  return `Для профи: pH ${clampPh(ph).toFixed(1)}`;
}

export function findSeedProduct(
  item: { productId?: string; brandId?: string; productName?: string; note?: string },
  catalog: readonly SeedProduct[] = seedProducts,
): SeedProduct | undefined {
  if (item.productId) {
    const byId = catalog.find((p) => p.id === item.productId || p.slug === item.productId);
    if (byId) return byId;
  }
  const text = `${item.productName ?? ""} ${item.note ?? ""}`.toLowerCase();
  if (text.trim().length > 0) {
    const byName = catalog.find((p) => text.includes(p.name.toLowerCase()));
    if (byName) return byName;
  }
  return undefined;
}

const CAUTION_NOTE_RE = /кислот|щелоч|хлор|растворител|сольвент|антижир|заморозк|цемент/i;
const DELICATE_MATERIAL_RE = /шелк|шёлк|шерст|велюр|кож|замш|мрамор|черн/i;

/**
 * Человеческий светофор безопасности покрытия вместо сухих цифр pH:
 * - green (`bg-success/10 text-success`): «Не оставляет белых разводов · Безопасно для обивки и ворса»
 * - yellow (`bg-star/15 text-star`): «Сначала тест на незаметном шве · Деликатное покрытие»
 * - red (`bg-danger/10 text-danger`): предупреждение о риске смыть краску / оставить ореол
 */
export function buildHumanSafetyBadge(params: {
  product?: ProductSafetyProfile | null;
  surface?: SolutionSurface | string;
  solution?: Partial<Solution> | null;
  note?: string;
}): HumanSafetyBadge {
  const { product, solution, note } = params;
  const surface = params.surface ?? solution?.surface;
  const material = solution?.material ?? "";
  const proPhLabel = formatProPhLabel(product?.ph);
  const compatibleLabels = (product?.compatibleSurfaces ?? []).map(surfaceLabel);
  const prohibitedLabels = (product?.prohibitedSurfaces ?? []).map(surfaceLabel);

  if (product && surface) {
    const safety = checkProductSafety({ product, surface, solution });
    if (!safety.safe) {
      return {
        light: "red",
        verdict: "forbidden",
        label: "Риск смыть краску или оставить вечный ореол",
        detail: safety.reason ?? "Опасно для этого покрытия: может смыть краситель или сжечь ворс.",
        className: "border-danger/25 bg-danger/10 text-danger",
        proPhLabel,
        compatibleLabels,
        prohibitedLabels,
      };
    }

    const sv = surfaceVerdict(product, surface);
    const nonNeutralPh = product.ph !== undefined && phZone(product.ph) !== "neutral";
    if (sv.verdict === "caution" || nonNeutralPh || DELICATE_MATERIAL_RE.test(material)) {
      return {
        light: "yellow",
        verdict: "caution",
        label: "Сначала тест на незаметном шве · Деликатное покрытие",
        detail:
          sv.reason ??
          "Активная формула требует проверки стойкости красителя на скрытом участке и тщательного промывания водой.",
        className: "border-star/30 bg-star/15 text-star",
        proPhLabel,
        compatibleLabels,
        prohibitedLabels,
      };
    }

    return {
      light: "green",
      verdict: "ok",
      label: "Не оставляет белых разводов · Безопасно для обивки и ворса",
      detail: "Нейтральная формула бережно работает по волокнам и покрытию без вымывания цвета.",
      className: "border-success/25 bg-success/10 text-success",
      proPhLabel,
      compatibleLabels,
      prohibitedLabels,
    };
  }

  if (product) {
    const zone = product.ph !== undefined ? phZone(product.ph) : "neutral";
    if (zone === "acid" || zone === "alkali") {
      return {
        light: "red",
        verdict: "forbidden",
        label: "Риск смыть краску или оставить ореол на деликатных покрытиях",
        detail:
          prohibitedLabels.length > 0
            ? `Строго нельзя применять на: ${prohibitedLabels.join(", ")}.`
            : "Концентрированный состав: применять строго по целевым поверхностям.",
        className: "border-danger/25 bg-danger/10 text-danger",
        proPhLabel,
        compatibleLabels,
        prohibitedLabels,
      };
    }
    if (zone !== "neutral") {
      return {
        light: "yellow",
        verdict: "caution",
        label: "Сначала тест на незаметном шве · Деликатное покрытие",
        detail: "Перед обработкой проверьте реакцию материала на скрытом участке.",
        className: "border-star/30 bg-star/15 text-star",
        proPhLabel,
        compatibleLabels,
        prohibitedLabels,
      };
    }
    return {
      light: "green",
      verdict: "ok",
      label: "Не оставляет белых разводов · Безопасно для обивки и ворса",
      detail: "Бережная формула без агрессивных кислот и щелочей.",
      className: "border-success/25 bg-success/10 text-success",
      proPhLabel,
      compatibleLabels,
      prohibitedLabels,
    };
  }

  if (CAUTION_NOTE_RE.test(note ?? "") || DELICATE_MATERIAL_RE.test(material)) {
    return {
      light: "yellow",
      verdict: "caution",
      label: "Сначала тест на незаметном шве · Деликатное покрытие",
      detail: "Проверьте состав на скрытом шве перед основной обработкой.",
      className: "border-star/30 bg-star/15 text-star",
      proPhLabel: null,
      compatibleLabels: surface ? [surfaceLabel(surface)] : [],
      prohibitedLabels: [],
    };
  }

  return {
    light: "green",
    verdict: "ok",
    label: "Не оставляет белых разводов · Безопасно для обивки и ворса",
    detail: "Подходит для бережной домашней чистки по шагам протокола.",
    className: "border-success/25 bg-success/10 text-success",
    proPhLabel: null,
    compatibleLabels: surface ? [surfaceLabel(surface)] : [],
    prohibitedLabels: [],
  };
}

