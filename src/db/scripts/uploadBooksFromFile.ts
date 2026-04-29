import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { createId } from "@paralleldrive/cuid2";
import { fallbackLevelByType, titleOverrides } from "./catalogOverrides";
import { client, db } from "../index";
import { book } from "../schema/book";
import { publisher } from "../schema/publisher";
import {
  chunkValues,
  createBookImportTags,
  createUniqueSlug,
  getOptionValue,
  getPositionalArgs,
  hasFlag,
  loadJsonFile,
  resolveCatalogImportPath,
  slugify,
} from "./catalogImportUtils";
import {
  trimSourceBookLevel,
  trimSourceBookType,
} from "../../lib/book-taxonomy";
import { normalizeWhitespace } from "../../lib/book-tags";

type DatabaseClient =
  | typeof db
  | Parameters<Parameters<typeof db.transaction>[0]>[0];

const GENERAL_LEVEL = "general";
const GENERAL_TYPE = "general";
const BOOK_BATCH_SIZE = 200;
const WARNING_PREVIEW_LIMIT = 12;

type RawMongoId = {
  $oid: string;
};

type RawPublisherRecord = {
  _id?: RawMongoId;
  title?: string;
  name?: string;
};

type RawBookRecord = {
  _id?: RawMongoId;
  title?: string;
  level?: string;
  type?: string;
  image?: string | null;
  outStock?: boolean;
  price?: number;
  keywords?: unknown[];
  publisher?: string;
  publisherReference?: string;
  publisherName?: string;
  publisherAuthor?: string;
};

const levelAliases: Record<string, string> = {
  creche: "creche",
  jhs: "jhs",
  kg: "kg",
  kindergarten: "kg",
  nursery: "nursery",
  primary: "primary",
  shs: "shs",
};

const typeAliases: Record<string, string> = {
  literature: "literature",
  "past question": "past questions",
  "past questions": "past questions",
  practical: "practicals",
  practicals: "practicals",
  stationary: "stationery",
  stationery: "stationery",
  "story book": "story book",
  textbook: "textbook",
  workbook: "workbook",
};

const stationeryMarkers = [
  "book",
  "crayon",
  "colour",
  "color",
  "correction",
  "diary",
  "eraser",
  "exercise",
  "instrument",
  "marker",
  "note",
  "notebook",
  "pen",
  "pencil",
  "poster",
  "ruler",
  "sharpener",
];

const cliArgs = process.argv.slice(2);
const cliDryRun = hasFlag(cliArgs, "--dry-run");
const cliPublishersInputPath = getOptionValue(cliArgs, "--publishers");
const [cliBooksInputPath] = getPositionalArgs(cliArgs);

const toKeywordValues = (values: unknown[] | undefined) =>
  (values ?? []).map((value) => String(value ?? ""));

const toLookupTokens = (values: Array<string | number | null | undefined>) =>
  values
    .flatMap((value) =>
      String(value ?? "")
        .toLowerCase()
        .split(/[^a-z0-9]+/),
    )
    .map((value) => value.trim())
    .filter(Boolean);

const inferLevel = (values: Array<string | number | null | undefined>) => {
  const haystack = ` ${toLookupTokens(values).join(" ")} `;

  if (haystack.includes(" creche ")) {
    return "creche";
  }

  if (haystack.includes(" kindergarten ") || haystack.includes(" kg ")) {
    return "kg";
  }

  if (haystack.includes(" nursery ")) {
    return "nursery";
  }

  if (haystack.includes(" primary ")) {
    return "primary";
  }

  if (haystack.includes(" jhs ") || haystack.includes(" junior high ")) {
    return "jhs";
  }

  if (haystack.includes(" shs ") || haystack.includes(" senior high ")) {
    return "shs";
  }

  return GENERAL_LEVEL;
};

const inferType = (values: Array<string | number | null | undefined>) => {
  const haystack = ` ${toLookupTokens(values).join(" ")} `;

  if (haystack.includes(" workbook ") || haystack.includes(" wb ")) {
    return "workbook";
  }

  if (haystack.includes(" textbook ") || haystack.includes(" lb ")) {
    return "textbook";
  }

  if (haystack.includes(" literature ")) {
    return "literature";
  }

  if (
    haystack.includes(" past question ") ||
    haystack.includes(" past questions ")
  ) {
    return "past questions";
  }

  if (haystack.includes(" practical ")) {
    return "practicals";
  }

  if (haystack.includes(" story ")) {
    return "story book";
  }

  if (stationeryMarkers.some((marker) => haystack.includes(` ${marker} `))) {
    return "stationery";
  }

  return GENERAL_TYPE;
};

const getTitleOverride = (title: string) =>
  titleOverrides[normalizeWhitespace(title).toLowerCase()];

const normalizeBookType = (rawBook: RawBookRecord) => {
  const titleOverride = getTitleOverride(rawBook.title ?? "");

  if (titleOverride?.type) {
    return titleOverride.type;
  }

  const rawType = normalizeWhitespace(String(rawBook.type ?? "").toLowerCase());

  if (rawType && rawType !== "undefined" && typeAliases[rawType]) {
    return typeAliases[rawType];
  }

  return inferType([
    rawBook.type,
    rawBook.title,
    ...toKeywordValues(rawBook.keywords),
  ]);
};

const normalizeBookLevel = (rawBook: RawBookRecord, normalizedType: string) => {
  const titleOverride = getTitleOverride(rawBook.title ?? "");

  if (titleOverride?.level) {
    return titleOverride.level;
  }

  const rawLevel = normalizeWhitespace(
    String(rawBook.level ?? "").toLowerCase(),
  );

  if (rawLevel && rawLevel !== "undefined" && levelAliases[rawLevel]) {
    return levelAliases[rawLevel];
  }

  const inferredLevel = inferLevel([
    rawBook.level,
    rawBook.title,
    ...toKeywordValues(rawBook.keywords),
  ]);

  if (inferredLevel === GENERAL_LEVEL && fallbackLevelByType[normalizedType]) {
    return fallbackLevelByType[normalizedType];
  }

  return inferredLevel;
};

const normalizeImageBasename = (image: string | null | undefined) => {
  const normalizedImage = normalizeWhitespace(image ?? "");

  if (!normalizedImage) {
    return "__no-image__";
  }

  return (
    path.posix.basename(normalizedImage.replace(/\\/g, "/")).toLowerCase() ||
    "__no-image__"
  );
};

const normalizeDuplicateKey = (
  title: string,
  publisherId: string,
  image: string | null | undefined,
) =>
  [
    normalizeWhitespace(title).toLowerCase(),
    publisherId,
    normalizeImageBasename(image),
  ].join("::");

const printWarnings = (warnings: string[]) => {
  if (warnings.length === 0) {
    return;
  }

  console.log(`Book import warnings: ${warnings.length}`);

  for (const warning of warnings.slice(0, WARNING_PREVIEW_LIMIT)) {
    console.log(`- ${warning}`);
  }

  if (warnings.length > WARNING_PREVIEW_LIMIT) {
    console.log(
      `- ...and ${warnings.length - WARNING_PREVIEW_LIMIT} more warnings`,
    );
  }
};

const buildSourcePublisherLookup = (rawPublishers: RawPublisherRecord[]) => {
  const usedReferences = new Set<string>();
  const lookup = new Map<
    string,
    {
      name: string;
      baseReference: string;
      reference: string;
    }
  >();

  for (const rawPublisher of rawPublishers) {
    const sourcePublisherId = rawPublisher._id?.$oid;
    const name = normalizeWhitespace(
      rawPublisher.title ?? rawPublisher.name ?? "",
    );

    if (!sourcePublisherId || !name) {
      continue;
    }

    const baseReference = slugify(name);
    const reference = createUniqueSlug(baseReference, usedReferences);
    usedReferences.add(reference);

    lookup.set(sourcePublisherId, {
      name,
      baseReference,
      reference,
    });
  }

  return lookup;
};

const hasFlatPublisherReference = (rawBook: RawBookRecord) =>
  Boolean(normalizeWhitespace(rawBook.publisherReference ?? ""));

const resolveBookTaxonomy = (rawBook: RawBookRecord) => {
  if (hasFlatPublisherReference(rawBook)) {
    const type = trimSourceBookType(rawBook.type);
    const level = trimSourceBookLevel(rawBook.level);

    if (!type || !level) {
      return {
        kind: "invalid-flat-taxonomy" as const,
        message: "it is missing a source type or level value.",
      };
    }

    return {
      kind: "matched" as const,
      type,
      level,
    };
  }

  const type = normalizeBookType(rawBook);
  const level = normalizeBookLevel(rawBook, type);

  return {
    kind: "matched" as const,
    type,
    level,
  };
};

const resolveBookPublisher = ({
  rawBook,
  dbPublisherIdByReference,
  sourcePublisherLookup,
}: {
  rawBook: RawBookRecord;
  dbPublisherIdByReference: Map<string, string>;
  sourcePublisherLookup: Map<
    string,
    {
      name: string;
      baseReference: string;
      reference: string;
    }
  >;
}) => {
  const flatPublisherReference = normalizeWhitespace(
    rawBook.publisherReference ?? "",
  );
  const flatPublisherName = normalizeWhitespace(rawBook.publisherName ?? "");

  if (flatPublisherReference) {
    const publisherId = dbPublisherIdByReference.get(flatPublisherReference);

    if (!publisherId) {
      return {
        kind: "missing-db-publisher" as const,
        message: `Skipped because publisher reference ${flatPublisherReference} was not found in the database.`,
      };
    }

    return {
      kind: "matched" as const,
      publisherId,
      publisherName:
        flatPublisherName || normalizeWhitespace(rawBook.publisherAuthor ?? ""),
    };
  }

  const sourcePublisherId = rawBook.publisher?.trim();

  if (!sourcePublisherId) {
    return {
      kind: "missing-source-publisher" as const,
      message: "Skipped because it has no publisher reference.",
    };
  }

  const sourcePublisher = sourcePublisherLookup.get(sourcePublisherId);

  if (!sourcePublisher) {
    return {
      kind: "missing-source-publishers-file-match" as const,
      message: `Skipped because source publisher ${sourcePublisherId} was not found in the publishers file.`,
    };
  }

  const publisherId =
    dbPublisherIdByReference.get(sourcePublisher.reference) ??
    dbPublisherIdByReference.get(sourcePublisher.baseReference);

  if (!publisherId) {
    return {
      kind: "missing-db-publisher" as const,
      message: `Skipped because publisher reference ${sourcePublisher.reference} was not found in the database.`,
    };
  }

  return {
    kind: "matched" as const,
    publisherId,
    publisherName: sourcePublisher.name,
  };
};

export type UploadBooksFromFileOptions = {
  booksInputPath?: string;
  publishersInputPath?: string;
  dryRun?: boolean;
  ignoreExistingBooks?: boolean;
  database?: DatabaseClient;
};

export const uploadBooksFromFile = async ({
  booksInputPath,
  publishersInputPath,
  dryRun = false,
  ignoreExistingBooks = false,
  database = db,
}: UploadBooksFromFileOptions = {}) => {
  const booksFilePath = resolveCatalogImportPath("books.json", booksInputPath);
  const publishersFilePath = resolveCatalogImportPath(
    "publishers.json",
    publishersInputPath,
  );
  const [rawBooks, dbPublishers, existingBooks] = await Promise.all([
    loadJsonFile<RawBookRecord[]>(booksFilePath),
    database
      .select({ id: publisher.id, reference: publisher.reference })
      .from(publisher),
    ignoreExistingBooks
      ? Promise.resolve([])
      : database
          .select({
            title: book.title,
            publisherId: book.publisherId,
            image: book.image,
          })
          .from(book),
  ]);
  const needsLegacyPublisherLookup = rawBooks.some(
    (rawBook) => !hasFlatPublisherReference(rawBook),
  );
  const rawPublishers = needsLegacyPublisherLookup
    ? await loadJsonFile<RawPublisherRecord[]>(publishersFilePath)
    : [];

  const dbPublisherIdByReference = new Map(
    dbPublishers.map((item) => [item.reference, item.id]),
  );
  const sourcePublisherLookup = buildSourcePublisherLookup(rawPublishers);
  const existingBookKeys = new Set(
    existingBooks.map((item) =>
      normalizeDuplicateKey(item.title, item.publisherId, item.image),
    ),
  );
  const booksToInsert: Array<{
    id: string;
    title: string;
    level: string;
    type: string;
    image: string | null;
    isAvailable: boolean;
    price: number;
    tags: string[];
    publisherId: string;
  }> = [];
  const warnings: string[] = [];

  let skippedExistingRows = 0;
  let skippedInvalidRows = 0;
  let skippedMissingPublisherRows = 0;

  for (const rawBook of rawBooks) {
    const title = normalizeWhitespace(rawBook.title ?? "");

    if (
      !title ||
      typeof rawBook.price !== "number" ||
      Number.isNaN(rawBook.price)
    ) {
      skippedInvalidRows += 1;
      warnings.push(
        title
          ? `Skipped "${title}" because required title or price data was invalid.`
          : "Skipped a book without a valid title or price.",
      );
      continue;
    }

    const publisherResolution = resolveBookPublisher({
      rawBook,
      dbPublisherIdByReference,
      sourcePublisherLookup,
    });

    if (publisherResolution.kind !== "matched") {
      skippedMissingPublisherRows += 1;
      warnings.push(
        `Skipped "${title}" because ${publisherResolution.message}`,
      );
      continue;
    }

    const { publisherId, publisherName } = publisherResolution;

    const taxonomyResolution = resolveBookTaxonomy(rawBook);

    if (taxonomyResolution.kind !== "matched") {
      skippedInvalidRows += 1;
      warnings.push(`Skipped "${title}" because ${taxonomyResolution.message}`);
      continue;
    }

    const normalizedType = taxonomyResolution.type;
    const normalizedLevel = taxonomyResolution.level;
    const duplicateKey = normalizeDuplicateKey(
      title,
      publisherId,
      rawBook.image,
    );

    if (existingBookKeys.has(duplicateKey)) {
      skippedExistingRows += 1;
      continue;
    }

    existingBookKeys.add(duplicateKey);
    booksToInsert.push({
      id: createId(),
      title,
      level: normalizedLevel,
      type: normalizedType,
      image: rawBook.image ? normalizeWhitespace(rawBook.image) : null,
      isAvailable: !rawBook.outStock,
      price: Math.round(rawBook.price),
      tags: createBookImportTags(
        title,
        publisherName,
        normalizedLevel,
        normalizedType,
      ),
      publisherId,
    });
  }

  if (!dryRun) {
    for (const bookBatch of chunkValues(booksToInsert, BOOK_BATCH_SIZE)) {
      await database.insert(book).values(bookBatch);
    }
  }

  printWarnings(warnings);
  console.log(
    JSON.stringify(
      {
        booksFilePath,
        publishersFilePath: needsLegacyPublisherLookup
          ? publishersFilePath
          : null,
        totalRows: rawBooks.length,
        insertedRows: booksToInsert.length,
        skippedExistingRows,
        skippedInvalidRows,
        skippedMissingPublisherRows,
        warningCount: warnings.length,
        dryRun,
      },
      null,
      2,
    ),
  );

  if (dryRun) {
    console.log("Dry run complete. No book rows were inserted.");
    return;
  }

  console.log("Book import completed successfully.");
};

const isDirectExecution =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) ===
    path.resolve(fileURLToPath(import.meta.url));

if (isDirectExecution) {
  uploadBooksFromFile({
    booksInputPath: cliBooksInputPath,
    publishersInputPath: cliPublishersInputPath,
    dryRun: cliDryRun,
  })
    .catch((error) => {
      const message =
        error instanceof Error ? error.message : "Unknown book import failure.";
      console.error(message);
      process.exitCode = 1;
    })
    .finally(async () => {
      await client.end();
    });
}
