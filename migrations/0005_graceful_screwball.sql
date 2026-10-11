ALTER TABLE `analytics_events` ADD `page_view_id` text;--> statement-breakpoint
ALTER TABLE `brand_leads` ADD `consent_accepted_at` integer;--> statement-breakpoint
ALTER TABLE `brand_leads` ADD `consent_version` text;--> statement-breakpoint
ALTER TABLE `partner_leads` ADD `plan` text;--> statement-breakpoint
ALTER TABLE `partner_leads` ADD `consent_accepted_at` integer;--> statement-breakpoint
ALTER TABLE `partner_leads` ADD `consent_version` text;--> statement-breakpoint
ALTER TABLE `solutions` ADD `video_url` text;