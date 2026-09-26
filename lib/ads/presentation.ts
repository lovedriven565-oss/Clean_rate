import type { AdCtaType, EligibleAd, SolutionSurface } from "@/lib/types";
import { SURFACE_LABELS, isSurface } from "@/lib/solutions/meta";

/**
 * Презентационный слой рекламы: чистые функции без React, чтобы маркировка, CTA и
 * «почему подходит» были единообразны во всех шаблонах и проверялись тестами.
 */

/** Постоянная текстовая маркировка — видна всегда, не прячется в tooltip. */
export const AD_MARK_LABEL = "Реклама";

export type AdCtaIcon = "store" | "quote" | "training" | "demo" | "external";

export interface AdCtaMeta {
  label: string;
  /** Короткая подпись под CTA: объясняет, что произойдёт после клика */
  hint: string;
  icon: AdCtaIcon;
}

export const AD_CTA_META: Record<AdCtaType, AdCtaMeta> = {
  where_to_buy: { label: "Где купить у дилера", hint: "Официальные дилеры и наличие в вашей стране", icon: "store" },
  request_quote: { label: "Запросить оптовый прайс", hint: "Условия для клининговых компаний и B2B", icon: "quote" },
  training: { label: "Записаться на обучение", hint: "Практика с технологом бренда", icon: "training" },
  demo: { label: "Запросить демо", hint: "Показ оборудования на вашем объекте", icon: "demo" },
  website: { label: "Перейти на сайт", hint: "Официальный сайт бренда", icon: "external" },
};

export function adCtaMeta(ad: Pick<EligibleAd, "ctaType" | "ctaText">): AdCtaMeta {
  const base = AD_CTA_META[ad.ctaType] ?? AD_CTA_META.website;
  return { ...base, label: ad.ctaText || base.label };
}

/** Класс pH для человека: без химических терминов, но с честной границей. */
export function describePh(ph: number): string {
  if (ph < 6) return `pH ${ph} — кислотный состав`;
  if (ph > 8) return `pH ${ph} — щелочной состав`;
  return `pH ${ph} — нейтральный, безопасен для волокон и цвета`;
}

function surfaceLabel(value: string): string | null {
  return isSurface(value) ? SURFACE_LABELS[value] : null;
}

/**
 * «Почему подходит»: 1–3 проверяемых факта из гейта допуска и паспорта продукта.
 * Никаких неподтверждённых claims — только то, что подтвердил Eligibility Gate.
 */
export function buildAdReasons(
  ad: Pick<EligibleAd, "reasonText" | "productPh" | "productCompatibleSurfaces">,
  currentSurface?: SolutionSurface | string
): string[] {
  const reasons: string[] = [];

  if (ad.reasonText) reasons.push(ad.reasonText);
  if (ad.productPh !== undefined) reasons.push(describePh(ad.productPh));

  const labels = (ad.productCompatibleSurfaces ?? [])
    .map((s) => ({ key: s, label: surfaceLabel(s) }))
    .filter((s): s is { key: string; label: string } => s.label !== null);

  if (labels.length > 0) {
    const current = currentSurface ? labels.find((s) => s.key === currentSurface) : undefined;
    const ordered = current ? [current, ...labels.filter((s) => s.key !== current.key)] : labels;
    reasons.push(`Допущен производителем для: ${ordered.map((s) => s.label.toLowerCase()).join(", ")}`);
  }

  return reasons.slice(0, 3);
}

/** Сущность для аналитики: продукт, если он есть у кампании, иначе бренд. */
export function adTrackingEntity(ad: Pick<EligibleAd, "productId" | "brandId">): {
  entityType: "product" | "brand";
  entityId: string;
} {
  return ad.productId ? { entityType: "product", entityId: ad.productId } : { entityType: "brand", entityId: ad.brandId };
}

/**
 * Клиентский гео-гейт для SSG-страниц: на сервере страна неизвестна, поэтому кампания с
 * ограниченным списком стран скрывается, если регион пользователя (cookie) в него не входит.
 */
export function isAdVisibleInCountry(ad: Pick<EligibleAd, "targetCountries">, countryCode?: string): boolean {
  if (!ad.targetCountries || ad.targetCountries.length === 0 || !countryCode) return true;
  return ad.targetCountries.includes(countryCode.toUpperCase());
}
