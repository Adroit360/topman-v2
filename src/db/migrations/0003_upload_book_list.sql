CREATE TABLE `book_list_uploads` (
	`id` varchar(191) NOT NULL,
	`name` varchar(255) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`location` varchar(255) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`blobName` text NOT NULL,
	`blobUrl` text NOT NULL,
	`contentType` varchar(100) NOT NULL,
	`fileSize` int NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'submitted',
	`createdAt` timestamp NOT NULL,
	`updatedAt` timestamp NOT NULL,
	CONSTRAINT `book_list_uploads_id` PRIMARY KEY(`id`)
);