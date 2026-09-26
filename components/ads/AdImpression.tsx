"use client";

import { useEffect, useRef } from "react";
import { useRegion } from "@/components/providers/RegionProvider";
import { trackEvent } from "@/lib/analytics";
import { adTrackingEntity, isAdVisibleInCountry } from "@/lib/ads/presentation";
import type { EligibleAd } from "@/lib/types";

/** IAB-порог viewability: ≥ 50% площади в viewport непрерывно ≥ 1 секунды. */
const VIEWABILITY_RATIO = 0.5;
const VIEWABILITY_DWELL_MS = 1000;

/**
 * Обёртка креатива: один impression на кампанию и только при фактической видимости.
 * Без cookies, fingerprint и персонального профилирования — в событие уходят id кампании,
 * сущности, путь и код страны из региона пользователя.
 *
 * Также выполняет клиентский гео-гейт для SSG-страниц (страна известна только из cookie).
 * `data-nosnippet` не даёт поисковикам брать текст рекламы в сниппет страницы.
 */
export function AdImpression({
  ad,
  children,
  className,
}: {
  ad: EligibleAd;
  children: React.ReactNode;
  className?: string;
}) {
  const { countryCode } = useRegion();
  const ref = useRef<HTMLDivElement>(null);
  const fired = useRef(false);
  const countryRef = useRef(countryCode);

  const visible = isAdVisibleInCountry(ad, countryCode);

  useEffect(() => {
    countryRef.current = countryCode;
  }, [countryCode]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !visible || fired.current || typeof IntersectionObserver === "undefined") return;

    let timer: number | undefined;

    const cancel = () => {
      if (timer !== undefined) {
        window.clearTimeout(timer);
        timer = undefined;
      }
    };

    const fire = () => {
      if (fired.current) return;
      fired.current = true;
      observer.disconnect();
      trackEvent({
        ...adTrackingEntity(ad),
        eventType: "impression",
        campaignId: ad.campaignId,
        countryCode: countryRef.current,
        metadata: { placement: ad.placement, brandId: ad.brandId },
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting && entry.intersectionRatio >= VIEWABILITY_RATIO;
        if (inView && document.visibilityState === "visible") {
          if (timer === undefined) timer = window.setTimeout(fire, VIEWABILITY_DWELL_MS);
        } else {
          cancel();
        }
      },
      { threshold: [0, VIEWABILITY_RATIO, 1] }
    );

    const onVisibility = () => {
      if (document.visibilityState !== "visible") cancel();
    };

    observer.observe(el);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancel();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ad, visible]);

  if (!visible) return null;

  return (
    <div
      ref={ref}
      data-nosnippet
      data-ad-placement={ad.placement}
      data-ad-campaign={ad.campaignId}
      className={className}
    >
      {children}
    </div>
  );
}
