import { seedCampaigns } from "../../db/seed-data.js";

/**
 * Seed-кампании лежат в draft (без договора реклама на сайте не показывается).
 * Тесты рекламного движка временно переводят их в active, чтобы проверять гейт на реальных шаблонах.
 * Возвращает функцию восстановления исходных статусов.
 */
export function activateDemoCampaigns(): () => void {
  const original = seedCampaigns.map((campaign) => campaign.status);
  for (const campaign of seedCampaigns) campaign.status = "active";
  return () => {
    seedCampaigns.forEach((campaign, index) => {
      campaign.status = original[index];
    });
  };
}
