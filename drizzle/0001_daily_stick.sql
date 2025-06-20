CREATE TABLE `day_mutations` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`mutation_type` text NOT NULL,
	`mutation_data` text NOT NULL,
	`source_template_id` text,
	`user_id` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_day_mutations_date` ON `day_mutations` (`date`);--> statement-breakpoint
CREATE INDEX `idx_day_mutations_type` ON `day_mutations` (`mutation_type`);--> statement-breakpoint
CREATE INDEX `idx_day_mutations_date_type` ON `day_mutations` (`date`,`mutation_type`);