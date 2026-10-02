import Script from "next/script";
import { YM_ID } from "@/lib/analytics";
import { DevDesignAnalyticsGate } from "./DevDesignAnalyticsGate";

const CF_BEACON_TOKEN = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;

/**
 * Внешняя аналитика. Без env-переменных ничего не рендерится:
 * NEXT_PUBLIC_YM_ID — счётчик Яндекс Метрики, NEXT_PUBLIC_CF_BEACON_TOKEN — Cloudflare Web Analytics.
 * defer:true → автопросмотр выключен, хиты отправляет PageViewTracker.
 */
export function ExternalAnalytics() {
  const scripts = (
    <>
      {YM_ID ? (
        <Script
          id="yandex-metrika"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=${YM_ID}','ym');ym(${YM_ID},'init',{defer:true,clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});`,
          }}
        />
      ) : null}
      {CF_BEACON_TOKEN ? (
        <Script
          id="cf-web-analytics"
          strategy="afterInteractive"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon={JSON.stringify({ token: CF_BEACON_TOKEN, spa: true })}
        />
      ) : null}
    </>
  );
  // Production — прежнее поведение (Script напрямую). Вне production
  // счётчики не монтируются на /dev/design/* (дизайн-прототипы без аналитики).
  if (process.env.NODE_ENV === "production") return scripts;
  return <DevDesignAnalyticsGate>{scripts}</DevDesignAnalyticsGate>;
}
