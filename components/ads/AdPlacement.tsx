import { AdCreative } from "@/components/ads/AdCreative";
import { EmptySlotPitch } from "@/components/ads/EmptySlotPitch";
import { getEligibleAd } from "@/lib/ads/queries";
import type { AdPlacement as AdPlacementKind, AdTargetContext } from "@/lib/types";

/**
 * Серверный рекламный слот. Запрашивает единственную одобренную кампанию через Eligibility Gate
 * и рендерит нативный шаблон прямо в HTML — без клиентской подгрузки, поэтому CLS = 0.
 * Нет подходящей кампании → `null`: слот схлопывается в 0px, пустых плашек не остаётся
 * (кроме `solution.sponsored_product` с `showPitchWhenEmpty`, где рендерится карточка свободного слота).
 *
 * На SSG-страницах страна пользователя неизвестна: серверный гейт работает без гео-фильтра,
 * а кампании с ограниченным списком стран дополнительно проверяются на клиенте (AdImpression).
 */
export async function AdPlacement({
  placement,
  context,
  showPitchWhenEmpty = false,
  pitchOnly = false,
  className,
}: {
  placement: AdPlacementKind;
  context: AdTargetContext;
  showPitchWhenEmpty?: boolean;
  /** Рендерить только карточку свободного слота (когда кампании нет); активная кампания здесь не показывается. */
  pitchOnly?: boolean;
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
    return null;
  }
  if (pitchOnly) return null;

  return <AdCreative ad={ad} surface={context.surface} className={className} />;
}

