ALTER TABLE `orders` MODIFY COLUMN `userId` varchar(191);--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `total` decimal(10,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `email` varchar(191) NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `processingFee` decimal(10,2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `notes` text;