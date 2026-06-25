CREATE TABLE IF NOT EXISTS `payment_gateway_settings` (
	`id` varchar(191) NOT NULL,
	`gateway` varchar(32) NOT NULL DEFAULT 'paystack',
	`createdAt` timestamp NOT NULL,
	`updatedAt` timestamp NOT NULL,
	CONSTRAINT `payment_gateway_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
INSERT INTO `payment_gateway_settings` (`id`, `gateway`, `createdAt`, `updatedAt`)
SELECT 'default', 'paystack', NOW(), NOW()
WHERE NOT EXISTS (
	SELECT 1 FROM `payment_gateway_settings` WHERE `id` = 'default'
);
--> statement-breakpoint
ALTER TABLE `orders` ADD `paymentGateway` varchar(32) NOT NULL DEFAULT 'paystack';
--> statement-breakpoint
ALTER TABLE `order_payments` ADD `paymentGateway` varchar(32) NOT NULL DEFAULT 'paystack';
