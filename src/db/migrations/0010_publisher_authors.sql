CREATE TABLE IF NOT EXISTS `publisher_authors` (
	`id` varchar(191) NOT NULL,
	`publisherId` varchar(191) NOT NULL,
	`name` text NOT NULL,
	`deletedAt` timestamp,
	`createdAt` timestamp NOT NULL,
	`updatedAt` timestamp NOT NULL,
	CONSTRAINT `publisher_authors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `publisher_authors` ADD CONSTRAINT `publisher_authors_publisherId_publishers_id_fk` FOREIGN KEY (`publisherId`) REFERENCES `publishers`(`id`) ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `books` ADD `authorId` varchar(191);
--> statement-breakpoint
ALTER TABLE `books` ADD CONSTRAINT `books_authorId_publisher_authors_id_fk` FOREIGN KEY (`authorId`) REFERENCES `publisher_authors`(`id`) ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
INSERT INTO `publisher_authors` (`id`, `publisherId`, `name`, `deletedAt`, `createdAt`, `updatedAt`)
SELECT UUID(), `id`, COALESCE(NULLIF(TRIM(`author`), ''), 'Unknown'), `deletedAt`, NOW(), NOW()
FROM `publishers`
WHERE NOT EXISTS (
	SELECT 1
	FROM `publisher_authors`
	WHERE `publisher_authors`.`publisherId` = `publishers`.`id`
);
--> statement-breakpoint
UPDATE `books`
INNER JOIN `publisher_authors` ON `publisher_authors`.`publisherId` = `books`.`publisherId`
SET `books`.`authorId` = `publisher_authors`.`id`
WHERE `books`.`authorId` IS NULL;
