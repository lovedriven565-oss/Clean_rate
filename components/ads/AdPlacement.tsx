import { AdCreative } from "@/components/ads/AdCreative";
import { getEligibleAd } from "@/lib/ads/queries";
import type { AdPlacement as AdPlacementKind, AdTargetContext } from "@/lib/types";

/**
 * Серверный рекламный слот. Запрашивает единственную одобренную кампанию через Eligibility Gate
 * и рендерит нативный шаблон прямо в HTML — без клиентской подгрузки, поэтому CLS = 0.
 * Нет подходящей кампании → `null`: слот схлопывается в 0px, пустых плашек не остаётся.
 *
 * На SSG-страницах страна пользователя неизвестна: серверный гейт работает без гео-фильтра,
 * а кампании с ограниченным списком стран дополнительно проверяются на клиенте (AdImpression).
 */
export async function AdPlacement({
  placement,
  context,
  className,
}: {
  placement: AdPlacementKind;
  context: AdTargetContext;
  className?: string;
}) {
  const ad = await getEligibleAd(placement, context);
  if (!ad) return null;

  return <AdCreative ad={ad} surface={context.surface} className={className} />;
}
