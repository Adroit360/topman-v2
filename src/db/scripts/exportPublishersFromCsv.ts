import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { hasFlag, getPositionalArgs, slugify } from "./catalogImportUtils";
import { normalizeWhitespace } from "../../lib/book-tags";

const DEFAULT_INPUT_PATH = path.resolve(process.cwd(), "list.csv");
const DEFAULT_OUTPUT_PATH = path.resolve(
  process.cwd(),
  "data/catalog/publishers-from-list.json",
);
const OTHERS_PUBLISHER_NAME = "Others";

type CsvPublisherRow = {
  publisher: string;
};

type PublisherExportRow = {
  name: string;
  reference: string;
  author: string;
};

const normalizePublisherName = (value: string) =>
  normalizeWhitespace(value.replace(/[\s,]+$/g, ""));

const normalizePublisherKey = (value: string) =>
  normalizePublisherName(value).toLowerCase();

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

const parsePublisherRows = (csvContents: string): CsvPublisherRow[] => {
  const lines = csvContents
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [];
  }

  const [headerLine, ...dataLines] = lines;
  const headers = parseCsvLine(headerLine);
  const publisherColumnIndex = headers.findIndex(
    (header) => normalizeWhitespace(header).toLowerCase() === "publisher",
  );

  if (publisherColumnIndex === -1) {
    throw new Error("CSV file is missing a Publisher column.");
  }

  return dataLines.map((line) => {
    const cells = parseCsvLine(line);

    return {
      publisher: cells[publisherColumnIndex] ?? "",
    };
  });
};

const buildPublisherExportRows = (rows: CsvPublisherRow[]) => {
  const publisherCounts = new Map<
    string,
    {
      publisherName: string;
      count: number;
    }
  >();

  for (const row of rows) {
    const publisherName = normalizePublisherName(row.publisher);

    if (!publisherName) {
      continue;
    }

    const publisherKey = normalizePublisherKey(publisherName);
    const existingPublisher = publisherCounts.get(publisherKey);

    if (!existingPublisher) {
      publisherCounts.set(publisherKey, {
        publisherName,
        count: 1,
      });
      continue;
    }

    existingPublisher.count += 1;
  }

  const exportRows = [...publisherCounts.values()]
    .sort((left, right) =>
      normalizePublisherKey(left.publisherName).localeCompare(
        normalizePublisherKey(right.publisherName),
      ),
    )
    .map<PublisherExportRow>(({ publisherName, count }) => ({
      name: count > 2 ? publisherName : OTHERS_PUBLISHER_NAME,
      reference: slugify(publisherName),
      author: publisherName,
    }));

  return {
    exportRows,
    uniquePublisherCount: publisherCounts.size,
  };
};

const cliArgs = process.argv.slice(2);
const isDryRun = hasFlag(cliArgs, "--dry-run");
const [inputPath, outputPath] = getPositionalArgs(cliArgs);

const exportPublishersFromCsv = async () => {
  const resolvedInputPath = path.resolve(
    process.cwd(),
    inputPath ?? DEFAULT_INPUT_PATH,
  );
  const resolvedOutputPath = path.resolve(
    process.cwd(),
    outputPath ?? DEFAULT_OUTPUT_PATH,
  );
  const csvContents = await readFile(resolvedInputPath, "utf8");
  const publisherRows = parsePublisherRows(csvContents);
  const { exportRows, uniquePublisherCount } =
    buildPublisherExportRows(publisherRows);

  if (!isDryRun) {
    await writeFile(
      resolvedOutputPath,
      `${JSON.stringify(exportRows, null, 2)}\n`,
    );
  }

  console.log(
    JSON.stringify(
      {
        inputPath: resolvedInputPath,
        outputPath: resolvedOutputPath,
        totalCsvRows: publisherRows.length,
        uniquePublisherCount,
        exportedPublisherCount: exportRows.length,
        dryRun: isDryRun,
      },
      null,
      2,
    ),
  );

  if (isDryRun) {
    console.log("Dry run complete. No publishers JSON file was written.");
    return;
  }

  console.log("Publishers JSON export completed successfully.");
};

exportPublishersFromCsv().catch((error) => {
  const message =
    error instanceof Error ? error.message : "Unknown CSV export failure.";
  console.error(message);
  process.exitCode = 1;
});
