CREATE TABLE `analytics_events` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_id` text,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`event_type` text NOT NULL,
	`path` text,
	`occurred_at` integer NOT NULL,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `analytics_events_campaign_time_idx` ON `analytics_events` (`campaign_id`,`occurred_at`);--> statement-breakpoint
CREATE INDEX `analytics_events_entity_time_idx` ON `analytics_events` (`entity_type`,`entity_id`,`occurred_at`);--> statement-breakpoint
CREATE TABLE `brands` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`tagline` text,
	`description` text NOT NULL,
	`focus` text NOT NULL,
	`website_url` text,
	`accent` text,
	`verified` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `brands_slug_unique` ON `brands` (`slug`);--> statement-breakpoint
CREATE INDEX `brands_focus_idx` ON `brands` (`focus`);--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` text PRIMARY KEY NOT NULL,
	`brand_id` text NOT NULL,
	`name` text NOT NULL,
	`placement` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`starts_at` integer,
	`ends_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `campaigns_brand_status_idx` ON `campaigns` (`brand_id`,`status`);--> statement-breakpoint
CREATE TABLE `cleaning_companies` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`legal_name` text,
	`country_code` text DEFAULT 'BY' NOT NULL,
	`region` text,
	`city` text NOT NULL,
	`address` text,
	`description` text NOT NULL,
	`website_url` text,
	`phone` text,
	`email` text,
	`price_from` real,
	`price_unit` text,
	`experience_years` integer,
	`verified` integer DEFAULT false NOT NULL,
	`promoted` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cleaning_companies_slug_unique` ON `cleaning_companies` (`slug`);--> statement-breakpoint
CREATE INDEX `cleaning_companies_location_idx` ON `cleaning_companies` (`country_code`,`city`);--> statement-breakpoint
CREATE INDEX `cleaning_companies_status_idx` ON `cleaning_companies` (`status`);--> statement-breakpoint
CREATE TABLE `company_brands` (
	`company_id` text NOT NULL,
	`brand_id` text NOT NULL,
	`evidence_url` text,
	`evidence_status` text DEFAULT 'pending' NOT NULL,
	`verified_at` integer,
	PRIMARY KEY(`company_id`, `brand_id`),
	FOREIGN KEY (`company_id`) REFERENCES `cleaning_companies`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `company_brands_status_idx` ON `company_brands` (`evidence_status`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`brand_id` text NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`description` text,
	`image_key` text,
	`external_url` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_unique` ON `products` (`slug`);--> statement-breakpoint
CREATE INDEX `products_brand_idx` ON `products` (`brand_id`);--> statement-breakpoint
CREATE TABLE `profile_claims` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`contact_name` text NOT NULL,
	`contact` text NOT NULL,
	`evidence` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	`reviewed_at` integer
);
--> statement-breakpoint
CREATE INDEX `profile_claims_entity_idx` ON `profile_claims` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `profile_claims_status_idx` ON `profile_claims` (`status`);--> statement-breakpoint
CREATE TABLE `rating_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text NOT NULL,
	`source` text NOT NULL,
	`source_url` text NOT NULL,
	`rating` real NOT NULL,
	`review_count` integer NOT NULL,
	`captured_at` integer NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `cleaning_companies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rating_sources_company_source_unique` ON `rating_sources` (`company_id`,`source`);--> statement-breakpoint
CREATE INDEX `rating_sources_captured_idx` ON `rating_sources` (`captured_at`);--> statement-breakpoint
CREATE TABLE `supplier_brands` (
	`supplier_id` text NOT NULL,
	`brand_id` text NOT NULL,
	`relationship` text DEFAULT 'listed' NOT NULL,
	`evidence_url` text,
	`verified_at` integer,
	PRIMARY KEY(`supplier_id`, `brand_id`),
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`country_code` text DEFAULT 'BY' NOT NULL,
	`region` text,
	`city` text,
	`description` text,
	`website_url` text,
	`phone` text,
	`email` text,
	`verified` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `suppliers_slug_unique` ON `suppliers` (`slug`);--> statement-breakpoint
CREATE INDEX `suppliers_location_idx` ON `suppliers` (`country_code`,`city`);CREATE TABLE `company_categories` (
	`company_id` text NOT NULL,
	`category_id` text NOT NULL,
	PRIMARY KEY(`company_id`, `category_id`),
	FOREIGN KEY (`company_id`) REFERENCES `cleaning_companies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `company_categories_category_idx` ON `company_categories` (`category_id`);--> statement-breakpoint
ALTER TABLE `brands` ADD `affiliate_url` text;--> statement-breakpoint
ALTER TABLE `brands` ADD `is_sponsor` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `cleaning_companies` ADD `telegram_url` text;--> statement-breakpoint
ALTER TABLE `cleaning_companies` ADD `cover_image` text;--> statement-breakpoint
ALTER TABLE `cleaning_companies` ADD `tags` text;--> statement-breakpoint
ALTER TABLE `cleaning_companies` ADD `guarantees` text;CREATE TABLE `intent_keywords` (
	`id` text PRIMARY KEY NOT NULL,
	`keyword` text NOT NULL,
	`intent` text NOT NULL,
	`weight` integer DEFAULT 1 NOT NULL,
	`target_kind` text NOT NULL,
	`target_slug` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `intent_keywords_keyword_unique` ON `intent_keywords` (`keyword`);--> statement-breakpoint
CREATE INDEX `intent_keywords_intent_idx` ON `intent_keywords` (`intent`);--> statement-breakpoint
CREATE INDEX `intent_keywords_target_idx` ON `intent_keywords` (`target_kind`,`target_slug`);--> statement-breakpoint
CREATE TABLE `price_estimates` (
	`id` text PRIMARY KEY NOT NULL,
	`solution_id` text,
	`category_id` text,
	`country_code` text DEFAULT 'BY' NOT NULL,
	`city` text,
	`currency` text DEFAULT 'BYN' NOT NULL,
	`price_min` real NOT NULL,
	`price_max` real NOT NULL,
	`unit` text,
	`note` text,
	FOREIGN KEY (`solution_id`) REFERENCES `solutions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `price_estimates_solution_idx` ON `price_estimates` (`solution_id`);--> statement-breakpoint
CREATE INDEX `price_estimates_category_idx` ON `price_estimates` (`category_id`);--> statement-breakpoint
CREATE INDEX `price_estimates_location_idx` ON `price_estimates` (`country_code`,`city`);--> statement-breakpoint
CREATE TABLE `solution_products` (
	`id` text PRIMARY KEY NOT NULL,
	`solution_id` text NOT NULL,
	`brand_id` text,
	`product_id` text,
	`role` text DEFAULT 'recommended' NOT NULL,
	`note` text,
	FOREIGN KEY (`solution_id`) REFERENCES `solutions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `solution_products_solution_idx` ON `solution_products` (`solution_id`);--> statement-breakpoint
CREATE INDEX `solution_products_brand_idx` ON `solution_products` (`brand_id`);--> statement-breakpoint
CREATE TABLE `solutions` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`problem_type` text NOT NULL,
	`surface` text NOT NULL,
	`material` text,
	`severity` text DEFAULT 'fresh' NOT NULL,
	`audience` text DEFAULT 'both' NOT NULL,
	`diy_steps` text,
	`warnings` text,
	`when_to_call_pro` text NOT NULL,
	`diy_cost_note` text,
	`pro_time_note` text,
	`search_keywords` text,
	`related_category` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `solutions_slug_unique` ON `solutions` (`slug`);--> statement-breakpoint
CREATE INDEX `solutions_problem_type_idx` ON `solutions` (`problem_type`);--> statement-breakpoint
CREATE INDEX `solutions_surface_idx` ON `solutions` (`surface`);--> statement-breakpoint
CREATE INDEX `solutions_status_idx` ON `solutions` (`status`);CREATE TABLE `brand_leads` (
	`id` text PRIMARY KEY NOT NULL,
	`brand_name` text NOT NULL,
	`website` text,
	`contact_name` text NOT NULL,
	`contact` text NOT NULL,
	`role` text NOT NULL,
	`goal` text,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `brand_leads_status_idx` ON `brand_leads` (`status`);--> statement-breakpoint
CREATE INDEX `brand_leads_created_idx` ON `brand_leads` (`created_at`);--> statement-breakpoint
CREATE TABLE `partner_leads` (
	`id` text PRIMARY KEY NOT NULL,
	`company_name` text NOT NULL,
	`contact_name` text,
	`phone` text NOT NULL,
	`city` text,
	`category_ids` text,
	`message` text,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `partner_leads_status_idx` ON `partner_leads` (`status`);--> statement-breakpoint
CREATE INDEX `partner_leads_created_idx` ON `partner_leads` (`created_at`);--> statement-breakpoint
ALTER TABLE `analytics_events` ADD `country_code` text;--> statement-breakpoint
ALTER TABLE `analytics_events` ADD `metadata` text;ALTER TABLE `campaigns` ADD `product_id` text REFERENCES products(id);--> statement-breakpoint
ALTER TABLE `campaigns` ADD `target_countries` text;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `target_categories` text;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `target_surfaces` text;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `target_solutions` text;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `max_impressions` integer;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `max_clicks` integer;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `current_impressions` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `current_clicks` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `title` text;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `description` text;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `cta_text` text;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `cta_url` text;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `cta_type` text;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `badge_text` text;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `priority` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `campaigns` ADD `updated_at` integer;--> statement-breakpoint
CREATE INDEX `campaigns_placement_status_idx` ON `campaigns` (`placement`,`status`);--> statement-breakpoint
ALTER TABLE `products` ADD `ph` real;--> statement-breakpoint
ALTER TABLE `products` ADD `compatible_surfaces` text;--> statement-breakpoint
ALTER TABLE `products` ADD `prohibited_surfaces` text;DELETE FROM `analytics_events`;
DELETE FROM `campaigns`;
DELETE FROM `profile_claims`;
DELETE FROM `rating_sources`;
DELETE FROM `company_brands`;
DELETE FROM `company_categories`;
DELETE FROM `cleaning_companies`;
DELETE FROM `solution_products`;
DELETE FROM `price_estimates`;
DELETE FROM `intent_keywords`;
DELETE FROM `solutions`;
DELETE FROM `products`;
DELETE FROM `supplier_brands`;
DELETE FROM `suppliers`;
DELETE FROM `brands`;
INSERT INTO `brands` (`id`, `slug`, `name`, `tagline`, `description`, `focus`, `website_url`, `affiliate_url`, `accent`, `is_sponsor`, `verified`, `status`, `created_at`, `updated_at`) VALUES ('karcher', 'karcher', 'Kärcher', 'Профессиональная техника для клининга', 'Мировой лидер в производстве клининговой техники: экстракторы, парогенераторы, поломоечные машины. Официальный сервис и склад запчастей в Минске.', 'technika', 'https://www.karcher.by/', 'https://www.karcher.by/', '#FFC800', 0, 0, 'published', 1790413760763, 1790413760763);
INSERT INTO `brands` (`id`, `slug`, `name`, `tagline`, `description`, `focus`, `website_url`, `affiliate_url`, `accent`, `is_sponsor`, `verified`, `status`, `created_at`, `updated_at`) VALUES ('dyson', 'dyson', 'Dyson', 'Технологии чистого воздуха', 'Беспроводные пылесосы и очистители воздуха премиум-класса — выбор клининговых компаний для деликатной уборки в дорогих интерьерах.', 'technika', 'https://www.dyson.com/', 'https://www.21vek.by/dyson/', '#6B4EFF', 0, 0, 'published', 1790413760763, 1790413760763);
INSERT INTO `brands` (`id`, `slug`, `name`, `tagline`, `description`, `focus`, `website_url`, `affiliate_url`, `accent`, `is_sponsor`, `verified`, `status`, `created_at`, `updated_at`) VALUES ('bosch', 'bosch', 'Bosch', 'Надёжная техника для бизнеса', 'Промышленные пылесосы и электроинструмент Bosch Professional для клининга офисов и коммерческих помещений.', 'technika', 'https://www.bosch-professional.com/by/ru/', 'https://www.bosch-professional.com/by/ru/', '#EA0016', 0, 0, 'published', 1790413760763, 1790413760763);
INSERT INTO `brands` (`id`, `slug`, `name`, `tagline`, `description`, `focus`, `website_url`, `affiliate_url`, `accent`, `is_sponsor`, `verified`, `status`, `created_at`, `updated_at`) VALUES ('ecolab', 'ecolab', 'Ecolab', 'Экологичная химия для клининга', 'Гипоаллергенная профессиональная химия для дезинфекции и уборки — используется ведущими клининговыми компаниями Беларуси.', 'himiya', 'https://www.ecolab.com/', 'https://www.ecolab.com/', '#0074B7', 0, 0, 'published', 1790413760763, 1790413760763);
INSERT INTO `brands` (`id`, `slug`, `name`, `tagline`, `description`, `focus`, `website_url`, `affiliate_url`, `accent`, `is_sponsor`, `verified`, `status`, `created_at`, `updated_at`) VALUES ('grass', 'grass', 'Grass', 'Химия для сложных загрязнений', 'Средства от жира, пятен и монтажной пены. Оптовые поставки для клининговых компаний с доставкой по РБ.', 'himiya', 'https://grass.by/', 'https://grass.by/', '#16A34A', 0, 0, 'published', 1790413760763, 1790413760763);
INSERT INTO `brands` (`id`, `slug`, `name`, `tagline`, `description`, `focus`, `website_url`, `affiliate_url`, `accent`, `is_sponsor`, `verified`, `status`, `created_at`, `updated_at`) VALUES ('vileda-pro', 'vileda-professional', 'Vileda Professional', 'Инвентарь для профессиональной уборки', 'Швабры, ведра с отжимом, микрофибра и системы уборки для клининговых бригад любого масштаба.', 'inventory', 'https://www.vileda-professional.com/', 'https://www.vileda-professional.com/', '#F97316', 0, 0, 'published', 1790413760763, 1790413760763);
INSERT INTO `brands` (`id`, `slug`, `name`, `tagline`, `description`, `focus`, `website_url`, `affiliate_url`, `accent`, `is_sponsor`, `verified`, `status`, `created_at`, `updated_at`) VALUES ('dreame', 'dreame', 'Dreame', 'Роботы-пылесосы нового поколения', 'Роботы-пылесосы с влажной уборкой для дома — рекомендация клинеров для поддержания чистоты между генеральными уборками.', 'technika', 'https://www.dreame.com/', 'https://www.onliner.by/catalog/dreame', '#0EA5E9', 0, 0, 'published', 1790413760763, 1790413760763);
INSERT INTO `brands` (`id`, `slug`, `name`, `tagline`, `description`, `focus`, `website_url`, `affiliate_url`, `accent`, `is_sponsor`, `verified`, `status`, `created_at`, `updated_at`) VALUES ('kiehl', 'kiehl', 'Kiehl', 'Немецкая профессиональная химия для клининга', 'Концентрированные средства для удаления застарелых пятен, затирок, полимерных покрытий и генеральной уборки.', 'himiya', 'https://www.kiehl-group.com/', 'https://www.kiehl-group.com/', '#0284C7', 0, 0, 'published', 1790413760763, 1790413760763);
INSERT INTO `brands` (`id`, `slug`, `name`, `tagline`, `description`, `focus`, `website_url`, `affiliate_url`, `accent`, `is_sponsor`, `verified`, `status`, `created_at`, `updated_at`) VALUES ('prochem', 'prochem', 'Prochem', 'Мировой эталон химии для химчистки мягкой мебели', 'Профессиональные пятновыводители, нейтрализаторы запахов и экстракционные шампуни для клинеров и химчисток.', 'himiya', 'https://www.prochem.co.uk/', 'https://www.prochem.co.uk/', '#D97706', 0, 0, 'published', 1790413760763, 1790413760763);
INSERT INTO `cleaning_companies` (`id`, `slug`, `name`, `legal_name`, `country_code`, `region`, `city`, `address`, `description`, `website_url`, `phone`, `email`, `telegram_url`, `price_from`, `price_unit`, `experience_years`, `cover_image`, `tags`, `guarantees`, `verified`, `promoted`, `status`, `created_at`, `updated_at`) VALUES ('spectrclean', 'spectrclean', 'Спектр Клининг', NULL, 'BY', 'Минская', 'Минск', NULL, 'Профессиональный клининг для бизнеса и дома в Минске: регулярная уборка по договору, генеральная и послестроительная уборка. Специализация — пищевые производства, серверные, склады.', 'https://spectrclean.by', '+375 29 186-98-88', 'info@spectrclean.by', 'https://t.me/Spectr_Cleaning_Bot', 6, 'м²', 7, NULL, '["Работает по договору","7+ лет на рынке","350+ клиентов"]', '["Фиксированная цена по договору"]', 1, 1, 'published', 1790413760763, 1790413760763);
INSERT INTO `cleaning_companies` (`id`, `slug`, `name`, `legal_name`, `country_code`, `region`, `city`, `address`, `description`, `website_url`, `phone`, `email`, `telegram_url`, `price_from`, `price_unit`, `experience_years`, `cover_image`, `tags`, `guarantees`, `verified`, `promoted`, `status`, `created_at`, `updated_at`) VALUES ('freshclean', 'freshclean', 'FreshClean', NULL, 'BY', 'Минская', 'Минск', NULL, 'Уборка квартир, домов, офисов и коммерческой недвижимости по всей Беларуси. Итоговая стоимость рассчитывается индивидуально в зависимости от площади и степени загрязнения.', 'https://freshclean.by', '+375 25 525-76-10', 'info@freshclean.by', NULL, 3, 'м²', 5, NULL, '["Работает по всей Беларуси","Индивидуальный расчёт стоимости"]', NULL, 1, 0, 'published', 1790413760763, 1790413760763);
INSERT INTO `cleaning_companies` (`id`, `slug`, `name`, `legal_name`, `country_code`, `region`, `city`, `address`, `description`, `website_url`, `phone`, `email`, `telegram_url`, `price_from`, `price_unit`, `experience_years`, `cover_image`, `tags`, `guarantees`, `verified`, `promoted`, `status`, `created_at`, `updated_at`) VALUES ('kitt', 'chistiy-kit', 'Чистый Кит (CleanWhale)', NULL, 'BY', 'Минская', 'Минск', NULL, 'Уборка квартир, мойка окон, химчистка и уборка после ремонта в Минске. Работает по системе онлайн-бронирования с выбором клинера; регулярная уборка обходится дешевле разовой.', 'https://kitt.by', NULL, NULL, NULL, 94.99, NULL, NULL, NULL, '["Онлайн-бронирование","Скидки при регулярной уборке"]', NULL, 0, 0, 'published', 1790413760763, 1790413760763);
INSERT INTO `cleaning_companies` (`id`, `slug`, `name`, `legal_name`, `country_code`, `region`, `city`, `address`, `description`, `website_url`, `phone`, `email`, `telegram_url`, `price_from`, `price_unit`, `experience_years`, `cover_image`, `tags`, `guarantees`, `verified`, `promoted`, `status`, `created_at`, `updated_at`) VALUES ('cleanclean', 'clean-clean', 'Clean.Clean', NULL, 'BY', 'Минская', 'Минск', NULL, 'Уборка квартир, домов и офисов в Минске: от поддерживающей до генеральной уборки и уборки после стройки.', 'https://clean-clean.by', NULL, NULL, NULL, 100, NULL, NULL, NULL, '["Прозрачные тарифы","Расчёт стоимости онлайн"]', NULL, 0, 0, 'published', 1790413760763, 1790413760763);
INSERT INTO `cleaning_companies` (`id`, `slug`, `name`, `legal_name`, `country_code`, `region`, `city`, `address`, `description`, `website_url`, `phone`, `email`, `telegram_url`, `price_from`, `price_unit`, `experience_years`, `cover_image`, `tags`, `guarantees`, `verified`, `promoted`, `status`, `created_at`, `updated_at`) VALUES ('freshroom', 'freshroom', 'FreshRoom', NULL, 'BY', 'Минская', 'Минск', 'ул. Веры Хоружей, 29', 'Уборка квартир и домов в Минске силами клинеров-партнёров. Цены фиксированы для постоянных клиентов при уборке раз в неделю.', 'https://freshroom.by', '+375 44 749-88-99', 'info@freshroom.by', NULL, 85, NULL, NULL, NULL, '["Регулярная уборка","Выезд день в день"]', NULL, 0, 0, 'published', 1790413760763, 1790413760763);
INSERT INTO `cleaning_companies` (`id`, `slug`, `name`, `legal_name`, `country_code`, `region`, `city`, `address`, `description`, `website_url`, `phone`, `email`, `telegram_url`, `price_from`, `price_unit`, `experience_years`, `cover_image`, `tags`, `guarantees`, `verified`, `promoted`, `status`, `created_at`, `updated_at`) VALUES ('skyclean', 'skyclean', 'SkyClean', NULL, 'BY', 'Минская', 'Минск', NULL, 'Уборка квартир, коттеджей и офисов в Минске и Минской области. Работа строго по предварительной записи, застрахованная ответственность.', 'https://skyclean.by', '+375 29 66 33 555', 'info@skyclean.by', NULL, 100, NULL, 10, NULL, '["Минск и область","Опыт более 10 лет","Застрахованная ответственность"]', NULL, 0, 0, 'published', 1790413760763, 1790413760763);
INSERT INTO `cleaning_companies` (`id`, `slug`, `name`, `legal_name`, `country_code`, `region`, `city`, `address`, `description`, `website_url`, `phone`, `email`, `telegram_url`, `price_from`, `price_unit`, `experience_years`, `cover_image`, `tags`, `guarantees`, `verified`, `promoted`, `status`, `created_at`, `updated_at`) VALUES ('sauber', 'sauber', 'SAUBER GRUPPE', NULL, 'BY', 'Минская', 'Минск', 'ул. Ленина, 50', 'Клининговая компания в Минске: уборка квартир и офисов, после ремонта, мойка окон и химчистка. Более 9 300 выполненных уборок с 2019 года.', 'https://sauber.space', '+375 29 723-88-88', NULL, NULL, 18, 'окно', 6, NULL, '["9300+ уборок с 2019 года","Калькулятор цены на сайте"]', NULL, 0, 0, 'published', 1790413760763, 1790413760763);
INSERT INTO `cleaning_companies` (`id`, `slug`, `name`, `legal_name`, `country_code`, `region`, `city`, `address`, `description`, `website_url`, `phone`, `email`, `telegram_url`, `price_from`, `price_unit`, `experience_years`, `cover_image`, `tags`, `guarantees`, `verified`, `promoted`, `status`, `created_at`, `updated_at`) VALUES ('ladyclean', 'ladyclean', 'LADYCLEAN', NULL, 'BY', 'Минская', 'Минск', NULL, 'Клининговая компания Минска с 2020 года. Генеральная уборка, уборка после ремонта, химчистка мебели, мойка окон и офисов. ISO 9001:2015, 50+ клинеров, более 1000 клиентов.', 'https://ladyclean.by', '+375 33 682-11-00', NULL, NULL, 64, NULL, 4, NULL, '["ISO 9001:2015","50+ клинеров","Выезд за 2 часа","Круглосуточно"]', '["Гарантия 100%","Сертификат ISO 9001:2015"]', 0, 0, 'published', 1790413760763, 1790413760763);
INSERT INTO `cleaning_companies` (`id`, `slug`, `name`, `legal_name`, `country_code`, `region`, `city`, `address`, `description`, `website_url`, `phone`, `email`, `telegram_url`, `price_from`, `price_unit`, `experience_years`, `cover_image`, `tags`, `guarantees`, `verified`, `promoted`, `status`, `created_at`, `updated_at`) VALUES ('cleanoff', 'cleanoff', 'CleanOFF', 'ООО КлинОфф', 'BY', 'Минская', 'Минск', 'ул. К. Цеткин, 51, пом. 9B', 'Профессиональный клининг офисов и коммерческих помещений в Минске. Регулярная и генеральная уборка, уборка после ремонта, мойка окон, химчистка. Более 200 клиентов, безналичный расчёт.', 'https://cleanoff.by', '+375 29 125-09-09', NULL, NULL, 120.9, 'BYN/мес', NULL, NULL, '["200+ клиентов","Безналичный расчёт","Договор и акт выполненных работ"]', NULL, 0, 0, 'published', 1790413760763, 1790413760763);
INSERT INTO `cleaning_companies` (`id`, `slug`, `name`, `legal_name`, `country_code`, `region`, `city`, `address`, `description`, `website_url`, `phone`, `email`, `telegram_url`, `price_from`, `price_unit`, `experience_years`, `cover_image`, `tags`, `guarantees`, `verified`, `promoted`, `status`, `created_at`, `updated_at`) VALUES ('purifi', 'purifi', 'Глянец Про (Purifi)', 'ООО Глянец Про', 'BY', 'Минская', 'Минск', 'ул. Серова, 4, оф. 226', 'Клининговая компания для квартир, домов, офисов и коттеджей в Минске, Фаниполе, Дзержинске, Несвиже и Барановичах. Акцент на экологичность и безопасность средств.', 'https://purifi.by', '+375 29 358-09-66', 'info@purifi.by', NULL, 5, 'м²', NULL, NULL, '["Минск и область","Экологичные средства","Персональный подход"]', NULL, 0, 0, 'published', 1790413760763, 1790413760763);
INSERT INTO `cleaning_companies` (`id`, `slug`, `name`, `legal_name`, `country_code`, `region`, `city`, `address`, `description`, `website_url`, `phone`, `email`, `telegram_url`, `price_from`, `price_unit`, `experience_years`, `cover_image`, `tags`, `guarantees`, `verified`, `promoted`, `status`, `created_at`, `updated_at`) VALUES ('gryazi-net', 'gryazi-net', 'Грязи Нет', NULL, 'BY', 'Минская', 'Минск', 'пр-т Газеты Звязда, 16, пом. 57', 'Клининговая компания в Минске и Минской области. Уборка квартир, домов, коттеджей, офисов и производственных помещений. Химчистка ковров и мягкой мебели с выездом.', 'https://gryazi-net.by', '+375 29 980-33-68', NULL, NULL, 2, 'м²', NULL, NULL, '["Минск и область","Химчистка с выездом","Дисконтные карты"]', NULL, 0, 0, 'published', 1790413760763, 1790413760763);
INSERT INTO `cleaning_companies` (`id`, `slug`, `name`, `legal_name`, `country_code`, `region`, `city`, `address`, `description`, `website_url`, `phone`, `email`, `telegram_url`, `price_from`, `price_unit`, `experience_years`, `cover_image`, `tags`, `guarantees`, `verified`, `promoted`, `status`, `created_at`, `updated_at`) VALUES ('nesoda', 'nesoda', 'nesoda', NULL, 'BY', 'Минская', 'Минск', 'ул. Михайлашева, 5', 'Клининг для бизнеса в Минске с 2019 года. Регулярная и генеральная уборка офисов, уборка после ремонта, сезонная мойка окон. Более 1000 клиентов, работаем с помещениями до 2000+ м².', 'https://nesoda.by', '+375 29 700 99 70', 'info@nesoda.by', NULL, 20, 'м²', 5, NULL, '["1000+ клиентов","Крупные объекты до 2000 м²","Тестовая уборка бесплатно"]', NULL, 0, 0, 'published', 1790413760763, 1790413760763);
INSERT INTO `cleaning_companies` (`id`, `slug`, `name`, `legal_name`, `country_code`, `region`, `city`, `address`, `description`, `website_url`, `phone`, `email`, `telegram_url`, `price_from`, `price_unit`, `experience_years`, `cover_image`, `tags`, `guarantees`, `verified`, `promoted`, `status`, `created_at`, `updated_at`) VALUES ('cleanup', 'klin-ap', 'Клин-Ап (CleanUP)', NULL, 'BY', 'Минская', 'Минск', 'пер. Софьи Ковалевской, 42А/3', 'Клининговая компания в Минске с 2014 года. Уборка после ремонта, офисов, квартир, коттеджей, бизнес-центров. Химчистка ковров и мебели, мойка окон и витражей. 500+ убранных офисов.', 'https://clean-up.by', '+375 29 363-88-55', NULL, NULL, 2, 'м²', 10, NULL, '["С 2014 года","500+ офисов","Материальная ответственность","Сертификаты клинеров"]', '["Договор и акт выполненных работ","Полная материальная ответственность"]', 0, 0, 'published', 1790413760763, 1790413760763);
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('spectrclean', 'offices');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('spectrclean', 'post-renovation');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('spectrclean', 'deep-cleaning');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('spectrclean', 'windows');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('spectrclean', 'upholstery');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('spectrclean', 'apartments');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('freshclean', 'apartments');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('freshclean', 'offices');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('freshclean', 'post-renovation');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('freshclean', 'deep-cleaning');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('kitt', 'apartments');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('kitt', 'windows');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('kitt', 'post-renovation');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('kitt', 'upholstery');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('cleanclean', 'apartments');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('cleanclean', 'deep-cleaning');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('cleanclean', 'post-renovation');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('cleanclean', 'windows');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('freshroom', 'apartments');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('freshroom', 'post-renovation');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('freshroom', 'upholstery');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('skyclean', 'apartments');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('skyclean', 'offices');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('skyclean', 'deep-cleaning');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('skyclean', 'post-renovation');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('skyclean', 'windows');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('skyclean', 'upholstery');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('sauber', 'offices');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('sauber', 'post-renovation');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('sauber', 'deep-cleaning');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('sauber', 'windows');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('sauber', 'upholstery');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('ladyclean', 'apartments');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('ladyclean', 'deep-cleaning');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('ladyclean', 'post-renovation');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('ladyclean', 'upholstery');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('ladyclean', 'windows');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('ladyclean', 'offices');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('cleanoff', 'offices');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('cleanoff', 'post-renovation');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('cleanoff', 'deep-cleaning');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('cleanoff', 'windows');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('cleanoff', 'upholstery');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('purifi', 'apartments');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('purifi', 'offices');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('purifi', 'post-renovation');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('purifi', 'deep-cleaning');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('purifi', 'windows');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('gryazi-net', 'apartments');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('gryazi-net', 'offices');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('gryazi-net', 'post-renovation');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('gryazi-net', 'deep-cleaning');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('gryazi-net', 'upholstery');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('nesoda', 'offices');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('nesoda', 'post-renovation');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('nesoda', 'deep-cleaning');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('nesoda', 'windows');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('cleanup', 'apartments');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('cleanup', 'offices');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('cleanup', 'post-renovation');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('cleanup', 'deep-cleaning');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('cleanup', 'windows');
INSERT INTO `company_categories` (`company_id`, `category_id`) VALUES ('cleanup', 'upholstery');
INSERT INTO `rating_sources` (`id`, `company_id`, `source`, `source_url`, `rating`, `review_count`, `captured_at`) VALUES ('spectrclean-rating', 'spectrclean', 'google', 'https://www.google.com/maps', 4.8, 12, 1790413760763);
INSERT INTO `rating_sources` (`id`, `company_id`, `source`, `source_url`, `rating`, `review_count`, `captured_at`) VALUES ('freshclean-rating', 'freshclean', 'yandex', 'https://yandex.by/maps', 4.5, 8, 1790413760763);
INSERT INTO `rating_sources` (`id`, `company_id`, `source`, `source_url`, `rating`, `review_count`, `captured_at`) VALUES ('sauber-rating', 'sauber', 'google', 'https://zoon.by/minsk/utility_service/kliningovaya_kompaniya_sauber/', 4.6, 24, 1790413760763);
INSERT INTO `company_brands` (`company_id`, `brand_id`, `evidence_status`, `verified_at`) VALUES ('spectrclean', 'karcher', 'verified', 1790413760763);
INSERT INTO `company_brands` (`company_id`, `brand_id`, `evidence_status`, `verified_at`) VALUES ('skyclean', 'karcher', 'pending', NULL);
INSERT INTO `company_brands` (`company_id`, `brand_id`, `evidence_status`, `verified_at`) VALUES ('skyclean', 'vileda-pro', 'pending', NULL);
INSERT INTO `products` (`id`, `brand_id`, `slug`, `name`, `category`, `description`, `ph`, `compatible_surfaces`, `prohibited_surfaces`, `status`, `created_at`, `updated_at`) VALUES ('prod-kiehl-arenas', 'kiehl', 'kiehl-arenas-exet-3', 'Kiehl Arenas-exet 3', 'chemistry', 'Профессиональный пятновыводитель для удаления таниновых и растительных пятен (вино, кофе, чай) с текстиля', 7, '["upholstery","carpet","mattress"]', '["leather"]', 'published', 1790413760763, 1790413760763);
INSERT INTO `products` (`id`, `brand_id`, `slug`, `name`, `category`, `description`, `ph`, `compatible_surfaces`, `prohibited_surfaces`, `status`, `created_at`, `updated_at`) VALUES ('prod-prochem-stainpro', 'prochem', 'prochem-stain-pro', 'Prochem Stain Pro', 'chemistry', 'Энзимный нейтрализатор и пятновыводитель для белковых и пищевых пятен (кровь, молоко, еда)', 8.5, '["upholstery","carpet","mattress"]', '["silk"]', 'published', 1790413760763, 1790413760763);
INSERT INTO `products` (`id`, `brand_id`, `slug`, `name`, `category`, `description`, `ph`, `compatible_surfaces`, `prohibited_surfaces`, `status`, `created_at`, `updated_at`) VALUES ('prod-grass-cement', 'grass', 'grass-cement-cleaner', 'Grass Cement Cleaner', 'chemistry', 'Кислотный концентрат для удаления остатков цемента, строительной затирки и солевых высолов', 1.5, '["floor","bathroom"]', '["upholstery","carpet","mattress","marble"]', 'published', 1790413760763, 1790413760763);
INSERT INTO `products` (`id`, `brand_id`, `slug`, `name`, `category`, `description`, `ph`, `compatible_surfaces`, `prohibited_surfaces`, `status`, `created_at`, `updated_at`) VALUES ('prod-grass-azelit', 'grass', 'grass-azelit-pro', 'Grass Azelit Professional', 'chemistry', 'Концентрированное щелочное средство для удаления застарелого нагара и жира', 11.5, '["kitchen"]', '["upholstery","carpet","mattress","aluminum","natural_wood"]', 'published', 1790413760763, 1790413760763);
INSERT INTO `products` (`id`, `brand_id`, `slug`, `name`, `category`, `description`, `ph`, `compatible_surfaces`, `prohibited_surfaces`, `status`, `created_at`, `updated_at`) VALUES ('prod-karcher-puzzi', 'karcher', 'karcher-puzzi-10-1', 'Kärcher Puzzi 10/1', 'extractors', 'Профессиональный моющий пылесос-экстрактор для химчистки мягкой мебели и ковровых покрытий', NULL, '["upholstery","carpet","mattress","floor"]', NULL, 'published', 1790413760763, 1790413760763);
INSERT INTO `campaigns` (`id`, `brand_id`, `product_id`, `name`, `placement`, `status`, `starts_at`, `ends_at`, `target_countries`, `target_categories`, `target_surfaces`, `target_solutions`, `max_impressions`, `max_clicks`, `current_impressions`, `current_clicks`, `title`, `description`, `cta_text`, `cta_url`, `cta_type`, `badge_text`, `priority`, `created_at`, `updated_at`) VALUES ('camp-kiehl-upholstery', 'kiehl', 'prod-kiehl-arenas', 'Kiehl Arenas-exet 3 (Решения / Текстиль)', 'solution.sponsored_product', 'active', 1767225600000, 1798761599000, '["BY","RU","KZ"]', NULL, '["upholstery","carpet"]', '["vino-na-divane","kofe-na-tekstile"]', NULL, NULL, 120, 14, 'Kiehl Arenas-exet 3 — доказанная формула удаления танинов', 'Нейтральный состав pH 7.0 для велюра, шенилла и рогожки. Безопасен для волокон и цвета обивки.', 'Купить у официального дилера', 'https://kiehl.ru', 'where_to_buy', 'Спонсорский проверенный вариант', 10, 1790413760763, 1790413760763);
INSERT INTO `campaigns` (`id`, `brand_id`, `product_id`, `name`, `placement`, `status`, `starts_at`, `ends_at`, `target_countries`, `target_categories`, `target_surfaces`, `target_solutions`, `max_impressions`, `max_clicks`, `current_impressions`, `current_clicks`, `title`, `description`, `cta_text`, `cta_url`, `cta_type`, `badge_text`, `priority`, `created_at`, `updated_at`) VALUES ('camp-grass-offices', 'grass', NULL, 'GRASS Professional — генеральный партнёр категории офисов', 'rating.category_partner', 'active', 1767225600000, 1798761599000, '["BY","RU","KZ"]', '["offices"]', NULL, NULL, NULL, NULL, 340, 28, 'GRASS Professional — комплексная химия и диспенсерные системы для офисов', 'Специальные условия и контрактные цены для клининговых компаний и корпоративных клиентов.', 'Запросить оптовый прайс', 'https://grass.su', 'request_quote', 'Партнёр категории', 10, 1790413760763, 1790413760763);
INSERT INTO `campaigns` (`id`, `brand_id`, `product_id`, `name`, `placement`, `status`, `starts_at`, `ends_at`, `target_countries`, `target_categories`, `target_surfaces`, `target_solutions`, `max_impressions`, `max_clicks`, `current_impressions`, `current_clicks`, `title`, `description`, `cta_text`, `cta_url`, `cta_type`, `badge_text`, `priority`, `created_at`, `updated_at`) VALUES ('camp-karcher-home', 'karcher', NULL, 'Kärcher — партнёр сезона чистоты CLEANHUB', 'home.editorial_partner', 'active', 1767225600000, 1798761599000, '["BY","RU","KZ"]', NULL, NULL, NULL, NULL, NULL, 890, 72, 'Kärcher — эталон немецких технологий чистоты', 'Профессиональные экстракторы и пароочистители с сервисной поддержкой в Беларуси, России и Казахстане.', 'Найти авторизованный центр', 'https://karcher.by', 'where_to_buy', 'Партнёр сезона', 10, 1790413760763, 1790413760763);
INSERT INTO `solutions` (`id`, `slug`, `title`, `problem_type`, `surface`, `material`, `severity`, `audience`, `diy_steps`, `warnings`, `when_to_call_pro`, `diy_cost_note`, `pro_time_note`, `search_keywords`, `related_category`, `status`, `created_at`, `updated_at`) VALUES ('vino-na-divane', 'vino-na-divane', 'Пятно красного вина на диване из шенилла', 'stain', 'upholstery', 'шенилл / рогожка', 'fresh', 'b2c', '[{"order":1,"instruction":"Срочно промокните жидкость сухим белым хлопковым полотенцем или плотной салфеткой. Двигайтесь от краев пятна к центру, не растирая жидкость вглубь волокон.","tip":"Не давите с усилием — достаточно приложить полотенце ладонью."},{"order":2,"instruction":"Разведите мыльную пену нейтрального pH (6–7) в прохладной воде. Нанесите только пену на чистую микрофибру и аккуратно прижимайте к пятну.","tip":"Избегайте попадания избыточной воды в наполнитель."},{"order":3,"instruction":"Промойте участок салфеткой, слегка смоченной холодной водой, и сразу вытяните остатки влаги сухим полотенцем под прессом книги."}]', '["Не используйте горячую воду: танины красного вина ''заварятся'' в структуру ткани намертво.","Категорически нельзя тереть щеткой: шенилловая нить распушится, образуется неустранимая проплешина.","Не посыпайте поваренной солью: соль фиксирует винный пигмент в синтетических нитях обивки."]', 'Если пятно высохло более 3 часов назад, вино проникло глубже в поролон или после высыхания остался темный жесткий ореол. Профессиональный экстрактор с кислотным ополаскивателем удалит краситель без повреждения ворса.', '0 – 15 BYN (салфетки, мыльная пена, микрофибра)', '30 – 50 минут (химчистка на дому)', '["вино на диване","красное вино","пятно от вина","шенилл","вино обивка","пятновыводитель вино"]', 'upholstery', 'published', 1790413760763, 1790413760763);
INSERT INTO `solutions` (`id`, `slug`, `title`, `problem_type`, `surface`, `material`, `severity`, `audience`, `diy_steps`, `warnings`, `when_to_call_pro`, `diy_cost_note`, `pro_time_note`, `search_keywords`, `related_category`, `status`, `created_at`, `updated_at`) VALUES ('kofe-na-tekstile', 'kofe-na-tekstile', 'Пятно кофе с молоком на мебельной обивке', 'stain', 'upholstery', 'рогожка / жаккард / велюр', 'fresh', 'both', '[{"order":1,"instruction":"Промокните пролитый кофе сухими бумажными салфетками до прекращения впитывания влаги."},{"order":2,"instruction":"Нанесите специализированную энзимную пену для мебельного текстиля или мыльный раствор на 5 минут.","tip":"Энзимы бережно расщепляют молочный белок и танины кофе."},{"order":3,"instruction":"Соберите остатки пены чуть влажной микрофиброй круговыми движениями без нажима от краев к центру."}]', '["Не заливайте пятно большим объемом воды — жиры молока и кофеин уйдут в поролон, откуда через неделю появится запах скисшего молока.","Не сушите бытовым феном на максимальной температуре."]', 'Если кофе был сладким с жирным молоком, а пятно уже засохло. Домашними средствами удалить молочный жир из глубины наполнителя невозможно — нужен экстрактор с энзимной промывкой.', '5 – 25 BYN (энзимный спрей)', '30 – 40 минут', '["кофе на диване","пятно кофе","кофе с молоком","капучино обивка","запах молока мебель"]', 'upholstery', 'published', 1790413760763, 1790413760763);
INSERT INTO `solutions` (`id`, `slug`, `title`, `problem_type`, `surface`, `material`, `severity`, `audience`, `diy_steps`, `warnings`, `when_to_call_pro`, `diy_cost_note`, `pro_time_note`, `search_keywords`, `related_category`, `status`, `created_at`, `updated_at`) VALUES ('krov-na-matrase', 'krov-na-matrase', 'Пятно крови на чехле матраса', 'stain', 'mattress', 'трикотажный хлопковый чехол', 'fresh', 'b2c', '[{"order":1,"instruction":"Смочите ватный диск ледяной водой (ниже 15°C) и точечно прижимайте к пятну от внешних границ к центру."},{"order":2,"instruction":"Нанесите аптечную 3% перекись водорода точечно ватной палочкой на след крови (пенообразование расщепляет гемоглобин).","tip":"Проверьте стойкость красителя на скрытом участке чехла."},{"order":3,"instruction":"Немедленно промокните пену сухой салфеткой и засыпьте влажное место пищевой содой для абсорбции остатков пигмента."}]', '["Строго запрещено использовать теплую или горячую воду: белок крови сворачивается при температуре от 40°C и связывается с волокнами чехла навсегда.","Не допускайте промокания матраса насквозь — влага вызовет коррозию пружинного блока."]', 'Кровь проникла глубоко в кокосовую койру или холлофайбер, либо пятно застарелое (>24 часов). Нужна профессиональная экстракция с белковым нейтрализатором.', '2 – 10 BYN (перекись водорода, сода)', '40 – 60 минут', '["кровь на матрасе","пятно крови","кровь на диване","как отстирать кровь","матрас пятно"]', 'upholstery', 'published', 1790413760763, 1790413760763);
INSERT INTO `solutions` (`id`, `slug`, `title`, `problem_type`, `surface`, `material`, `severity`, `audience`, `diy_steps`, `warnings`, `when_to_call_pro`, `diy_cost_note`, `pro_time_note`, `search_keywords`, `related_category`, `status`, `created_at`, `updated_at`) VALUES ('mocha-i-zapah-matras', 'mocha-i-zapah-matras', 'Запах и следы мочи на матрасе и диване', 'odor', 'mattress', 'жаккард / холлофайбер / ППУ', 'set', 'b2c', '[{"order":1,"instruction":"Максимально отберите свежую влагу бумажными полотенцами под весом ладони."},{"order":2,"instruction":"Обильно распылите энзимный нейтрализатор запаха с живыми бактериями по всему ореолу загрязнения."},{"order":3,"instruction":"Накройте обработанное место пищевой пленкой на 2 часа, чтобы энзимы не высохли и расщепили кристаллы мочевой кислоты."},{"order":4,"instruction":"Снимите пленку и дайте высохнуть при естественной вентиляции комнаты."}]', '["Бытовые духи, освежители и хлорка строго запрещены: хлор вступит в токсичную реакцию с аммиаком, а отдушка создаст стойкий неприятный запах.","Уксус разрушает цветные волокна ткани и не расщепляет соли уратов."]', 'Повторные метки домашних животных, стойкий запах в спальне или проникновение глубже 3 см. Необходима промывка экстрактором с кислородным деструктором органики.', '20 – 40 BYN (энзимный уничтожитель запаха)', '60 – 90 минут', '["запах мочи","кошачья моча","моча на матрасе","запах диван","удалить запах мочи","энзимы"]', 'upholstery', 'published', 1790413760763, 1790413760763);
INSERT INTO `solutions` (`id`, `slug`, `title`, `problem_type`, `surface`, `material`, `severity`, `audience`, `diy_steps`, `warnings`, `when_to_call_pro`, `diy_cost_note`, `pro_time_note`, `search_keywords`, `related_category`, `status`, `created_at`, `updated_at`) VALUES ('poslestroy-zatirka-plitka', 'poslestroy-zatirka-plitka', 'Цементный и эпоксидный налет затирки на плитке после ремонта', 'postrenovation', 'floor', 'керамогранит / керамическая плитка', 'set', 'both', '[{"order":1,"instruction":"Определите состав затирки: цементная смывается кислотным составом (pH 1–2), эпоксидная — щелочным растворителем эпоксидных смол."},{"order":2,"instruction":"Нанесите рабочий раствор очистителя на увлажненную поверхность на 5–7 минут для размягчения вяжущего слоя."},{"order":3,"instruction":"Обработайте поверхность ручным белым или красным падом без металлического абразива, соберите эмульсию резиновым сгоном."},{"order":4,"instruction":"Дважды промойте поверхность чистой водой с добавлением нейтрализатора кислотности."}]', '["Не наносите кислотные составы на натуральный мрамор, известняк и травертин — кислота мгновенно сожжет полировку.","Не используйте металлические шпатели: на глазури останутся несмываемые серые полосы металла."]', 'Площадь объекта более 40 м², эпоксидная затирка затвердела более 7 дней назад, либо уложен матовый рельефный керамогранит с глубокими порами.', '30 – 70 BYN (профессиональный смыватель затирки + пад)', '2 – 5 часов (роторная машина + промышленный водосос)', '["затирка на плитке","эпоксидная затирка","налет после ремонта","цементная пыль","смыть затирку"]', 'post-renovation', 'published', 1790413760763, 1790413760763);
INSERT INTO `solutions` (`id`, `slug`, `title`, `problem_type`, `surface`, `material`, `severity`, `audience`, `diy_steps`, `warnings`, `when_to_call_pro`, `diy_cost_note`, `pro_time_note`, `search_keywords`, `related_category`, `status`, `created_at`, `updated_at`) VALUES ('poslestroy-okna-skotch', 'poslestroy-okna-skotch', 'Следы скотча, клея и грунтовки на стеклопакетах', 'postrenovation', 'window', 'стекло и белый ПВХ-профиль', 'set', 'both', '[{"order":1,"instruction":"Нанесите средство ''Антискотч'' на цитрусовых терпенах или изопропиловый спирт на клеевой след."},{"order":2,"instruction":"Выдержите 3–5 минут до полного растворения клеевого слоя."},{"order":3,"instruction":"Снимите размягченный клей профессиональным скребком для стекла со свежим лезвием под углом 30° по влажной поверхности."},{"order":4,"instruction":"Протрите стекло спиртовым стеклоочистителем и вафельной микрофиброй."}]', '["Никогда не скребите сухое стекло: мельчайшая песчинка под лезвием приведет к глубокой царапине во всю длину прохода.","Не используйте растворитель 646 и ацетон на пластиковых профилях — пластик пожелтеет и станет хрупким."]', 'Защитная лента на рамах спеклась на солнце более 6 месяцев назад, фасадные глухие окна или остекление в пол на высоте.', '15 – 35 BYN (спрей-антискотч + скребок с лезвием)', '1.5 – 3 часа на всю квартиру', '["скотч на окнах","клей на стекле","прикипела пленка","грунтовка на окне","мойка окон после ремонта"]', 'windows', 'published', 1790413760763, 1790413760763);
INSERT INTO `solutions` (`id`, `slug`, `title`, `problem_type`, `surface`, `material`, `severity`, `audience`, `diy_steps`, `warnings`, `when_to_call_pro`, `diy_cost_note`, `pro_time_note`, `search_keywords`, `related_category`, `status`, `created_at`, `updated_at`) VALUES ('zhir-vytyazhka-kuhnya', 'zhir-vytyazhka-kuhnya', 'Застарелый полимеризованный жир на кухонной вытяжке и фартуке', 'stain', 'kitchen', 'нержавеющая сталь / стекло / керамика', 'extreme', 'both', '[{"order":1,"instruction":"Снимите жироулавливающие решетки и замочите в горячей воде (>60°C) со специализированным щелочным обезжиривателем на 20 минут."},{"order":2,"instruction":"Нанесите щелочную пену на корпус вытяжки и фартук, избегая попадания внутрь кнопок и электродвигателя."},{"order":3,"instruction":"Смойте жир губкой высокой плотности, нейтрализуйте поверхность слабым раствором лимонной кислоты и протрите микрофиброй."}]', '["Не замачивайте алюминиевые решетки в едком натре (pH > 11): алюминий необратимо окислится и почернеет за 5 минут.","Не трите шлифованную нержавеющую сталь металлическими губками или поперек направления шлифовки."]', 'Вытяжка ресторана / кафе, жир проник в крыльчатку мотора и вентиляционный канал, либо требуется генеральная уборка кухни под ключ.', '15 – 30 BYN (профессиональный обезжириватель)', '1 – 2 часа', '["жир на вытяжке","нагар на кухне","помыть решетку вытяжки","жирный налет фартук","клининг кухни"]', 'deep-cleaning', 'published', 1790413760763, 1790413760763);
INSERT INTO `solutions` (`id`, `slug`, `title`, `problem_type`, `surface`, `material`, `severity`, `audience`, `diy_steps`, `warnings`, `when_to_call_pro`, `diy_cost_note`, `pro_time_note`, `search_keywords`, `related_category`, `status`, `created_at`, `updated_at`) VALUES ('vodny-kamen-dushevaya', 'vodny-kamen-dushevaya', 'Известковый налет и водный камень на стекле душевой кабины', 'scale', 'bathroom', 'закаленное стекло / хромированная фурнитура', 'set', 'b2c', '[{"order":1,"instruction":"Нанесите профессиональный кислотный гель против водного камня (pH 2–3) через пенный триггер снизу вверх."},{"order":2,"instruction":"Выдержите состав 5–8 минут для растворения кальциевых отложений, не допуская высыхания капель."},{"order":3,"instruction":"Обработайте стекло мягким белым меламиновым падом, обильно смойте холодной водой."},{"order":4,"instruction":"Стяните остатки влаги резиновым склиджем и отполируйте сухой салфеткой для стекла."}]', '["Берегите хромированную сантехнику эконом-сегмента: тонкое напыление слазит от концентрированных кислот пятнами за секунды.","Не используйте абразивные чистящие порошки — микроцарапины ускорят нарастание нового камня втрое."]', 'Водный камень въелся в стекло (силикатное травление, матовый белесый слой не растворяется кислотой). Требуется механическая полировка оксидом церия или замена остекления.', '15 – 30 BYN (кислотный гель + резиновый сгон)', '40 – 60 минут', '["водный камень","известковый налет","душевая кабина","налет на стекле","помыть душевую"]', 'deep-cleaning', 'published', 1790413760763, 1790413760763);
INSERT INTO `solutions` (`id`, `slug`, `title`, `problem_type`, `surface`, `material`, `severity`, `audience`, `diy_steps`, `warnings`, `when_to_call_pro`, `diy_cost_note`, `pro_time_note`, `search_keywords`, `related_category`, `status`, `created_at`, `updated_at`) VALUES ('uborka-ofisa-posle-korporativa', 'uborka-ofisa-posle-korporativa', 'Срочная уборка офиса после корпоративного мероприятия', 'general', 'other', 'коммерческий ковролин / офисная мебель / стекло', 'fresh', 'b2b', '[{"order":1,"instruction":"Соберите крупный мусор, коробки и одноразовую посуду в плотные пакеты 120 л, освободив проходы."},{"order":2,"instruction":"Точечно промокните свежие разливы напитков на ковролине и диванах бумажными полотенцами без втирания."},{"order":3,"instruction":"Протрите столы и технику антистатическим спреем, смойте следы с переговорных стекол спиртовым средством."},{"order":4,"instruction":"Пропылесосьте коммерческий ковролин и промойте пол входной группы нейтральным клинером."}]', '["Не замывайте пятна на ковролине бытовыми пенками: липкий мыльный осадок через несколько дней превратится в черное пятно из-за налипающей пыли."]', 'Площадь офиса более 100 м², необходимо закончить уборку до начала рабочего дня (08:30 утра), требуются закрывающие акты и безналичная оплата для бухгалтерии.', '30 – 50 BYN (мешки, салфетки, базовые средства)', '2 – 3 часа (выездная мобильная бригада)', '["уборка офиса","клининг после корпоратива","срочная уборка офиса","клининг b2b","уборка ковролина"]', 'offices', 'published', 1790413760763, 1790413760763);
INSERT INTO `solutions` (`id`, `slug`, `title`, `problem_type`, `surface`, `material`, `severity`, `audience`, `diy_steps`, `warnings`, `when_to_call_pro`, `diy_cost_note`, `pro_time_note`, `search_keywords`, `related_category`, `status`, `created_at`, `updated_at`) VALUES ('zapah-syrosti-posle-potopa', 'zapah-syrosti-posle-potopa', 'Запах сырости и риск плесени после затопления квартиры', 'odor', 'floor', 'бетонная стяжка / ламинат / ковровые покрытия', 'extreme', 'both', '[{"order":1,"instruction":"Немедленно перекройте стояки и обесточьте помещение на щитке."},{"order":2,"instruction":"Соберите стоячую воду водососом или салфетками из микрофибры высокой плотности."},{"order":3,"instruction":"Демонтируйте пластиковые плинтусы и приподнимите края напольного покрытия для циркуляции воздуха."},{"order":4,"instruction":"Организуйте сквозное проветривание и включите бытовой осушитель воздуха (не обогреватель!)."}]', '["Не включайте тепловые пушки в закрытом помещении: влажное тепло создаст идеальный инкубатор для плесени за 24–48 часов.","Не закрашивайте сырые стены грунтовкой до полного высыхания стяжки."]', 'Вода стояла более 6 часов, залила шумоизоляцию под стяжкой или паркетную доску. Необходимы профессиональные сушильные машины, замер влагомером и озонирование для уничтожения спор плесени.', '50 – 100 BYN (аренда бытового осушителя)', '1 – 3 суток осушения + озонирование 2 часа', '["затопили квартиру","запах сырости","плесень после потопа","просушка квартиры","озонирование"]', 'deep-cleaning', 'published', 1790413760763, 1790413760763);
INSERT INTO `solution_products` (`id`, `solution_id`, `brand_id`, `product_id`, `role`, `note`) VALUES ('sp-1', 'vino-na-divane', 'kiehl', NULL, 'recommended', 'Kiehl Arenas-exet 3 (удаление танинов и растительных пигментов)');
INSERT INTO `solution_products` (`id`, `solution_id`, `brand_id`, `product_id`, `role`, `note`) VALUES ('sp-2', 'vino-na-divane', 'prochem', NULL, 'alternative', 'Prochem Stain Pro (нейтрализатор пятен)');
INSERT INTO `solution_products` (`id`, `solution_id`, `brand_id`, `product_id`, `role`, `note`) VALUES ('sp-3', 'kofe-na-tekstile', 'prochem', NULL, 'recommended', 'Prochem Coffee Stain Remover');
INSERT INTO `solution_products` (`id`, `solution_id`, `brand_id`, `product_id`, `role`, `note`) VALUES ('sp-4', 'kofe-na-tekstile', 'kiehl', NULL, 'alternative', 'Kiehl Omniclean');
INSERT INTO `solution_products` (`id`, `solution_id`, `brand_id`, `product_id`, `role`, `note`) VALUES ('sp-5', 'krov-na-matrase', 'prochem', NULL, 'recommended', 'Prochem Stain Pro (щелочной энзимный комплекс)');
INSERT INTO `solution_products` (`id`, `solution_id`, `brand_id`, `product_id`, `role`, `note`) VALUES ('sp-6', 'krov-na-matrase', 'ecolab', NULL, 'alternative', 'Ecolab Taxat Clean');
INSERT INTO `solution_products` (`id`, `solution_id`, `brand_id`, `product_id`, `role`, `note`) VALUES ('sp-7', 'mocha-i-zapah-matras', 'prochem', NULL, 'recommended', 'Prochem Urine Neutraliser');
INSERT INTO `solution_products` (`id`, `solution_id`, `brand_id`, `product_id`, `role`, `note`) VALUES ('sp-8', 'mocha-i-zapah-matras', 'ecolab', NULL, 'alternative', 'Ecolab OdoGone');
INSERT INTO `solution_products` (`id`, `solution_id`, `brand_id`, `product_id`, `role`, `note`) VALUES ('sp-9', 'poslestroy-zatirka-plitka', 'kiehl', NULL, 'recommended', 'Kiehl Powerfix-Gel (кислотный очиститель остатков цемента)');
INSERT INTO `solution_products` (`id`, `solution_id`, `brand_id`, `product_id`, `role`, `note`) VALUES ('sp-10', 'poslestroy-zatirka-plitka', 'grass', NULL, 'alternative', 'Grass Cement Cleaner');
INSERT INTO `solution_products` (`id`, `solution_id`, `brand_id`, `product_id`, `role`, `note`) VALUES ('sp-11', 'poslestroy-okna-skotch', 'kiehl', NULL, 'recommended', 'Kiehl Tablefit (растворитель синтетических смол и скотча)');
INSERT INTO `solution_products` (`id`, `solution_id`, `brand_id`, `product_id`, `role`, `note`) VALUES ('sp-12', 'poslestroy-okna-skotch', 'grass', NULL, 'alternative', 'Grass Antigraffiti');
INSERT INTO `solution_products` (`id`, `solution_id`, `brand_id`, `product_id`, `role`, `note`) VALUES ('sp-13', 'zhir-vytyazhka-kuhnya', 'grass', NULL, 'recommended', 'Grass Azelit Professional (мощный щелочной антижир)');
INSERT INTO `solution_products` (`id`, `solution_id`, `brand_id`, `product_id`, `role`, `note`) VALUES ('sp-14', 'zhir-vytyazhka-kuhnya', 'kiehl', NULL, 'alternative', 'Kiehl Grasset-plus');
INSERT INTO `solution_products` (`id`, `solution_id`, `brand_id`, `product_id`, `role`, `note`) VALUES ('sp-15', 'vodny-kamen-dushevaya', 'kiehl', NULL, 'recommended', 'Kiehl Sanikal-eco (экологичный гель против водного камня)');
INSERT INTO `solution_products` (`id`, `solution_id`, `brand_id`, `product_id`, `role`, `note`) VALUES ('sp-16', 'vodny-kamen-dushevaya', 'grass', NULL, 'alternative', 'Grass Gloss (кислотный клинер для ванн)');
INSERT INTO `solution_products` (`id`, `solution_id`, `brand_id`, `product_id`, `role`, `note`) VALUES ('sp-17', 'uborka-ofisa-posle-korporativa', 'vileda-pro', NULL, 'recommended', 'Vileda UltraSpeed Pro (профессиональный моп и система отжима)');
INSERT INTO `solution_products` (`id`, `solution_id`, `brand_id`, `product_id`, `role`, `note`) VALUES ('sp-18', 'uborka-ofisa-posle-korporativa', 'bosch', NULL, 'alternative', 'Bosch Professional GAS (промышленный пылесос)');
INSERT INTO `solution_products` (`id`, `solution_id`, `brand_id`, `product_id`, `role`, `note`) VALUES ('sp-19', 'zapah-syrosti-posle-potopa', 'karcher', NULL, 'recommended', 'Kärcher NT 30/1 (профессиональный водосос)');
INSERT INTO `solution_products` (`id`, `solution_id`, `brand_id`, `product_id`, `role`, `note`) VALUES ('sp-20', 'zapah-syrosti-posle-potopa', 'prochem', NULL, 'alternative', 'Prochem Odour Fresh (деструктор запаха сырости)');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-1', 'диван', 'b2c', 10, 'category', 'upholstery');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-2', 'химчистка дивана', 'b2c', 10, 'category', 'upholstery');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-3', 'пятно на диване', 'b2c', 9, 'solution', 'vino-na-divane');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-4', 'вино на диване', 'b2c', 10, 'solution', 'vino-na-divane');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-5', 'красное вино', 'b2c', 8, 'solution', 'vino-na-divane');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-6', 'пятно от вина', 'b2c', 9, 'solution', 'vino-na-divane');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-7', 'кофе на обивке', 'b2c', 9, 'solution', 'kofe-na-tekstile');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-8', 'пролил кофе', 'b2c', 8, 'solution', 'kofe-na-tekstile');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-9', 'пятно крови', 'b2c', 9, 'solution', 'krov-na-matrase');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-10', 'кровь на матрасе', 'b2c', 10, 'solution', 'krov-na-matrase');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-11', 'запах мочи', 'b2c', 10, 'solution', 'mocha-i-zapah-matras');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-12', 'кошачья моча', 'b2c', 9, 'solution', 'mocha-i-zapah-matras');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-13', 'запах матраса', 'b2c', 9, 'solution', 'mocha-i-zapah-matras');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-14', 'водный камень', 'b2c', 9, 'solution', 'vodny-kamen-dushevaya');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-15', 'налет в душевой', 'b2c', 8, 'solution', 'vodny-kamen-dushevaya');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-16', 'жир на вытяжке', 'b2c', 9, 'solution', 'zhir-vytyazhka-kuhnya');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-17', 'нагар на кухне', 'b2c', 8, 'solution', 'zhir-vytyazhka-kuhnya');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-18', 'уборка квартиры', 'b2c', 10, 'category', 'apartments');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-19', 'уборка дома', 'b2c', 9, 'category', 'apartments');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-20', 'генеральная уборка', 'b2c', 10, 'category', 'deep-cleaning');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-21', 'мытье окон', 'b2c', 10, 'category', 'windows');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-22', 'окна в квартире', 'b2c', 8, 'category', 'windows');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-23', 'клинер на дом', 'b2c', 8, 'category', 'apartments');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-24', 'поддерживающая уборка', 'b2c', 8, 'category', 'apartments');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-25', 'почистить ковер', 'b2c', 9, 'category', 'upholstery');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-26', 'химчистка матраса', 'b2c', 9, 'category', 'upholstery');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-27', 'затопили квартиру', 'b2c', 8, 'solution', 'zapah-syrosti-posle-potopa');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-28', 'плесень после потопа', 'b2c', 8, 'solution', 'zapah-syrosti-posle-potopa');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-29', 'офис', 'b2b', 10, 'category', 'offices');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-30', 'уборка офиса', 'b2b', 10, 'category', 'offices');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-31', 'клининг офиса', 'b2b', 10, 'category', 'offices');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-32', 'клининг b2b', 'b2b', 10, 'category', 'offices');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-33', 'коммерческий клининг', 'b2b', 10, 'category', 'offices');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-34', 'уборка склада', 'b2b', 9, 'category', 'offices');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-35', 'клининг бизнес центра', 'b2b', 9, 'category', 'offices');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-36', 'клининг по безналу', 'b2b', 9, 'category', 'offices');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-37', 'договор клининга', 'b2b', 9, 'category', 'offices');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-38', 'ежедневная уборка офиса', 'b2b', 9, 'category', 'offices');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-39', 'клининг после ремонта офис', 'b2b', 9, 'category', 'post-renovation');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-40', 'уборка после ремонта', 'b2b', 8, 'category', 'post-renovation');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-41', 'затирка на плитке', 'b2b', 8, 'solution', 'poslestroy-zatirka-plitka');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-42', 'эпоксидная затирка', 'b2b', 8, 'solution', 'poslestroy-zatirka-plitka');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-43', 'скотч на окнах', 'b2b', 8, 'solution', 'poslestroy-okna-skotch');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-44', 'следы клея стекло', 'b2b', 8, 'solution', 'poslestroy-okna-skotch');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-45', 'уборка после корпоратива', 'b2b', 9, 'solution', 'uborka-ofisa-posle-korporativa');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-46', 'клининг мероприятия', 'b2b', 8, 'solution', 'uborka-ofisa-posle-korporativa');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-47', 'мойка фасадов', 'b2b', 9, 'category', 'windows');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-48', 'витражи', 'b2b', 8, 'category', 'windows');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-49', 'промышленный клининг', 'b2b', 9, 'category', 'offices');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-50', 'клининг ресторана', 'b2b', 9, 'category', 'deep-cleaning');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-51', 'kiehl', 'pro', 10, 'brand', 'kiehl');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-52', 'karcher', 'pro', 10, 'brand', 'karcher');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-53', 'керхер', 'pro', 10, 'brand', 'karcher');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-54', 'dyson', 'pro', 9, 'brand', 'dyson');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-55', 'bosch', 'pro', 9, 'brand', 'bosch');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-56', 'vileda', 'pro', 10, 'brand', 'vileda-professional');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-57', 'виледа', 'pro', 10, 'brand', 'vileda-professional');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-58', 'ecolab', 'pro', 9, 'brand', 'ecolab');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-59', 'эколаб', 'pro', 9, 'brand', 'ecolab');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-60', 'grass', 'pro', 9, 'brand', 'grass');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-61', 'грасс', 'pro', 9, 'brand', 'grass');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-62', 'prochem', 'pro', 10, 'brand', 'prochem');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-63', 'прохем', 'pro', 10, 'brand', 'prochem');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-64', 'экстрактор', 'pro', 9, 'brand', 'karcher');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-65', 'профессиональная химия', 'pro', 9, 'brand', 'kiehl');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-66', 'инвентарь vileda', 'pro', 9, 'brand', 'vileda-professional');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-67', 'пятновыводитель kiehl', 'pro', 9, 'brand', 'kiehl');
INSERT INTO `intent_keywords` (`id`, `keyword`, `intent`, `weight`, `target_kind`, `target_slug`) VALUES ('ik-68', 'поломоечная машина', 'pro', 9, 'brand', 'karcher');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-1', 'vino-na-divane', NULL, 'BY', 'Минск', 'BYN', 60, 120, 'диван', 'Химчистка посадочного места и удаление пятна экстрактором');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-2', 'vino-na-divane', NULL, 'RU', 'Москва', 'RUB', 2500, 5000, 'диван', 'Химчистка и вывод винного пигмента');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-3', 'vino-na-divane', NULL, 'KZ', 'Алматы', 'KZT', 12000, 25000, 'диван', 'Экстракционная химчистка с нейтрализатором');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-4', 'kofe-na-tekstile', NULL, 'BY', 'Минск', 'BYN', 50, 100, 'место', 'Энзимная химчистка с удалением молочных жиров');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-5', 'kofe-na-tekstile', NULL, 'RU', 'Москва', 'RUB', 2000, 4500, 'место', 'Экстракция кофейного пятна');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-6', 'kofe-na-tekstile', NULL, 'KZ', 'Алматы', 'KZT', 10000, 22000, 'место', 'Профессиональная промывка');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-7', 'krov-na-matrase', NULL, 'BY', 'Минск', 'BYN', 70, 140, 'матрас', 'Глубокая экстракция с расщеплением белка');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-8', 'krov-na-matrase', NULL, 'RU', 'Москва', 'RUB', 3000, 6000, 'матрас', 'Белковый нейтрализатор + экстрактор');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-9', 'krov-na-matrase', NULL, 'KZ', 'Алматы', 'KZT', 15000, 30000, 'матрас', 'Вывод застарелых белковых пятен');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-10', 'mocha-i-zapah-matras', NULL, 'BY', 'Минск', 'BYN', 80, 160, 'матрас', 'Полная дезинфекция и удаление запаха озоном / энзимами');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-11', 'mocha-i-zapah-matras', NULL, 'RU', 'Москва', 'RUB', 3500, 7000, 'матрас', 'Промывка наполнения + нейтрализация уратов');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-12', 'mocha-i-zapah-matras', NULL, 'KZ', 'Алматы', 'KZT', 18000, 35000, 'матрас', 'Глубокая экстракция запаха');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-13', 'poslestroy-zatirka-plitka', NULL, 'BY', 'Минск', 'BYN', 5, 12, 'м²', 'Роторная размывка пола со смывкой затирки');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-14', 'poslestroy-zatirka-plitka', NULL, 'RU', 'Москва', 'RUB', 200, 450, 'м²', 'Очистка керамогранита от затирок');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-15', 'poslestroy-zatirka-plitka', NULL, 'KZ', 'Алматы', 'KZT', 1000, 2200, 'м²', 'Механическая очистка пола');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-16', 'poslestroy-okna-skotch', NULL, 'BY', 'Минск', 'BYN', 20, 40, 'окно', 'Снятие прикипевшей пленки и клея с рамы и стекла');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-17', 'poslestroy-okna-skotch', NULL, 'RU', 'Москва', 'RUB', 800, 1600, 'окно', 'Удаление скотча и очистка стеклопакета');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-18', 'poslestroy-okna-skotch', NULL, 'KZ', 'Алматы', 'KZT', 4000, 8000, 'окно', 'Мойка окон после ремонта');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-19', 'zhir-vytyazhka-kuhnya', NULL, 'BY', 'Минск', 'BYN', 70, 150, 'кухня', 'Глубокое обезжиривание вытяжки, решеток и фартука');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-20', 'zhir-vytyazhka-kuhnya', NULL, 'RU', 'Москва', 'RUB', 3000, 6500, 'кухня', 'Очистка зоны готовки и вытяжки');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-21', 'zhir-vytyazhka-kuhnya', NULL, 'KZ', 'Алматы', 'KZT', 15000, 32000, 'кухня', 'Комплексное обезжиривание');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-22', 'vodny-kamen-dushevaya', NULL, 'BY', 'Минск', 'BYN', 45, 90, 'кабина', 'Удаление водного камня со стекол и хрома душевой');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-23', 'vodny-kamen-dushevaya', NULL, 'RU', 'Москва', 'RUB', 1800, 3800, 'кабина', 'Очистка известкового налета');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-24', 'vodny-kamen-dushevaya', NULL, 'KZ', 'Алматы', 'KZT', 9000, 19000, 'кабина', 'Снятие камня со стекол');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-25', 'uborka-ofisa-posle-korporativa', NULL, 'BY', 'Минск', 'BYN', 4, 8, 'м²', 'Срочный ночной / утренний клининг офиса с безналом');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-26', 'uborka-ofisa-posle-korporativa', NULL, 'RU', 'Москва', 'RUB', 150, 300, 'м²', 'Экспресс-уборка коммерческих помещений');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-27', 'uborka-ofisa-posle-korporativa', NULL, 'KZ', 'Алматы', 'KZT', 700, 1500, 'м²', 'Срочная уборка офисных площадей');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-28', 'zapah-syrosti-posle-potopa', NULL, 'BY', 'Минск', 'BYN', 8, 18, 'м²', 'Откачка воды, аренда промышленных сушилок, озонирование');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-29', 'zapah-syrosti-posle-potopa', NULL, 'RU', 'Москва', 'RUB', 300, 700, 'м²', 'Просушка помещений и антиплесневая обработка');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-30', 'zapah-syrosti-posle-potopa', NULL, 'KZ', 'Алматы', 'KZT', 1500, 3500, 'м²', 'Аварийная просушка квартиры');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-cat-1', NULL, 'apartments', 'BY', 'Минск', 'BYN', 80, 200, 'уборка', 'Поддерживающая уборка 1–3-комнатной квартиры');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-cat-2', NULL, 'apartments', 'RU', 'Москва', 'RUB', 3000, 8000, 'уборка', 'Уборка квартиры');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-cat-3', NULL, 'apartments', 'KZ', 'Алматы', 'KZT', 15000, 40000, 'уборка', 'Уборка жилых помещений');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-cat-4', NULL, 'offices', 'BY', 'Минск', 'BYN', 3, 7, 'м²', 'Регулярный клининг офиса по договору');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-cat-5', NULL, 'offices', 'RU', 'Москва', 'RUB', 120, 280, 'м²', 'Уборка офисов');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-cat-6', NULL, 'offices', 'KZ', 'Алматы', 'KZT', 600, 1400, 'м²', 'Клининг офисов');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-cat-7', NULL, 'upholstery', 'BY', 'Минск', 'BYN', 50, 130, 'изделие', 'Химчистка диванов, матрасов, ковров');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-cat-8', NULL, 'upholstery', 'RU', 'Москва', 'RUB', 2200, 5500, 'изделие', 'Выездная химчистка мебели');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-cat-9', NULL, 'upholstery', 'KZ', 'Алматы', 'KZT', 11000, 26000, 'изделие', 'Химчистка мебели');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-cat-10', NULL, 'windows', 'BY', 'Минск', 'BYN', 15, 35, 'окно', 'Мойка окон с двух сторон со створками');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-cat-11', NULL, 'windows', 'RU', 'Москва', 'RUB', 600, 1400, 'окно', 'Сезонная мойка окон');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-cat-12', NULL, 'windows', 'KZ', 'Алматы', 'KZT', 3000, 7000, 'окно', 'Мытье окон');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-cat-13', NULL, 'post-renovation', 'BY', 'Минск', 'BYN', 5, 10, 'м²', 'Обеспыливание, смывка затирки, мойка окон после ремонта');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-cat-14', NULL, 'post-renovation', 'RU', 'Москва', 'RUB', 200, 400, 'м²', 'Послестроительный клининг');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-cat-15', NULL, 'post-renovation', 'KZ', 'Алматы', 'KZT', 1000, 2000, 'м²', 'Уборка после ремонта');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-cat-16', NULL, 'deep-cleaning', 'BY', 'Минск', 'BYN', 6, 12, 'м²', 'Генеральный клининг всей квартиры с кухней и санузлом');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-cat-17', NULL, 'deep-cleaning', 'RU', 'Москва', 'RUB', 250, 500, 'м²', 'Генеральная уборка');
INSERT INTO `price_estimates` (`id`, `solution_id`, `category_id`, `country_code`, `city`, `currency`, `price_min`, `price_max`, `unit`, `note`) VALUES ('pe-cat-18', NULL, 'deep-cleaning', 'KZ', 'Алматы', 'KZT', 1200, 2500, 'м²', 'Генеральная уборка');