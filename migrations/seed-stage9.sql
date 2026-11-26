-- Этап 9: подтверждённая совместимость товаров для слота solution.sponsored_product.
-- Источник: официальные техкарты Prochem Europe (pssb144.pdf — Stain Pro; WoolSafe — Neutral Pro-Spotter).
-- Зависит от миграции 0011 (колонки compatible_materials / compatibility_verified / compatibility_source).
-- Применение: npx wrangler d1 execute cleaning-rating-db --remote --file=migrations/seed-stage9.sql
-- Идемпотентно: UPDATE по id.

-- Prochem Stain Pro (B144): водно-сольвентный щелочной пятновыводитель для ковров и тканей,
-- incl. wool с обязательным pre-test и кислотным ополаскиванием (TDS 13/10/2025).
UPDATE `products` SET
  `compatible_materials` = '["шенилл / рогожка", "рогожка / жаккард / велюр", "ковёр / ковролин / палас", "трикотажный хлопковый чехол"]',
  `compatibility_verified` = 1,
  `compatibility_source` = 'Prochem TDS B144 (pssb144.pdf): water/solvent alkaline spotter для ковров и тканей, incl. wool с pre-test',
  `updated_at` = 1795604131197
WHERE `id` = 'prod-prochem-stainpro';

-- Prochem Neutral Pro-Spotter: нейтральный pH 7.5, WoolSafe-approved, универсальный для ковров и обивки.
UPDATE `products` SET
  `compatible_materials` = '["шенилл / рогожка", "рогожка / жаккард / велюр", "ковёр / ковролин / палас", "велюр / рогожка / шенилл / микрофибра", "ковёр / ковролин / подложка", "ковёр / ковролин / ковровое покрытие"]',
  `compatibility_verified` = 1,
  `compatibility_source` = 'Prochem TDS B109/E840: WoolSafe-approved neutral spotter для ковров и обивочных тканей',
  `updated_at` = 1795604131197
WHERE `id` = 'prod-prochem-spotter';
