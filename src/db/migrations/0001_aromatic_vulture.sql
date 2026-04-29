CREATE TABLE `publishers` (
	`id` varchar(191) NOT NULL,
	`name` text NOT NULL,
	`reference` text NOT NULL,
	`author` text NOT NULL,
	CONSTRAINT `publishers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `books` (
	`id` varchar(191) NOT NULL,
	`title` text NOT NULL,
	`level` text NOT NULL,
	`type` text NOT NULL,
	`image` text,
	`isAvailable` boolean NOT NULL DEFAULT true,
	`price` int NOT NULL,
	`tags` json NOT NULL DEFAULT ('[]'),
	`publisherId` varchar(191) NOT NULL,
	`createdAt` timestamp NOT NULL,
	`updatedAt` timestamp NOT NULL,
	CONSTRAINT `books_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `books` ADD CONSTRAINT `books_publisherId_publishers_id_fk` FOREIGN KEY (`publisherId`) REFERENCES `publishers`(`id`) ON DELETE no action ON UPDATE no action;