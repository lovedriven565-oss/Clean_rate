import Link from "next/link";
import { MapPin } from "lucide-react";
import { AdBadge } from "@/components/ads/AdBadge";
import { AdCta } from "@/components/ads/AdCta";
import { BrandMark } from "@/components/ads/BrandMark";
import type { EligibleAd } from "@/lib/types";

/**
 * `dealer.local_partner` — блок авторизованного дилера / поставщика в регионе.
 * Компактная строка с прямой ссылкой на наличие или запрос оптового прайса.
 */
export function DealerLocalPartnerCard({ ad }: { ad: EligibleAd }) {
  return (
    <aside
      aria-label={`Реклама: официальный дилер ${ad.brandName}`}
      className="data-surface relative overflow-hidden rounded-panel p-5 sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <BrandMark name={ad.brandName} accent={ad.brandAccent} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <AdBadge text={ad.badgeText} />
              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden />
                Поставка и сервис в регионе
              </span>
            </div>
            <h3 className="mt-2 font-display text-base font-bold text-foreground sm:text-lg">{ad.title}</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{ad.description}</p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <AdCta ad={ad} variant="secondary" />
          <Link href={`/brands/${ad.brandSlug}`} className="text-xs font-semibold text-link hover:underline">
            О бренде
          </Link>
        </div>
      </div>
    </aside>
  );
}
