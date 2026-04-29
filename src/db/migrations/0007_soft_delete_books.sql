SET @book_deleted_at_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'books'
    AND COLUMN_NAME = 'deletedAt'
);--> statement-breakpoint
SET @book_deleted_at_sql = IF(
  @book_deleted_at_exists = 0,
  'ALTER TABLE `books` ADD `deletedAt` timestamp;',
  'SELECT 1;'
);--> statement-breakpoint
PREPARE book_deleted_at_stmt FROM @book_deleted_at_sql;--> statement-breakpoint
EXECUTE book_deleted_at_stmt;--> statement-breakpoint
DEALLOCATE PREPARE book_deleted_at_stmt;--> statement-breakpoint