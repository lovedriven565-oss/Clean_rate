"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { CONSENT_EVENT, readConsent, type ConsentValue } from "@/lib/consent";

/**
 * Клиентский островок внешней аналитики — только после согласия
 * (cookie ch_consent = "all", см. ConsentBanner). Без токенов ничего не
 * рендерится. defer:true → автопросмотр выключен, хиты отправляет
 * PageViewTracker. webvisor включён, т.к. скрипт грузится только при явном
 * согласии на аналитику.
 */
export function ConsentGatedAnalytics({ ymId, cfToken }: { ymId?: number; cfToken?: string }) {
  const [consent, setConsent] = useState<ConsentValue | null>(null);

  useEffect(() => {
    queueMicrotask(() => setConsent(readConsent()));
    const onConsent = (event: Event) => setConsent((event as CustomEvent<ConsentValue>).detail ?? readConsent());
    window.addEventListener(CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(CONSENT_EVENT, onConsent);
  }, []);

  if (consent !== "all") return null;

  return (
    <>
      {ymId ? (
        <Script
          id="yandex-metrika"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=${ymId}','ym');ym(${ymId},'init',{defer:true,clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});`,
          }}
        />
      ) : null}
      {cfToken ? (
        <Script
          id="cf-web-analytics"
          strategy="afterInteractive"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon={JSON.stringify({ token: cfToken, spa: true })}
        />
      ) : null}
    </>
  );
}
