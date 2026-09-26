import { AdImpression } from "@/components/ads/AdImpression";
import { CategoryPartnerBanner } from "@/components/ads/templates/CategoryPartnerBanner";
import { EditorialPartnerBlock } from "@/components/ads/templates/EditorialPartnerBlock";
import { SponsoredProductCard } from "@/components/ads/templates/SponsoredProductCard";
import type { EligibleAd } from "@/lib/types";

/**
 * Изоморфный рендерер уже одобренной сервером кампании: выбирает нативный шаблон по
 * placement и оборачивает его в viewability-трекинг. Безопасен для импорта из client-компонентов
 * (не тянет D1/drizzle) — серверную выборку делает `AdPlacement`.
 * Для плейсментов без шаблона возвращает null — никаких пустых рамок.
 */
export function AdCreative({ ad, surface, className }: { ad: EligibleAd; surface?: string; className?: string }) {
  let creative: React.ReactNode = null;

  switch (ad.placement) {
    case "solution.sponsored_product":
      creative = <SponsoredProductCard ad={ad} surface={surface} />;
      break;
    case "rating.category_partner":
      creative = <CategoryPartnerBanner ad={ad} />;
      break;
    case "home.editorial_partner":
      creative = <EditorialPartnerBlock ad={ad} />;
      break;
    default:
      return null;
  }

  return (
    <AdImpression key={ad.campaignId} ad={ad} className={className}>
      {creative}
    </AdImpression>
  );
}
