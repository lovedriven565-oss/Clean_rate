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
CREATE INDEX `suppliers_location_idx` ON `suppliers` (`country_code`,`city`);