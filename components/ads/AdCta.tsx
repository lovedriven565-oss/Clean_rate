"use client";

import { motion } from "motion/react";
import { ArrowUpRight, FileText, GraduationCap, Presentation, Store } from "lucide-react";
import { useRegion } from "@/components/providers/RegionProvider";
import { trackEvent } from "@/lib/analytics";
import { adCtaMeta, adTrackingEntity, type AdCtaIcon } from "@/lib/ads/presentation";
import type { EligibleAd } from "@/lib/types";
import { cn } from "@/lib/utils";

const icons: Record<AdCtaIcon, typeof Store> = {
  store: Store,
  quote: FileText,
  training: GraduationCap,
  demo: Presentation,
  external: ArrowUpRight,
};

/**
 * Коммерческое действие кампании: «Где купить у дилера», «Запросить оптовый прайс»,
 * «Записаться на обучение», «Запросить демо». Ссылка помечена rel="sponsored",
 * тап-зона ≥ 44px, клик уходит в /api/analytics/click с атрибуцией кампании.
 */
export function AdCta({
  ad,
  variant = "primary",
  size = "md",
  className,
}: {
  ad: EligibleAd;
  variant?: "primary" | "secondary" | "onDark";
  size?: "md" | "lg";
  className?: string;
}) {
  const { countryCode } = useRegion();
  const meta = adCtaMeta(ad);
  const Icon = icons[meta.icon];

  const handleClick = () =>
    trackEvent({
      ...adTrackingEntity(ad),
      eventType: "website",
      campaignId: ad.campaignId,
      countryCode,
      metadata: { placement: ad.placement, ctaType: ad.ctaType, brandId: ad.brandId },
    });

  return (
    <motion.a
      href={ad.ctaUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={handleClick}
      aria-label={`${meta.label} — ${ad.brandName} (реклама, откроется в новой вкладке)`}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-[background-color,border-color,color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        size === "lg" ? "h-12 px-6 text-[15px]" : "h-11 px-5 text-sm",
        variant === "primary" &&
          "bg-foreground text-background shadow-[0_10px_30px_-12px_hsl(var(--shadow-tint)/0.6)] hover:shadow-[0_14px_34px_-12px_hsl(var(--shadow-tint)/0.7)]",
        variant === "secondary" &&
          "border border-border bg-card text-foreground hover:border-foreground/30 hover:bg-muted/60",
        variant === "onDark" && "bg-background text-foreground hover:bg-background/90",
        className
      )}
    >
      <Icon className="h-4 w-4 shrink-0 opacity-80 transition-opacity group-hover:opacity-100" />
      {meta.label}
    </motion.a>
  );
}
