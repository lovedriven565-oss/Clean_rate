CREATE TABLE `brand_leads` (
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
ALTER TABLE `analytics_events` ADD `metadata` text;