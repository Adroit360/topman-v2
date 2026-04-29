CREATE TABLE `orders` (
	`id` varchar(191) NOT NULL,
	`name` varchar(255) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`total` int NOT NULL,
	`deliverCost` int NOT NULL,
	`phone` varchar(20) NOT NULL,
	`deliveryAddress` varchar(255) NOT NULL,
	`deliveryStatus` int NOT NULL DEFAULT 0,
	`deliveryCost` int NOT NULL,
	`serialNumber` int AUTO_INCREMENT NOT NULL,
	`paymentStatus` int NOT NULL DEFAULT 0,
	`paymentReference` varchar(255),
	`datePaid` varchar(255),
	`ipAddress` varchar(255),
	`createdAt` timestamp NOT NULL,
	`updatedAt` timestamp NOT NULL,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_serialNumber_unique` UNIQUE(`serialNumber`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` varchar(191) NOT NULL,
	`quantity` int NOT NULL,
	`bookId` varchar(191) NOT NULL,
	`orderId` varchar(191) NOT NULL,
	`createdAt` timestamp NOT NULL,
	`updatedAt` timestamp NOT NULL,
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_payments` (
	`id` varchar(191) NOT NULL,
	`reference` varchar(255) NOT NULL,
	`orderId` varchar(191) NOT NULL,
	`createdAt` timestamp NOT NULL,
	`updatedAt` timestamp NOT NULL,
	CONSTRAINT `order_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_bookId_books_id_fk` FOREIGN KEY (`bookId`) REFERENCES `books`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_payments` ADD CONSTRAINT `order_payments_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;