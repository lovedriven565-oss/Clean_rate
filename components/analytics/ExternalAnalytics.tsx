import { ConsentGatedAnalytics } from "@/components/analytics/ConsentGatedAnalytics";

/**
 * Серверная обёртка: читает env на воркере (wrangler vars / .env) и передаёт
 * токены в клиентский островок. NEXT_PUBLIC_YM_ID — счётчик Яндекс Метрики,
 * NEXT_PUBLIC_CF_BEACON_TOKEN — Cloudflare Web Analytics.
 * Скрипты монтируются только после согласия пользователя (ch_consent = "all").
 */
export function ExternalAnalytics() {
  const ymId = process.env.NEXT_PUBLIC_YM_ID ? Number(process.env.NEXT_PUBLIC_YM_ID) : undefined;
  const cfToken = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN || undefined;
  if (!ymId && !cfToken) return null;
  return <ConsentGatedAnalytics ymId={ymId} cfToken={cfToken} />;
}
