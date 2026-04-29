import { count } from "drizzle-orm";
import process from "node:process";
import { client, db } from "../index";
import { book } from "../schema/book";
import { orderItems } from "../schema/order";
import { publisher } from "../schema/publisher";
import { chunkValues, normalizeCatalog } from "./normalizeCatalog";

const PUBLISHER_BATCH_SIZE = 100;
const BOOK_BATCH_SIZE = 200;
const WARNING_PREVIEW_LIMIT = 12;

const isDryRun = process.argv.includes("--dry-run");

const printWarnings = (
  warnings: Awaited<ReturnType<typeof normalizeCatalog>>["warnings"],
) => {
  if (warnings.length === 0) {
    return;
  }

  console.log(`Catalog normalization warnings: ${warnings.length}`);

  for (const warning of warnings.slice(0, WARNING_PREVIEW_LIMIT)) {
    console.log(`- ${warning.message}`);
  }

  if (warnings.length > WARNING_PREVIEW_LIMIT) {
    console.log(
      `- ...and ${warnings.length - WARNING_PREVIEW_LIMIT} more warnings`,
    );
  }
};

const getOrderItemCount = async () => {
  const [result] = await db.select({ value: count() }).from(orderItems);

  return result?.value ?? 0;
};

const seedCatalog = async () => {
  const orderItemCount = await getOrderItemCount();
  const catalog = await normalizeCatalog();

  printWarnings(catalog.warnings);

  console.log(
    JSON.stringify(
      {
        dryRun: isDryRun,
        publishers: catalog.publishers.length,
        books: catalog.books.length,
        skippedBooks: catalog.skippedBooks,
        orderItems: orderItemCount,
      },
      null,
      2,
    ),
  );

  if (orderItemCount > 0) {
    if (isDryRun) {
      console.log(
        "Dry run complete. The catalog reseed would fail until dependent order_items rows are cleared.",
      );
      return;
    }

    throw new Error(
      "Catalog reseed aborted because order_items contains records that reference books. Clear dependent order data first or use a non-destructive import strategy.",
    );
  }

  if (isDryRun) {
    console.log("Dry run complete. No database changes were made.");
    return;
  }

  await db.transaction(async (transaction) => {
    await transaction.delete(book);
    await transaction.delete(publisher);

    for (const publisherBatch of chunkValues(
      catalog.publishers,
      PUBLISHER_BATCH_SIZE,
    )) {
      await transaction.insert(publisher).values(
        publisherBatch.map((item) => ({
          id: item.id,
          name: item.name,
          reference: item.reference,
          author: item.author,
        })),
      );
    }

    for (const bookBatch of chunkValues(catalog.books, BOOK_BATCH_SIZE)) {
      await transaction.insert(book).values(
        bookBatch.map((item) => ({
          id: item.id,
          title: item.title,
          level: item.level,
          type: item.type,
          image: item.image,
          isAvailable: item.isAvailable,
          price: item.price,
          tags: item.tags,
          publisherId: item.publisherId,
        })),
      );
    }
  });

  console.log("Catalog seed completed successfully.");
};

seedCatalog()
  .catch((error) => {
    const message =
      error instanceof Error ? error.message : "Unknown catalog seed failure.";
    console.error(message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end();
  });
