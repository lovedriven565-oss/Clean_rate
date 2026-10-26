import { AdBadge } from "@/components/ads/AdBadge";
import { AdCta } from "@/components/ads/AdCta";
import { BrandMark } from "@/components/ads/BrandMark";
import { adCtaMeta } from "@/lib/ads/presentation";
import type { EligibleAd } from "@/lib/types";

/**
 * `brand.profile_campaign` — карточка официальной акции, тест-драйва или обучения
 * внутри профиля бренда (`/brands/[slug]`).
 */
export function BrandProfileCampaignCard({ ad }: { ad: EligibleAd }) {
  const accent = ad.brandAccent ?? "hsl(var(--primary))";
  const cta = adCtaMeta(ad);

  return (
    <section
      aria-label={`Реклама: предложение бренда ${ad.brandName}`}
      className="data-surface linear-beam relative overflow-hidden rounded-panel p-6 sm:p-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-[0.14] blur-3xl"
        style={{ backgroundColor: accent }}
      />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <BrandMark name={ad.brandName} accent={ad.brandAccent} size="sm" />
            <AdBadge text={ad.badgeText} />
          </div>
          <h3 className="mt-4 font-display text-xl font-bold tracking-[-0.025em] text-foreground sm:text-2xl">
            {ad.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-[15px]">{ad.description}</p>
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          <AdCta ad={ad} />
          <span className="text-[11px] text-muted-foreground">{cta.hint}</span>
        </div>
      </div>
    </section>
  );
}
