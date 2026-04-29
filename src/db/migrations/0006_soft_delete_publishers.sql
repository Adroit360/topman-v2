SET @publisher_deleted_at_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'publishers'
    AND COLUMN_NAME = 'deletedAt'
);--> statement-breakpoint
SET @publisher_deleted_at_sql = IF(
  @publisher_deleted_at_exists = 0,
  'ALTER TABLE `publishers` ADD `deletedAt` timestamp;',
  'SELECT 1;'
);--> statement-breakpoint
PREPARE publisher_deleted_at_stmt FROM @publisher_deleted_at_sql;--> statement-breakpoint
EXECUTE publisher_deleted_at_stmt;--> statement-breakpoint
DEALLOCATE PREPARE publisher_deleted_at_stmt;--> statement-breakpoint