CREATE TABLE `company_categories` (
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
ALTER TABLE `cleaning_companies` ADD `guarantees` text;