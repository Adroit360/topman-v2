import process from "node:process";
import { client, db } from "../index";
import { publisher } from "../schema/publisher";
import {
  createUniqueSlug,
  getPositionalArgs,
  hasFlag,
  loadJsonFile,
  resolveCatalogImportPath,
  slugify,
} from "./catalogImportUtils";
import { normalizeWhitespace } from "../../lib/book-tags";

const UNKNOWN_AUTHOR = "Unknown";

type RawPublisherRecord = {
  _id?: { $oid: string };
  title?: string;
  name?: string;
  reference?: string;
  author?: string | null;
};

const PUBLISHER_BATCH_SIZE = 100;

const cliArgs = process.argv.slice(2);
const isDryRun = hasFlag(cliArgs, "--dry-run");
const [inputPath] = getPositionalArgs(cliArgs);

const printSummary = (summary: {
  filePath: string;
  totalRows: number;
  insertedRows: number;
  skippedExistingRows: number;
  skippedInvalidRows: number;
  adjustedReferenceRows: number;
  dryRun: boolean;
}) => {
  console.log(
    JSON.stringify(
      {
        ...summary,
      },
      null,
      2,
    ),
  );
};

const uploadPublishersFromFile = async () => {
  const filePath = resolveCatalogImportPath("publishers.json", inputPath);
  const rawPublishers = await loadJsonFile<RawPublisherRecord[]>(filePath);
  const existingPublishers = await db
    .select({ reference: publisher.reference })
    .from(publisher);

  const existingReferences = new Set(
    existingPublishers.map((item) => item.reference),
  );
  const usedReferences = new Set(existingReferences);
  const publishersToInsert: Array<{
    name: string;
    reference: string;
    author: string;
  }> = [];

  let skippedExistingRows = 0;
  let skippedInvalidRows = 0;
  let adjustedReferenceRows = 0;

  for (const rawPublisher of rawPublishers) {
    const name = normalizeWhitespace(
      rawPublisher.title ?? rawPublisher.name ?? "",
    );

    if (!name) {
      skippedInvalidRows += 1;
      continue;
    }

    const requestedReference = normalizeWhitespace(
      rawPublisher.reference ?? "",
    );
    const baseReference = requestedReference || slugify(name);

    if (existingReferences.has(baseReference)) {
      skippedExistingRows += 1;
      continue;
    }

    const reference = createUniqueSlug(baseReference, usedReferences);
    usedReferences.add(reference);

    if (reference !== baseReference) {
      adjustedReferenceRows += 1;
    }

    publishersToInsert.push({
      name,
      reference,
      author: normalizeWhitespace(rawPublisher.author ?? "") || UNKNOWN_AUTHOR,
    });
  }

  if (!isDryRun) {
    for (
      let index = 0;
      index < publishersToInsert.length;
      index += PUBLISHER_BATCH_SIZE
    ) {
      await db
        .insert(publisher)
        .values(publishersToInsert.slice(index, index + PUBLISHER_BATCH_SIZE));
    }
  }

  printSummary({
    filePath,
    totalRows: rawPublishers.length,
    insertedRows: publishersToInsert.length,
    skippedExistingRows,
    skippedInvalidRows,
    adjustedReferenceRows,
    dryRun: isDryRun,
  });

  if (isDryRun) {
    console.log("Dry run complete. No publisher rows were inserted.");
    return;
  }

  console.log("Publisher import completed successfully.");
};

uploadPublishersFromFile()
  .catch((error) => {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown publisher import failure.";
    console.error(message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end();
  });
