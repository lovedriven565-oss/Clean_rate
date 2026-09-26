import type {
  AdCtaType,
  AdPlacement,
  AdTargetContext,
  Brand,
  Campaign,
  EligibleAd,
  ProductSafetyProfile,
  Solution,
  SolutionSurface,
} from "../types";

/**
 * Результат проверки безопасности продукта для поверхности и протокола.
 */
export interface SafetyCheckResult {
  safe: boolean;
  reason?: string;
  incompatibleAttributes?: string[];
}

/**
 * Поверхности, чувствительные к кислотам (pH < 6).
 * На этих поверхностях кислотная химия может вызвать необратимое химическое травление.
 */
/** Ниже этого pH состав считается кислотным для чувствительных поверхностей. */
export const ACID_RISK_PH = 6;
/** Выше этого pH состав считается агрессивной щёлочью для чувствительных поверхностей. */
export const ALKALI_RISK_PH = 9.5;

export const ACID_SENSITIVE_SURFACES: ReadonlySet<string> = new Set([
  "marble",
  "limestone",
  "travertine",
  "terrazzo",
  "concrete",
  "enamel",
  "cement",
]);

/**
 * Поверхности и волокна, чувствительные к агрессивным щелочам (pH > 9.5).
 * Щелочи разрушают белковые волокна (шерсть, шелк), повреждают линолеум и натуральное дерево.
 */
export const ALKALI_SENSITIVE_SURFACES: ReadonlySet<string> = new Set([
  "wool",
  "silk",
  "natural_wood",
  "linoleum",
  "aluminum",
]);

/**
 * Проверяет химическую безопасность продукта для указанной поверхности и протокола решения.
 * Гарантирует, что спонсорский продукт не повредит поверхность пользователя.
 */
export function checkProductSafety(params: {
  product: ProductSafetyProfile;
  surface?: string;
  solution?: Partial<Solution> | null;
}): SafetyCheckResult {
  const { product, surface, solution } = params;
  const targetSurface = surface || solution?.surface;
  const targetMaterial = solution?.material?.toLowerCase() || "";

  // 1. Проверка прямого запрета поверхности в спецификации продукта
  if (targetSurface && product.prohibitedSurfaces && product.prohibitedSurfaces.length > 0) {
    const isProhibited = product.prohibitedSurfaces.some(
      (ps) => ps.toLowerCase() === targetSurface.toLowerCase()
    );
    if (isProhibited) {
      return {
        safe: false,
        reason: `Продукт запрещён производителем для поверхности «${targetSurface}»`,
        incompatibleAttributes: ["surface_prohibited"],
      };
    }
  }

  // 2. Проверка кислотной чувствительности (pH < 6)
  if (product.ph !== undefined && product.ph < ACID_RISK_PH) {
    if (targetSurface && ACID_SENSITIVE_SURFACES.has(targetSurface.toLowerCase())) {
      return {
        safe: false,
        reason: `Кислотный состав (pH ${product.ph}) опасен для кислото-чувствительной поверхности «${targetSurface}»`,
        incompatibleAttributes: ["acid_conflict"],
      };
    }
    // Если в материале решения явно указан мрамор, известняк или эмаль
    if (targetMaterial.includes("мрамор") || targetMaterial.includes("эмаль") || targetMaterial.includes("известняк")) {
      return {
        safe: false,
        reason: `Кислотный состав (pH ${product.ph}) несовместим с материалом «${targetMaterial}»`,
        incompatibleAttributes: ["acid_conflict"],
      };
    }
  }

  // 3. Проверка щелочной чувствительности (pH > 9.5)
  if (product.ph !== undefined && product.ph > ALKALI_RISK_PH) {
    if (targetSurface && ALKALI_SENSITIVE_SURFACES.has(targetSurface.toLowerCase())) {
      return {
        safe: false,
        reason: `Высокощелочной состав (pH ${product.ph}) опасен для чувствительной поверхности «${targetSurface}»`,
        incompatibleAttributes: ["alkali_conflict"],
      };
    }
    if (targetMaterial.includes("шерсть") || targetMaterial.includes("шелк") || targetMaterial.includes("дерево")) {
      return {
        safe: false,
        reason: `Щелочной состав (pH ${product.ph}) разрушает деликатные волокна/материал «${targetMaterial}»`,
        incompatibleAttributes: ["alkali_conflict"],
      };
    }
  }

  // 4. Проверка текстовых предупреждений протокола решения
  if (solution?.warnings && solution.warnings.length > 0) {
    const lowerWarnings = solution.warnings.join(" ").toLowerCase();

    // Запрет кислот в протоколе
    if (lowerWarnings.includes("кислот") && lowerWarnings.includes("не используй") && product.ph !== undefined && product.ph < 6.5) {
      return {
        safe: false,
        reason: "Протокол решения запрещает использование кислотных составов для этого пятна/материала",
        incompatibleAttributes: ["protocol_warning_acid"],
      };
    }

    // Запрет щелочей в протоколе
    if (lowerWarnings.includes("щелоч") && lowerWarnings.includes("не используй") && product.ph !== undefined && product.ph > 8.5) {
      return {
        safe: false,
        reason: "Протокол решения запрещает использование щелочных составов для этого пятна/материала",
        incompatibleAttributes: ["protocol_warning_alkali"],
      };
    }

    // Запрет хлора/отбеливателей
    if (
      lowerWarnings.includes("хлор") &&
      product.hazards?.some((h) => h.toLowerCase().includes("chlorine") || h.toLowerCase().includes("хлор"))
    ) {
      return {
        safe: false,
        reason: "Протокол решения запрещает хлорсодержащие средства",
        incompatibleAttributes: ["chlorine_conflict"],
      };
    }
  }

  return { safe: true };
}

/**
 * Проверка соответствия (relevance threshold) продукта задаче решения.
 */
export function checkProductRelevance(params: {
  product: ProductSafetyProfile;
  solution?: Partial<Solution> | null;
  surface?: string;
  campaignTargetSolutions?: string[] | null;
  campaignTargetSurfaces?: string[] | null;
}): { relevant: boolean; reason?: string; relevanceScore: number } {
  const { product, solution, surface, campaignTargetSolutions, campaignTargetSurfaces } = params;
  const targetSurface = surface || solution?.surface;

  // 1. Прямое совпадение со списком решений в протоколе
  if (solution) {
    const inProtocol = solution.recommendedProducts?.some(
      (rp) => rp.productId === product.id || (rp.brandId && rp.brandId === product.brandId)
    );
    if (inProtocol) {
      return {
        relevant: true,
        reason: "Продукт или бренд подтверждён в официальном протоколе решения",
        relevanceScore: 100,
      };
    }
  }

  // 2. Прямой таргетинг кампании на конкретный slug решения
  if (solution?.slug && campaignTargetSolutions && campaignTargetSolutions.includes(solution.slug)) {
    return {
      relevant: true,
      reason: `Кампания напрямую авторизована для задачи «${solution.title || solution.slug}»`,
      relevanceScore: 80,
    };
  }

  // 3. Совпадение по допустимой поверхности продукта
  if (targetSurface && product.compatibleSurfaces && product.compatibleSurfaces.length > 0) {
    const surfaceMatches = product.compatibleSurfaces.some(
      (cs) => cs.toLowerCase() === targetSurface.toLowerCase()
    );
    if (surfaceMatches) {
      return {
        relevant: true,
        reason: `Продукт сертифицирован для обработки поверхности «${targetSurface}»`,
        relevanceScore: 60,
      };
    }
  }

  // 4. Таргетинг кампании по поверхности
  if (targetSurface && campaignTargetSurfaces && campaignTargetSurfaces.includes(targetSurface)) {
    return {
      relevant: true,
      reason: `Кампания таргетирована на поверхность «${targetSurface}»`,
      relevanceScore: 50,
    };
  }

  return {
    relevant: false,
    reason: "Продукт не имеет доказанного соответствия текущей задаче или поверхности",
    relevanceScore: 0,
  };
}

/**
 * Полный результат проверки допуска рекламной кампании.
 */
export interface EligibilityResult {
  eligible: boolean;
  reason?: string;
  matchScore: number;
}

/**
 * Серверная проверка допуска кампании к показу (Ad Eligibility Gate).
 * Проверяет:
 * - статус кампании (только active);
 * - временное окно (startsAt, endsAt);
 * - лимиты показов и кликов;
 * - таргетинг по стране;
 * - таргетинг по категории;
 * - безопасность химического состава и порог релевантности (для спонсорских продуктов).
 */
export function checkCampaignEligibility(params: {
  campaign: Campaign;
  context: AdTargetContext;
  product?: ProductSafetyProfile | null;
  solution?: Partial<Solution> | null;
  now?: Date;
}): EligibilityResult {
  const { campaign, context, product, solution } = params;
  const now = (params.now || new Date()).getTime();

  // 1. Статус кампании
  if (campaign.status !== "active") {
    return { eligible: false, reason: `Кампания не активна (статус: ${campaign.status})`, matchScore: 0 };
  }

  // 2. Временные рамки
  if (campaign.startsAt && now < campaign.startsAt.getTime()) {
    return { eligible: false, reason: "Срок действия кампании ещё не начался", matchScore: 0 };
  }
  if (campaign.endsAt && now > campaign.endsAt.getTime()) {
    return { eligible: false, reason: "Срок действия кампании истёк", matchScore: 0 };
  }

  // 3. Бюджет показов / кликов
  if (campaign.maxImpressions && campaign.currentImpressions >= campaign.maxImpressions) {
    return { eligible: false, reason: "Лимит показов кампании исчерпан", matchScore: 0 };
  }
  if (campaign.maxClicks && campaign.currentClicks >= campaign.maxClicks) {
    return { eligible: false, reason: "Лимит кликов кампании исчерпан", matchScore: 0 };
  }

  // 4. Географический таргетинг
  if (
    campaign.targetCountries &&
    campaign.targetCountries.length > 0 &&
    context.countryCode &&
    !campaign.targetCountries.includes(context.countryCode.toUpperCase())
  ) {
    return {
      eligible: false,
      reason: `Кампания не таргетирована на страну ${context.countryCode}`,
      matchScore: 0,
    };
  }

  // 5. Категорийный таргетинг
  if (
    campaign.targetCategories &&
    campaign.targetCategories.length > 0 &&
    context.categoryId &&
    !campaign.targetCategories.includes(context.categoryId)
  ) {
    return {
      eligible: false,
      reason: `Кампания не таргетирована на категорию ${context.categoryId}`,
      matchScore: 0,
    };
  }

  let totalScore = (campaign.priority || 0) * 10;

  // 6. Проверка для плейсмента solution.sponsored_product
  if (campaign.placement === "solution.sponsored_product") {
    // Необходим продукт для спонсорского слота продукта
    if (!product) {
      return {
        eligible: false,
        reason: "Для слота solution.sponsored_product не указан продукт кампании",
        matchScore: 0,
      };
    }

    // Safety Gate: проверка безопасности состава
    const safety = checkProductSafety({
      product,
      surface: context.surface || (solution?.surface as SolutionSurface),
      solution,
    });

    if (!safety.safe) {
      return {
        eligible: false,
        reason: safety.reason || "Продукт не прошёл контроль безопасности",
        matchScore: 0,
      };
    }

    // Relevance Gate: проверка релевантности задаче
    const relevance = checkProductRelevance({
      product,
      solution,
      surface: context.surface || (solution?.surface as SolutionSurface),
      campaignTargetSolutions: campaign.targetSolutions,
      campaignTargetSurfaces: campaign.targetSurfaces,
    });

    if (!relevance.relevant) {
      return {
        eligible: false,
        reason: relevance.reason || "Продукт не соответствует задаче",
        matchScore: 0,
      };
    }

    totalScore += relevance.relevanceScore;
  }

  // 7. Проверка для rating.category_partner
  if (campaign.placement === "rating.category_partner") {
    if (context.categoryId && campaign.targetCategories?.includes(context.categoryId)) {
      totalScore += 50;
    } else if (campaign.targetCategories && campaign.targetCategories.length > 0 && !context.categoryId) {
      // Кампания таргетирована на категорию, а в контексте категории нет
      return {
        eligible: false,
        reason: "Кампания требует указания категории в контексте",
        matchScore: 0,
      };
    }
  }

  return { eligible: true, matchScore: totalScore };
}

/**
 * Фильтрует список кампаний по допускам и возвращает отсортированный по релевантности список.
 */
export function filterAndRankEligibleCampaigns(
  campaigns: Campaign[],
  context: AdTargetContext,
  options?: {
    productsMap?: Map<string, ProductSafetyProfile>;
    solution?: Partial<Solution> | null;
    now?: Date;
  }
): Array<{ campaign: Campaign; matchScore: number }> {
  const eligible: Array<{ campaign: Campaign; matchScore: number }> = [];

  for (const campaign of campaigns) {
    const product = campaign.productId && options?.productsMap
      ? options.productsMap.get(campaign.productId) || null
      : null;

    const result = checkCampaignEligibility({
      campaign,
      context,
      product,
      solution: options?.solution,
      now: options?.now,
    });

    if (result.eligible) {
      eligible.push({ campaign, matchScore: result.matchScore });
    }
  }

  // Сортировка: наивысший matchScore (релевантность + приоритет), при равенстве — более свежая
  eligible.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return b.campaign.createdAt.getTime() - a.campaign.createdAt.getTime();
  });

  return eligible;
}

/**
 * По умолчанию определяет текст бейджа в зависимости от плейсмента.
 */
export function defaultBadgeText(placement: AdPlacement): string {
  switch (placement) {
    case "solution.sponsored_product":
      return "Спонсорский вариант";
    case "rating.category_partner":
      return "Партнёр категории";
    case "home.editorial_partner":
      return "Партнёр сезона";
    case "products.sponsored_slot":
      return "Рекомендуемый состав";
    case "brand.profile_campaign":
      return "Официальное предложение";
    case "dealer.local_partner":
      return "Авторизованный дилер";
    default:
      return "Реклама";
  }
}

/**
 * Собирает готовый к рендерингу объект EligibleAd.
 */
export function resolveEligibleAd(
  campaign: Campaign,
  options: {
    brand: Brand;
    product?: ProductSafetyProfile | null;
    reasonText?: string;
  }
): EligibleAd {
  const { brand, product, reasonText } = options;

  const title = campaign.title || (product ? product.name : brand.name);
  const description =
    campaign.description ||
    (product
      ? `Сертифицированный состав от ${brand.name}`
      : brand.tagline || brand.description);

  const ctaType: AdCtaType = campaign.ctaType || (campaign.placement === "dealer.local_partner" ? "where_to_buy" : "website");
  const ctaText = campaign.ctaText || defaultCtaText(ctaType);
  const ctaUrl = campaign.ctaUrl || brand.affiliateUrl || brand.id;

  return {
    campaignId: campaign.id,
    brandId: brand.id,
    brandName: brand.name,
    brandSlug: brand.slug,
    brandLogo: brand.logo,
    productId: product?.id,
    productName: product?.name,
    productSlug: product?.slug,
    productPh: product?.ph,
    productCompatibleSurfaces: product?.compatibleSurfaces,
    brandAccent: brand.accent,
    placement: campaign.placement,
    title,
    description,
    ctaText,
    ctaUrl,
    ctaType,
    badgeText: campaign.badgeText || defaultBadgeText(campaign.placement),
    reasonText,
    targetCountries: campaign.targetCountries ?? null,
  };
}

function defaultCtaText(ctaType: AdCtaType): string {
  switch (ctaType) {
    case "where_to_buy":
      return "Где купить";
    case "request_quote":
      return "Запросить оптовый прайс";
    case "training":
      return "Записаться на обучение";
    case "demo":
      return "Запросить демо";
    case "website":
    default:
      return "Перейти на сайт";
  }
}
