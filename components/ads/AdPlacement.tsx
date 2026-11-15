import { AdCreative } from "@/components/ads/AdCreative";
import { AdSlotPlaceholder } from "@/components/ads/AdSlotPlaceholder";
import { EmptySlotPitch } from "@/components/ads/EmptySlotPitch";
import { getEligibleAd } from "@/lib/ads/queries";
import { AD_FORMATS } from "@/lib/ads/media-kit";
import { buildSlotPlaceholder } from "@/lib/ads/presentation";
import type { AdPlacement as AdPlacementKind, AdTargetContext } from "@/lib/types";

/** Короткие имена мест для заглушек; без записи — название формата медиакита. */
const SLOT_LABELS: Partial<Record<AdPlacementKind, string>> = {
  "home.editorial_partner": "Партнёрский блок на главной",
  "rating.category_partner": "Генеральный партнёр категории",
  "search.sponsored_result": "Рекламный результат в поиске",
  "products.sponsored_slot": "Полка средств по зонам",
  "brand.profile_campaign": "Кампания на странице бренда",
  "dealer.local_partner": "Официальный дилер",
  "solution.sponsored_product": "Спонсорский состав в протоколе",
};

/** Плейсмент → формат медиакита, чей `placement` совпадает (первый подходящий). */
function formatForPlacement(placement: AdPlacementKind) {
  return AD_FORMATS.find((f) => f.placement === placement) ?? null;
}

/**
 * Серверный рекламный слот. Запрашивает единственную одобренную кампанию через Eligibility Gate
 * и рендерит нативный шаблон прямо в HTML — без клиентской подгрузки, поэтому CLS = 0.
 * Нет подходящей кампании → заглушка «место свободно» с ценой и ссылкой на форму
 * (кроме `search.sponsored_result`, где заглушка не показывается никогда).
 *
 * На SSG-страницах страна пользователя неизвестна: серверный гейт работает без гео-фильтра,
 * а кампании с ограниченным списком стран дополнительно проверяются на клиенте (AdImpression).
 */
export async function AdPlacement({
  placement,
  context,
  showPitchWhenEmpty = false,
  pitchOnly = false,
  placeholder = true,
  variant = "card",
  className,
}: {
  placement: AdPlacementKind;
  context: AdTargetContext;
  showPitchWhenEmpty?: boolean;
  /** Рендерить только карточку свободного слота (когда кампании нет); активная кампания здесь не показывается. */
  pitchOnly?: boolean;
  /** Показывать заглушку «место свободно», когда кампании нет. */
  placeholder?: boolean;
  variant?: "strip" | "card" | "poster";
  className?: string;
}) {
  const ad = await getEligibleAd(placement, context);
  if (!ad) {
    if ((showPitchWhenEmpty || pitchOnly) && placement === "solution.sponsored_product") {
      return (
        <EmptySlotPitch
          solutionSlug={context.solutionSlug}
          surface={context.surface}
          className={className}
        />
      );
    }
    if (placeholder) {
      const format = formatForPlacement(placement);
      const meta = buildSlotPlaceholder({
        placement,
        format: format ?? null,
        label: SLOT_LABELS[placement],
        solutionSlug: context.solutionSlug,
        surface: context.surface,
        categoryIds: context.categoryId ? [context.categoryId] : undefined,
      });
      if (meta) {
        return (
          <div className={className}>
            <AdSlotPlaceholder meta={meta} variant={variant} />
          </div>
        );
      }
    }
    return null;
  }
  if (pitchOnly) return null;

  return <AdCreative ad={ad} surface={context.surface} className={className} />;
}
