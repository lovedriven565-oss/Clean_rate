CREATE TABLE `intent_keywords` (
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
CREATE INDEX `solutions_status_idx` ON `solutions` (`status`);