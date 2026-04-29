import { eq, inArray } from "drizzle-orm";
import path from "node:path";
import process from "node:process";
import { client, db } from "../index";
import { book } from "../schema/book";
import { chunkValues } from "./catalogImportUtils";

const BOOK_IMAGE_PREFIX =
  "https://topman.blob.core.windows.net/books/book-covers/";
const BOOK_BATCH_SIZE = 200;
const isDryRun = process.argv.includes("--dry-run");

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

const toBlobImageUrl = (image: string) => {
  const trimmedImage = image.trim();

  if (!trimmedImage) {
    return null;
  }

  if (isAbsoluteUrl(trimmedImage)) {
    return trimmedImage;
  }

  const imageBasename = path.posix.basename(trimmedImage.replace(/\\/g, "/"));

  if (!imageBasename) {
    return null;
  }

  return `${BOOK_IMAGE_PREFIX}${imageBasename}`;
};

const updateBookImageUrls = async () => {
  const rows = await db.select({ id: book.id, image: book.image }).from(book);

  let alreadyPrefixed = 0;
  let emptyOrNull = 0;

  const rowsToUpdate = rows.flatMap((row) => {
    if (!row.image || !row.image.trim()) {
      emptyOrNull += 1;
      return [];
    }

    if (isAbsoluteUrl(row.image)) {
      alreadyPrefixed += 1;
      return [];
    }

    const nextImageUrl = toBlobImageUrl(row.image);

    if (!nextImageUrl || nextImageUrl === row.image) {
      emptyOrNull += 1;
      return [];
    }

    return [
      {
        id: row.id,
        image: nextImageUrl,
      },
    ];
  });

  console.log(
    JSON.stringify(
      {
        totalRows: rows.length,
        wouldUpdate: rowsToUpdate.length,
        alreadyPrefixed,
        emptyOrNull,
        dryRun: isDryRun,
        prefix: BOOK_IMAGE_PREFIX,
      },
      null,
      2,
    ),
  );

  if (isDryRun) {
    console.log("Dry run complete. No image rows were updated.");
    return;
  }

  await db.transaction(async (transaction) => {
    for (const batch of chunkValues(rowsToUpdate, BOOK_BATCH_SIZE)) {
      await Promise.all(
        batch.map((row) =>
          transaction
            .update(book)
            .set({ image: row.image })
            .where(eq(book.id, row.id)),
        ),
      );
    }
  });

  console.log("Book image URL update completed successfully.");
};

updateBookImageUrls()
  .catch((error) => {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown book image URL update failure.";
    console.error(message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end();
  });
