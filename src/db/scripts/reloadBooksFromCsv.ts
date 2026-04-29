import { count } from "drizzle-orm";
import process from "node:process";
import { client, db } from "../index";
import { book, order, orderItems, orderPayment } from "../schema";
import {
  getPositionalArgs,
  hasFlag,
  loadJsonFile,
  resolveCatalogImportPath,
} from "./catalogImportUtils";
import { uploadBooksFromFile } from "./uploadBooksFromFile";

const cliArgs = process.argv.slice(2);
const isDryRun = hasFlag(cliArgs, "--dry-run");
const [booksInputPath] = getPositionalArgs(cliArgs);

const getTableCount = async (
  table: typeof book | typeof order | typeof orderItems | typeof orderPayment,
) => {
  const [result] = await db.select({ value: count() }).from(table);

  return result?.value ?? 0;
};

const reloadBooksFromCsv = async () => {
  const booksFilePath = resolveCatalogImportPath(
    "books-from-list.json",
    booksInputPath,
  );
  const [
    sourceBooks,
    existingBooks,
    existingOrders,
    existingOrderItems,
    existingOrderPayments,
  ] = await Promise.all([
    loadJsonFile<unknown[]>(booksFilePath),
    getTableCount(book),
    getTableCount(order),
    getTableCount(orderItems),
    getTableCount(orderPayment),
  ]);

  console.log(
    JSON.stringify(
      {
        booksFilePath,
        sourceRows: sourceBooks.length,
        deletePlan: {
          orderPayments: existingOrderPayments,
          orderItems: existingOrderItems,
          orders: existingOrders,
          books: existingBooks,
        },
        dryRun: isDryRun,
      },
      null,
      2,
    ),
  );

  if (isDryRun) {
    await uploadBooksFromFile({
      booksInputPath: booksFilePath,
      dryRun: true,
      ignoreExistingBooks: true,
    });
    console.log(
      "Dry run complete. No rows were deleted and no books were reloaded.",
    );
    return;
  }

  await db.transaction(async (transaction) => {
    await transaction.delete(orderPayment);
    await transaction.delete(orderItems);
    await transaction.delete(order);
    await transaction.delete(book);

    await uploadBooksFromFile({
      booksInputPath: booksFilePath,
      dryRun: false,
      ignoreExistingBooks: true,
      database: transaction,
    });
  });

  console.log("CSV book reload completed successfully.");
};

reloadBooksFromCsv()
  .catch((error) => {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown CSV book reload failure.";
    console.error(message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end();
  });
