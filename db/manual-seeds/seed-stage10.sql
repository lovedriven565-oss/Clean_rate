-- Этап 10 (ПРОЕКТ, НЕ ПРИМЕНЁН): устранение дрейфа каталога products prod-D1 ↔ seed-data.
-- Источник данных: db/seed-data.ts на main cbb4123; контекст дрейфа зафиксирован в CHANGELOG 2026-11-26.
-- Идемпотентно: INSERT OR IGNORE по primary key id. Не содержит DELETE и не трогает analytics/campaigns/leads.
-- Перед применением сверить d1_migrations и выполнуть read-only backup/export. Применять только после подтверждения владельца:
--   npx wrangler d1 execute cleaning-rating-db --remote --file=db/manual-seeds/seed-stage10.sql

-- Prochem Neutral Pro-Spotter (prod-prochem-spotter)
INSERT OR IGNORE INTO `products` (`id`, `brand_id`, `slug`, `name`, `category`, `description`, `image_key`, `external_url`, `ph`, `compatible_surfaces`, `prohibited_surfaces`, `compatible_materials`, `compatibility_verified`, `compatibility_source`, `status`, `created_at`, `updated_at`) VALUES (
  'prod-prochem-spotter', 'prochem', 'prochem-neutral-pro-spotter', 'Prochem Neutral Pro-Spotter', 'chemistry', 'Нейтральный универсальный пятновыводитель (pH 7.5) для кофе, чая, соков и большинства водных пятен; WoolSafe', NULL, NULL, 7.5, '["upholstery","carpet","mattress"]', '["silk"]', '["шенилл / рогожка","рогожка / жаккард / велюр","ковёр / ковролин / палас","велюр / рогожка / шенилл / микрофибра","ковёр / ковролин / подложка","ковёр / ковролин / ковровое покрытие"]', 1, 'Prochem TDS B109/E840: WoolSafe-approved neutral spotter для ковров и обивочных тканей', 'published', 1795734029227, 1795734029227
);

-- Prochem Ink Solv (prod-prochem-inksolv)
INSERT OR IGNORE INTO `products` (`id`, `brand_id`, `slug`, `name`, `category`, `description`, `image_key`, `external_url`, `ph`, `compatible_surfaces`, `prohibited_surfaces`, `compatible_materials`, `compatibility_verified`, `compatibility_source`, `status`, `created_at`, `updated_at`) VALUES (
  'prod-prochem-inksolv', 'prochem', 'prochem-ink-solv', 'Prochem Ink Solv', 'chemistry', 'Водная микроэмульсия (pH 7.5) для маркеров, чернил, лака и клея ПВА на коврах, тканях и твёрдых поверхностях', NULL, NULL, 7.5, '["upholstery","carpet","floor"]', '["silk","leather"]', NULL, NULL, NULL, 'published', 1795734029227, 1795734029227
);

-- Prochem Solvall Spotter (prod-prochem-solvall)
INSERT OR IGNORE INTO `products` (`id`, `brand_id`, `slug`, `name`, `category`, `description`, `image_key`, `external_url`, `ph`, `compatible_surfaces`, `prohibited_surfaces`, `compatible_materials`, `compatibility_verified`, `compatibility_source`, `status`, `created_at`, `updated_at`) VALUES (
  'prod-prochem-solvall', 'prochem', 'prochem-solvall-spotter', 'Prochem Solvall Spotter', 'chemistry', 'Летучий сольвент-пятновыводитель для жира, клея, смолы, гудрона и жвачки на коврах и тканях', NULL, NULL, NULL, '["upholstery","carpet","floor"]', '["natural_wood","silk","leather"]', NULL, NULL, NULL, 'published', 1795734029227, 1795734029227
);

-- Prochem Odour Fresh (prod-prochem-odourfresh)
INSERT OR IGNORE INTO `products` (`id`, `brand_id`, `slug`, `name`, `category`, `description`, `image_key`, `external_url`, `ph`, `compatible_surfaces`, `prohibited_surfaces`, `compatible_materials`, `compatibility_verified`, `compatibility_source`, `status`, `created_at`, `updated_at`) VALUES (
  'prod-prochem-odourfresh', 'prochem', 'prochem-odour-fresh', 'Prochem Odour Fresh', 'chemistry', 'Концентрированный дезодорант (pH 7.5) для ковров, обивки и твёрдых поверхностей — добавляется в любой чистящий раствор', NULL, NULL, 7.5, '["upholstery","carpet","mattress","floor"]', '["silk","leather"]', NULL, NULL, NULL, 'published', 1795734029227, 1795734029227
);

-- Prochem Fibre Shampoo (prod-prochem-fibreshampoo)
INSERT OR IGNORE INTO `products` (`id`, `brand_id`, `slug`, `name`, `category`, `description`, `image_key`, `external_url`, `ph`, `compatible_surfaces`, `prohibited_surfaces`, `compatible_materials`, `compatibility_verified`, `compatibility_source`, `status`, `created_at`, `updated_at`) VALUES (
  'prod-prochem-fibreshampoo', 'prochem', 'prochem-fibre-shampoo', 'Prochem Fibre Shampoo', 'chemistry', 'Пенный шампунь для ковров и обивки: концентрат pH 5.5, в рабочем растворе около pH 7 — деликатная чистка ворса', NULL, NULL, 7, '["upholstery","carpet","floor"]', '["leather","silk"]', NULL, NULL, NULL, 'published', 1795734029227, 1795734029227
);

-- Grass Dos-Gel (prod-grass-dosgel)
INSERT OR IGNORE INTO `products` (`id`, `brand_id`, `slug`, `name`, `category`, `description`, `image_key`, `external_url`, `ph`, `compatible_surfaces`, `prohibited_surfaces`, `compatible_materials`, `compatibility_verified`, `compatibility_source`, `status`, `created_at`, `updated_at`) VALUES (
  'prod-grass-dosgel', 'grass', 'grass-dos-gel', 'Grass Dos-Gel', 'chemistry', 'Гель с активным хлором (pH 11) для дезинфекции, отбеливания и удаления плесени в санузлах', NULL, NULL, 11, '["bathroom"]', '["marble","natural_wood","upholstery"]', NULL, NULL, NULL, 'published', 1795734029227, 1795734029227
);

-- Grass Gloss Gel (prod-grass-gloss)
INSERT OR IGNORE INTO `products` (`id`, `brand_id`, `slug`, `name`, `category`, `description`, `image_key`, `external_url`, `ph`, `compatible_surfaces`, `prohibited_surfaces`, `compatible_materials`, `compatibility_verified`, `compatibility_source`, `status`, `created_at`, `updated_at`) VALUES (
  'prod-grass-gloss', 'grass', 'grass-gloss-gel', 'Grass Gloss Gel', 'chemistry', 'Кислотный гель на лимонной кислоте (pH 2–3) от известкового налёта и ржавчины для ванн, душа и фаянса', NULL, NULL, 3, '["bathroom","floor"]', '["marble","limestone","enamel"]', NULL, NULL, NULL, 'published', 1795734029227, 1795734029227
);

-- Grass Antigraffiti (prod-grass-antigraffiti)
INSERT OR IGNORE INTO `products` (`id`, `brand_id`, `slug`, `name`, `category`, `description`, `image_key`, `external_url`, `ph`, `compatible_surfaces`, `prohibited_surfaces`, `compatible_materials`, `compatibility_verified`, `compatibility_source`, `status`, `created_at`, `updated_at`) VALUES (
  'prod-grass-antigraffiti', 'grass', 'grass-antigraffiti', 'Grass Antigraffiti', 'chemistry', 'Готовый сольвент (органические растворители) для скотча, клея, маркера, жвачки и граффити на твёрдых поверхностях', NULL, NULL, NULL, '["floor","window","bathroom"]', '["natural_wood","silk","leather"]', NULL, NULL, NULL, 'published', 1795734029227, 1795734029227
);

-- Kiehl Torvan Concentrate (prod-kiehl-torvan)
INSERT OR IGNORE INTO `products` (`id`, `brand_id`, `slug`, `name`, `category`, `description`, `image_key`, `external_url`, `ph`, `compatible_surfaces`, `prohibited_surfaces`, `compatible_materials`, `compatibility_verified`, `compatibility_source`, `status`, `created_at`, `updated_at`) VALUES (
  'prod-kiehl-torvan', 'kiehl', 'kiehl-torvan-concentrate', 'Kiehl Torvan Concentrate', 'chemistry', 'Нейтральный клинер для регулярной уборки (концентрат pH 9.5, в растворе ~pH 7.5) — без разводов и липкого слоя', NULL, NULL, 9.5, '["floor","window","kitchen","bathroom"]', NULL, NULL, NULL, NULL, 'published', 1795734029227, 1795734029227
);

-- Kiehl Omni-fresh (prod-kiehl-omnifresh)
INSERT OR IGNORE INTO `products` (`id`, `brand_id`, `slug`, `name`, `category`, `description`, `image_key`, `external_url`, `ph`, `compatible_surfaces`, `prohibited_surfaces`, `compatible_materials`, `compatibility_verified`, `compatibility_source`, `status`, `created_at`, `updated_at`) VALUES (
  'prod-kiehl-omnifresh', 'kiehl', 'kiehl-omni-fresh', 'Kiehl Omni-fresh', 'chemistry', 'Микробиологический нейтрализатор запахов (pH 9) для текстиля, обивки, полов и сточных точек — без CLP-маркировки', NULL, NULL, 9, '["upholstery","carpet","floor","bathroom"]', '["silk"]', NULL, NULL, NULL, 'published', 1795734029227, 1795734029227
);

-- Kiehl Grasset-plus (prod-kiehl-grassetplus)
INSERT OR IGNORE INTO `products` (`id`, `brand_id`, `slug`, `name`, `category`, `description`, `image_key`, `external_url`, `ph`, `compatible_surfaces`, `prohibited_surfaces`, `compatible_materials`, `compatibility_verified`, `compatibility_source`, `status`, `created_at`, `updated_at`) VALUES (
  'prod-kiehl-grassetplus', 'kiehl', 'kiehl-grasset-plus', 'Kiehl Grasset-plus', 'chemistry', 'Щелочной обезжириватель (pH 11) растительных и животных жиров для кухонь и пищевых зон', NULL, NULL, 11, '["kitchen"]', '["upholstery","natural_wood","aluminum"]', NULL, NULL, NULL, 'published', 1795734029227, 1795734029227
);

-- Kiehl Carp-Acryl (prod-kiehl-carpacryl)
INSERT OR IGNORE INTO `products` (`id`, `brand_id`, `slug`, `name`, `category`, `description`, `image_key`, `external_url`, `ph`, `compatible_surfaces`, `prohibited_surfaces`, `compatible_materials`, `compatibility_verified`, `compatibility_source`, `status`, `created_at`, `updated_at`) VALUES (
  'prod-kiehl-carpacryl', 'kiehl', 'kiehl-carp-acryl', 'Kiehl Carp-Acryl', 'chemistry', 'Ковровый шампунь (pH 8) с защитой ворса и антизагрязняющим эффектом — пена собирает грязь и убирается пылесосом', NULL, NULL, 8, '["carpet","floor"]', '["upholstery","leather","silk"]', NULL, NULL, NULL, 'published', 1795734029227, 1795734029227
);

-- Ecolab Bio-Enzymatic Odor Eliminator (prod-ecolab-odor)
INSERT OR IGNORE INTO `products` (`id`, `brand_id`, `slug`, `name`, `category`, `description`, `image_key`, `external_url`, `ph`, `compatible_surfaces`, `prohibited_surfaces`, `compatible_materials`, `compatibility_verified`, `compatibility_source`, `status`, `created_at`, `updated_at`) VALUES (
  'prod-ecolab-odor', 'ecolab', 'ecolab-bio-enzymatic-odor', 'Ecolab Bio-Enzymatic Odor Eliminator', 'chemistry', 'Био-энзимный нейтрализатор запахов (моча, животные, мусор) для твёрдых и мягких поверхностей', NULL, NULL, NULL, '["mattress","carpet","upholstery","floor"]', '["leather","silk"]', NULL, NULL, NULL, 'published', 1795734029227, 1795734029227
);

-- Контроль после применения: должно вернуть 21 строку полного seed-каталога.
SELECT COUNT(*) AS seed_catalog_products_present FROM `products` WHERE `id` IN ('prod-prochem-stainpro', 'prod-prochem-spotter', 'prod-prochem-inksolv', 'prod-prochem-solvall', 'prod-prochem-odourfresh', 'prod-prochem-fibreshampoo', 'prod-prochem-urine', 'prod-grass-cement', 'prod-grass-azelit', 'prod-grass-dosgel', 'prod-grass-gloss', 'prod-grass-antigraffiti', 'prod-karcher-puzzi', 'prod-kiehl-powerfix', 'prod-kiehl-sanikal', 'prod-kiehl-tablefit', 'prod-kiehl-torvan', 'prod-kiehl-omnifresh', 'prod-kiehl-grassetplus', 'prod-kiehl-carpacryl', 'prod-ecolab-odor');
