CREATE TABLE `accounts` (
	`id` varchar(191) NOT NULL,
	`accountId` varchar(255) NOT NULL,
	`providerId` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`idToken` text,
	`accessTokenExpiresAt` timestamp(3),
	`refreshTokenExpiresAt` timestamp(3),
	`scope` text,
	`password` text,
	`createdAt` timestamp NOT NULL,
	`updatedAt` timestamp NOT NULL,
	CONSTRAINT `accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(191) NOT NULL,
	`expiresAt` timestamp(3) NOT NULL,
	`token` varchar(191) NOT NULL,
	`ipAddress` text,
	`userAgent` text,
	`userId` varchar(191) NOT NULL,
	`createdAt` timestamp NOT NULL,
	`updatedAt` timestamp NOT NULL,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `sessions_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(191) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(191) NOT NULL,
	`emailVerified` boolean NOT NULL DEFAULT false,
	`image` text,
	`role` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL,
	`updatedAt` timestamp NOT NULL,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `verifications` (
	`id` varchar(191) NOT NULL,
	`identifier` varchar(191) NOT NULL,
	`value` text NOT NULL,
	`expiresAt` timestamp(3) NOT NULL,
	`createdAt` timestamp NOT NULL,
	`updatedAt` timestamp NOT NULL,
	CONSTRAINT `verifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `accounts` (`userId`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `sessions` (`userId`);--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verifications` (`identifier`);