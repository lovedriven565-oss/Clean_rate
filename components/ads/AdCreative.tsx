import { AdImpression } from "@/components/ads/AdImpression";
import { BrandProfileCampaignCard } from "@/components/ads/templates/BrandProfileCampaignCard";
import { CategoryPartnerBanner } from "@/components/ads/templates/CategoryPartnerBanner";
import { DealerLocalPartnerCard } from "@/components/ads/templates/DealerLocalPartnerCard";
import { EditorialPartnerBlock } from "@/components/ads/templates/EditorialPartnerBlock";
import { ProductSponsoredSlotCard } from "@/components/ads/templates/ProductSponsoredSlotCard";
import { SearchSponsoredCard } from "@/components/ads/templates/SearchSponsoredCard";
import { SponsoredProductCard } from "@/components/ads/templates/SponsoredProductCard";
import type { EligibleAd } from "@/lib/types";

/**
 * Изоморфный рендерер уже одобренной сервером кампании: выбирает нативный шаблон по
 * placement и оборачивает его в viewability-трекинг. Безопасен для импорта из client-компонентов
 * (не тянет D1/drizzle) — серверную выборку делает `AdPlacement`.
 * Поддерживает все 7 плейсментов схемы Ad Engine.
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
    case "search.sponsored_result":
      creative = <SearchSponsoredCard ad={ad} />;
      break;
    case "products.sponsored_slot":
      creative = <ProductSponsoredSlotCard ad={ad} />;
      break;
    case "brand.profile_campaign":
      creative = <BrandProfileCampaignCard ad={ad} />;
      break;
    case "dealer.local_partner":
      creative = <DealerLocalPartnerCard ad={ad} />;
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
