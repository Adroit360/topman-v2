SET @orders_deliver_cost_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'orders'
        AND COLUMN_NAME = 'deliverCost'
);--> statement-breakpoint
SET @orders_drop_deliver_cost_sql = IF(
    @orders_deliver_cost_exists = 1,
    'ALTER TABLE `orders` DROP COLUMN `deliverCost`;',
    'SELECT 1;'
);--> statement-breakpoint
PREPARE orders_drop_deliver_cost_stmt FROM @orders_drop_deliver_cost_sql;--> statement-breakpoint
EXECUTE orders_drop_deliver_cost_stmt;--> statement-breakpoint
DEALLOCATE PREPARE orders_drop_deliver_cost_stmt;--> statement-breakpoint
SET @orders_admin_notes_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'orders'
        AND COLUMN_NAME = 'adminNotes'
);--> statement-breakpoint
SET @orders_add_admin_notes_sql = IF(
    @orders_admin_notes_exists = 0,
    'ALTER TABLE `orders` ADD `adminNotes` text;',
    'SELECT 1;'
);--> statement-breakpoint
PREPARE orders_add_admin_notes_stmt FROM @orders_add_admin_notes_sql;--> statement-breakpoint
EXECUTE orders_add_admin_notes_stmt;--> statement-breakpoint
DEALLOCATE PREPARE orders_add_admin_notes_stmt;
