ALTER TABLE `accounts` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `accounts` MODIFY COLUMN `accessTokenExpiresAt` timestamp(3);--> statement-breakpoint
ALTER TABLE `accounts` MODIFY COLUMN `refreshTokenExpiresAt` timestamp(3);--> statement-breakpoint
ALTER TABLE `accounts` MODIFY COLUMN `scope` text;--> statement-breakpoint
ALTER TABLE `accounts` MODIFY COLUMN `password` text;--> statement-breakpoint
ALTER TABLE `book_list_uploads` MODIFY COLUMN `blobName` text NOT NULL;--> statement-breakpoint
ALTER TABLE `book_list_uploads` MODIFY COLUMN `contentType` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `book_list_uploads` MODIFY COLUMN `status` varchar(32) NOT NULL DEFAULT 'submitted';--> statement-breakpoint
ALTER TABLE `books` MODIFY COLUMN `tags` json NOT NULL DEFAULT ('[]');--> statement-breakpoint
ALTER TABLE `sessions` MODIFY COLUMN `expiresAt` timestamp(3) NOT NULL;--> statement-breakpoint
ALTER TABLE `sessions` MODIFY COLUMN `token` varchar(191) NOT NULL;--> statement-breakpoint
ALTER TABLE `sessions` MODIFY COLUMN `ipAddress` text;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `email` varchar(191) NOT NULL;--> statement-breakpoint
ALTER TABLE `verifications` MODIFY COLUMN `identifier` varchar(191) NOT NULL;--> statement-breakpoint
ALTER TABLE `verifications` MODIFY COLUMN `value` text NOT NULL;--> statement-breakpoint
ALTER TABLE `verifications` MODIFY COLUMN `expiresAt` timestamp(3) NOT NULL;--> statement-breakpoint
ALTER TABLE `verifications` MODIFY COLUMN `createdAt` timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE `verifications` MODIFY COLUMN `updatedAt` timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE `accounts` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `book_list_uploads` ADD `notes` json DEFAULT ('[]') NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `role` int DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `accounts` (`userId`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `sessions` (`userId`);--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verifications` (`identifier`);