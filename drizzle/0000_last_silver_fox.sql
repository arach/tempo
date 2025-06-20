CREATE TABLE `activities` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`type` text NOT NULL,
	`description` text,
	`duration` text,
	`color` text,
	`date` text NOT NULL,
	`position` integer DEFAULT 0,
	`metadata` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `day_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category` text,
	`tags` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `template_activities` (
	`id` text PRIMARY KEY NOT NULL,
	`template_id` text NOT NULL,
	`title` text NOT NULL,
	`type` text NOT NULL,
	`description` text,
	`duration` text,
	`color` text,
	`position` integer DEFAULT 0,
	`metadata` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`template_id`) REFERENCES `day_templates`(`id`) ON UPDATE no action ON DELETE cascade
);
