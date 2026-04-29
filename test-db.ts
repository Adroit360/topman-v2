import { loadEnvConfig } from "@next/env";
import mysql from "mysql2/promise";

loadEnvConfig(process.cwd());

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL not found");
    return;
  }
  const connection = await mysql.createConnection(url);
  try {
    console.log("--- TABLE: publishers ---");
    const [columns] = await connection.query("DESCRIBE publishers");
    console.log(JSON.stringify(columns, null, 2));

    console.log("--- TABLE: __drizzle_migrations ---");
    const [migrations] = await connection.query(
      "SELECT * FROM __drizzle_migrations",
    );
    console.log(JSON.stringify(migrations, null, 2));

    console.log("--- ATTEMPTING MIGRATION 0006 CORE SQL ---");

    await connection.query(
      "SET @publisher_deleted_at_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'publishers' AND COLUMN_NAME = 'deletedAt')",
    );
    const [result]: any = await connection.query(
      "SELECT @publisher_deleted_at_exists as existsFlag",
    );
    console.log("Exists Flag:", result[0].existsFlag);

    await connection.query(
      "SET @publisher_deleted_at_sql = IF(@publisher_deleted_at_exists = 0, 'ALTER TABLE `publishers` ADD `deletedAt` timestamp;', 'SELECT 1;')",
    );
    await connection.query(
      "PREPARE publisher_deleted_at_stmt FROM @publisher_deleted_at_sql",
    );
    try {
      await connection.query("EXECUTE publisher_deleted_at_stmt");
      console.log("Execute successful");
    } catch (e) {
      console.error("Execute failed:", e);
    }
    await connection.query("DEALLOCATE PREPARE publisher_deleted_at_stmt");
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

main();
