import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import {
  hasFlag,
  getPositionalArgs,
  loadJsonFile,
  slugify,
} from "./catalogImportUtils";
import { normalizeWhitespace } from "../../lib/book-tags";

const DEFAULT_INPUT_PATH = path.resolve(process.cwd(), "list.csv");
const DEFAULT_PUBLISHERS_PATH = path.resolve(
  process.cwd(),
  "data/catalog/publishers-from-list.json",
);
const DEFAULT_OUTPUT_PATH = path.resolve(
  process.cwd(),
  "data/catalog/books-from-list.json",
);
const WARNING_PREVIEW_LIMIT = 12;

type CsvBookRow = {
  title: string;
  type: string;
  level: string;
  publisher: string;
  price: string;
  image: string;
};

type PublisherExportRow = {
  name: string;
  reference: string;
  author: string;
};

type BookExportRow = {
  title: string;
  type: string;
  level: string;
  price: number;
  image: string | null;
  publisherReference: string;
  publisherName: string;
  publisherAuthor: string;
};

const normalizePublisherName = (value: string) =>
  normalizeWhitespace(value.replace(/[\s,]+$/g, ""));

const normalizeHeaderName = (value: string) =>
  normalizeWhitespace(value).toLowerCase();

const parseCsvLine = (line: string) => {
  const cells: string[] = [];
  let currentCell = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"') {
      if (insideQuotes && nextCharacter === '"') {
        currentCell += '"';
        index += 1;
        continue;
      }

      insideQuotes = !insideQuotes;
      continue;
    }

    if (character === "," && !insideQuotes) {
      cells.push(currentCell);
      currentCell = "";
      continue;
    }

    currentCell += character;
  }

  cells.push(currentCell);

  return cells.map((cell) => cell.trim());
};

const requireColumn = (headers: string[], columnName: string) => {
  const columnIndex = headers.findIndex(
    (header) => normalizeHeaderName(header) === normalizeHeaderName(columnName),
  );

  if (columnIndex === -1) {
    throw new Error(`CSV file is missing a ${columnName} column.`);
  }

  return columnIndex;
};

const parseBookRows = (csvContents: string): CsvBookRow[] => {
  const lines = csvContents
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [];
  }

  const [headerLine, ...dataLines] = lines;
  const headers = parseCsvLine(headerLine);
  const titleColumnIndex = requireColumn(headers, "Title");
  const typeColumnIndex = requireColumn(headers, "Type");
  const levelColumnIndex = requireColumn(headers, "Level");
  const publisherColumnIndex = requireColumn(headers, "Publisher");
  const priceColumnIndex = requireColumn(headers, "Price(GHC)");
  const imageColumnIndex = requireColumn(headers, "Image");

  return dataLines.map((line) => {
    const cells = parseCsvLine(line);

    return {
      title: cells[titleColumnIndex] ?? "",
      type: cells[typeColumnIndex] ?? "",
      level: cells[levelColumnIndex] ?? "",
      publisher: cells[publisherColumnIndex] ?? "",
      price: cells[priceColumnIndex] ?? "",
      image: cells[imageColumnIndex] ?? "",
    };
  });
};

const normalizeImageFileName = (value: string) => {
  const normalizedValue = normalizeWhitespace(value);

  if (!normalizedValue) {
    return null;
  }

  const fileName = path.posix.basename(normalizedValue.replace(/\\/g, "/"));
  const normalizedFileName = normalizeWhitespace(fileName);

  if (!normalizedFileName) {
    return null;
  }

  return /\.jpg$/i.test(normalizedFileName)
    ? normalizedFileName
    : `${normalizedFileName}.jpg`;
};

const parsePrice = (value: string) => {
  const normalizedValue = normalizeWhitespace(value).replace(/,/g, "");

  if (!normalizedValue) {
    return null;
  }

  const parsedValue = Number(normalizedValue);

  if (!Number.isFinite(parsedValue)) {
    return null;
  }

  return Math.round(parsedValue);
};

const printWarnings = (warnings: string[]) => {
  if (warnings.length === 0) {
    return;
  }

  console.log(`Books export warnings: ${warnings.length}`);

  for (const warning of warnings.slice(0, WARNING_PREVIEW_LIMIT)) {
    console.log(`- ${warning}`);
  }

  if (warnings.length > WARNING_PREVIEW_LIMIT) {
    console.log(
      `- ...and ${warnings.length - WARNING_PREVIEW_LIMIT} more warnings`,
    );
  }
};

const buildBookExportRows = (
  rows: CsvBookRow[],
  publishers: PublisherExportRow[],
) => {
  const publisherByReference = new Map(
    publishers.map((publisher) => [publisher.reference, publisher]),
  );
  const exportRows: BookExportRow[] = [];
  const warnings: string[] = [];

  let skippedInvalidRows = 0;
  let skippedMissingPublisherRows = 0;

  for (const row of rows) {
    const title = normalizeWhitespace(row.title);
    const type = normalizeWhitespace(row.type);
    const level = normalizeWhitespace(row.level);
    const publisherName = normalizePublisherName(row.publisher);
    const price = parsePrice(row.price);

    if (!title || !type || !level || price === null) {
      skippedInvalidRows += 1;
      warnings.push(
        title
          ? `Skipped "${title}" because title, type, level, or price was invalid.`
          : "Skipped a book row with missing title, type, level, or price.",
      );
      continue;
    }

    if (!publisherName) {
      skippedMissingPublisherRows += 1;
      warnings.push(`Skipped "${title}" because it has no publisher.`);
      continue;
    }

    const publisherReference = slugify(publisherName);
    const matchedPublisher = publisherByReference.get(publisherReference);

    if (!matchedPublisher) {
      skippedMissingPublisherRows += 1;
      warnings.push(
        `Skipped "${title}" because publisher reference ${publisherReference} was not found in the generated publishers list.`,
      );
      continue;
    }

    exportRows.push({
      title,
      type,
      level,
      price,
      image: normalizeImageFileName(row.image),
      publisherReference: matchedPublisher.reference,
      publisherName: matchedPublisher.name,
      publisherAuthor: matchedPublisher.author,
    });
  }

  exportRows.sort((left, right) => {
    const titleComparison = left.title.localeCompare(right.title);

    if (titleComparison !== 0) {
      return titleComparison;
    }

    const publisherComparison = left.publisherReference.localeCompare(
      right.publisherReference,
    );

    if (publisherComparison !== 0) {
      return publisherComparison;
    }

    const typeComparison = left.type.localeCompare(right.type);

    if (typeComparison !== 0) {
      return typeComparison;
    }

    return left.level.localeCompare(right.level);
  });

  return {
    exportRows,
    warnings,
    skippedInvalidRows,
    skippedMissingPublisherRows,
  };
};

const cliArgs = process.argv.slice(2);
const isDryRun = hasFlag(cliArgs, "--dry-run");
const [inputPath, outputPath, publishersPath] = getPositionalArgs(cliArgs);

const exportBooksFromCsv = async () => {
  const resolvedInputPath = path.resolve(
    process.cwd(),
    inputPath ?? DEFAULT_INPUT_PATH,
  );
  const resolvedOutputPath = path.resolve(
    process.cwd(),
    outputPath ?? DEFAULT_OUTPUT_PATH,
  );
  const resolvedPublishersPath = path.resolve(
    process.cwd(),
    publishersPath ?? DEFAULT_PUBLISHERS_PATH,
  );
  const [csvContents, publishers] = await Promise.all([
    readFile(resolvedInputPath, "utf8"),
    loadJsonFile<PublisherExportRow[]>(resolvedPublishersPath),
  ]);
  const bookRows = parseBookRows(csvContents);
  const {
    exportRows,
    warnings,
    skippedInvalidRows,
    skippedMissingPublisherRows,
  } = buildBookExportRows(bookRows, publishers);

  if (!isDryRun) {
    await writeFile(
      resolvedOutputPath,
      `${JSON.stringify(exportRows, null, 2)}\n`,
    );
  }

  printWarnings(warnings);
  console.log(
    JSON.stringify(
      {
        inputPath: resolvedInputPath,
        publishersPath: resolvedPublishersPath,
        outputPath: resolvedOutputPath,
        totalCsvRows: bookRows.length,
        exportedBookCount: exportRows.length,
        skippedInvalidRows,
        skippedMissingPublisherRows,
        warningCount: warnings.length,
        dryRun: isDryRun,
      },
      null,
      2,
    ),
  );

  if (isDryRun) {
    console.log("Dry run complete. No books JSON file was written.");
    return;
  }

  console.log("Books JSON export completed successfully.");
};

exportBooksFromCsv().catch((error) => {
  const message =
    error instanceof Error
      ? error.message
      : "Unknown CSV books export failure.";
  console.error(message);
  process.exitCode = 1;
});
