ALTER TABLE `campaigns` ADD `product_id` text REFERENCES products(id);--> statement-breakpoint
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
ALTER TABLE `products` ADD `prohibited_surfaces` text;