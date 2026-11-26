CREATE TABLE `ai_usage_daily` (
	`day` text PRIMARY KEY NOT NULL,
	`photo_attempts` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL
);
