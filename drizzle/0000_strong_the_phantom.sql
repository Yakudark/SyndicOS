CREATE TABLE `meetings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`location` text,
	`start_at` integer NOT NULL,
	`end_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`meeting_id` integer,
	`content` text NOT NULL,
	`created_at` integer DEFAULT '"2026-01-02T16:25:15.266Z"',
	FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`display_name` text DEFAULT 'Agent',
	`monthly_quota_minutes` integer DEFAULT 2100,
	`theme_variant` text DEFAULT 'cyan'
);
--> statement-breakpoint
CREATE TABLE `time_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`start_time` integer NOT NULL,
	`end_time` integer,
	`minutes` integer DEFAULT 0,
	`meeting_id` integer,
	FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`) ON UPDATE no action ON DELETE no action
);
