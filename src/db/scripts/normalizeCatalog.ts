import { createId } from "@paralleldrive/cuid2";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fallbackLevelByType, titleOverrides } from "./catalogOverrides";

const CATALOG_DIR = path.resolve(process.cwd(), "data/catalog");
const UNKNOWN_AUTHOR = "Unknown";
const GENERAL_LEVEL = "general";
const GENERAL_TYPE = "general";

type RawMongoId = {
  $oid: string;
};

type RawPublisher = {
  _id: RawMongoId;
  name: string;
  __v?: number;
};

type RawBook = {
  _id: RawMongoId;
  title?: string;
  level?: string;
  type?: string;
  image?: string | null;
  outStock?: boolean;
  price?: number;
  keywords?: unknown[];
  publisher?: string;
  section?: unknown[];
};

export type CatalogWarning = {
  kind:
    | "missing-book-title"
    | "missing-book-price"
    | "missing-book-publisher"
    | "unknown-book-publisher"
    | "normalized-book-level"
    | "normalized-book-type";
  sourceId?: string;
  title?: string;
  message: string;
};

export type NormalizedPublisherSeed = {
  id: string;
  name: string;
  reference: string;
  author: string;
  sourcePublisherId: string;
};

export type NormalizedBookSeed = {
  id: string;
  title: string;
  level: string;
  type: string;
  image: string | null;
  isAvailable: boolean;
  price: number;
  tags: string[];
  publisherId: string;
  sourceBookId: string;
};

export type CatalogNormalizationResult = {
  publishers: NormalizedPublisherSeed[];
  books: NormalizedBookSeed[];
  warnings: CatalogWarning[];
  skippedBooks: number;
};

type CatalogSource = {
  books: RawBook[];
  publishers: RawPublisher[];
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
  practical: "practical",
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

const normalizeWhitespace = (value: string) =>
  value.replace(/\s+/g, " ").trim();

const getTitleOverride = (title: string) =>
  titleOverrides[normalizeWhitespace(title).toLowerCase()];

const toLookupTokens = (values: Array<string | number | null | undefined>) =>
  values
    .flatMap((value) =>
      String(value ?? "")
        .toLowerCase()
        .split(/[^a-z0-9]+/),
    )
    .map((value) => value.trim())
    .filter(Boolean);

const slugify = (value: string) =>
  normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "publisher";

const chunk = <T>(values: T[], size: number) => {
  const chunks: T[][] = [];

  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }

  return chunks;
};

const toScalarValues = (values?: unknown[]) =>
  (values ?? []).filter(
    (value): value is string | number | null | undefined =>
      typeof value === "string" || typeof value === "number" || value == null,
  );

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
    return "practical";
  }

  if (haystack.includes(" story ")) {
    return "story book";
  }

  if (stationeryMarkers.some((marker) => haystack.includes(` ${marker} `))) {
    return "stationery";
  }

  return GENERAL_TYPE;
};

const normalizeTags = (book: RawBook) => {
  const tags = [...(book.keywords ?? []), ...(book.section ?? [])]
    .map((value) => normalizeWhitespace(String(value ?? "").toLowerCase()))
    .filter(Boolean);

  return Array.from(new Set(tags));
};

const normalizeLevel = (book: RawBook, normalizedType: string) => {
  const titleOverride = getTitleOverride(book.title ?? "");

  if (titleOverride?.level) {
    return {
      normalized: titleOverride.level,
      changed: true,
    };
  }

  const rawLevel = normalizeWhitespace(String(book.level ?? "").toLowerCase());

  if (rawLevel && rawLevel !== "undefined" && levelAliases[rawLevel]) {
    return {
      normalized: levelAliases[rawLevel],
      changed: levelAliases[rawLevel] !== rawLevel,
    };
  }

  const inferred = inferLevel([
    book.level,
    book.title,
    ...toScalarValues(book.keywords),
  ]);

  if (inferred === GENERAL_LEVEL && fallbackLevelByType[normalizedType]) {
    return {
      normalized: fallbackLevelByType[normalizedType],
      changed: true,
    };
  }

  return {
    normalized: inferred,
    changed: true,
  };
};

const normalizeType = (book: RawBook) => {
  const titleOverride = getTitleOverride(book.title ?? "");

  if (titleOverride?.type) {
    return {
      normalized: titleOverride.type,
      changed: true,
    };
  }

  const rawType = normalizeWhitespace(String(book.type ?? "").toLowerCase());

  if (rawType && rawType !== "undefined" && typeAliases[rawType]) {
    return {
      normalized: typeAliases[rawType],
      changed: typeAliases[rawType] !== rawType,
    };
  }

  const inferred = inferType([
    book.type,
    book.title,
    ...toScalarValues(book.keywords),
  ]);

  return {
    normalized: inferred,
    changed: true,
  };
};

const buildPublishers = (publishers: RawPublisher[]) => {
  const referenceCounts = new Map<string, number>();

  return publishers.map<NormalizedPublisherSeed>((rawPublisher) => {
    const baseReference = slugify(rawPublisher.name);
    const seenCount = referenceCounts.get(baseReference) ?? 0;
    referenceCounts.set(baseReference, seenCount + 1);
    const reference =
      seenCount === 0 ? baseReference : `${baseReference}-${seenCount + 1}`;

    return {
      id: createId(),
      name: normalizeWhitespace(rawPublisher.name),
      reference,
      author: UNKNOWN_AUTHOR,
      sourcePublisherId: rawPublisher._id.$oid,
    };
  });
};

const buildBooks = (
  books: RawBook[],
  publisherIdBySourceId: Map<string, string>,
  warnings: CatalogWarning[],
) => {
  const normalizedBooks: NormalizedBookSeed[] = [];
  let skippedBooks = 0;

  for (const rawBook of books) {
    const sourceBookId = rawBook._id?.$oid ?? `missing-book-${createId()}`;
    const title = normalizeWhitespace(rawBook.title ?? "");

    if (!title) {
      skippedBooks += 1;
      warnings.push({
        kind: "missing-book-title",
        sourceId: sourceBookId,
        message: "Skipped a book without a title.",
      });
      continue;
    }

    if (typeof rawBook.price !== "number" || Number.isNaN(rawBook.price)) {
      skippedBooks += 1;
      warnings.push({
        kind: "missing-book-price",
        sourceId: sourceBookId,
        title,
        message: `Skipped \"${title}\" because its price is missing or invalid.`,
      });
      continue;
    }

    if (!rawBook.publisher) {
      skippedBooks += 1;
      warnings.push({
        kind: "missing-book-publisher",
        sourceId: sourceBookId,
        title,
        message: `Skipped \"${title}\" because it has no publisher reference.`,
      });
      continue;
    }

    const publisherId = publisherIdBySourceId.get(rawBook.publisher);

    if (!publisherId) {
      skippedBooks += 1;
      warnings.push({
        kind: "unknown-book-publisher",
        sourceId: sourceBookId,
        title,
        message: `Skipped \"${title}\" because publisher ${rawBook.publisher} was not found in the source publishers list.`,
      });
      continue;
    }

    const normalizedType = normalizeType(rawBook);
    const normalizedLevel = normalizeLevel(rawBook, normalizedType.normalized);

    if (normalizedLevel.changed) {
      warnings.push({
        kind: "normalized-book-level",
        sourceId: sourceBookId,
        title,
        message: `Normalized level for \"${title}\" to \"${normalizedLevel.normalized}\".`,
      });
    }

    if (normalizedType.changed) {
      warnings.push({
        kind: "normalized-book-type",
        sourceId: sourceBookId,
        title,
        message: `Normalized type for \"${title}\" to \"${normalizedType.normalized}\".`,
      });
    }

    normalizedBooks.push({
      id: createId(),
      sourceBookId,
      title,
      level: normalizedLevel.normalized,
      type: normalizedType.normalized,
      image: rawBook.image ? normalizeWhitespace(rawBook.image) : null,
      isAvailable: !rawBook.outStock,
      price: Math.round(rawBook.price),
      tags: normalizeTags(rawBook),
      publisherId,
    });
  }

  return {
    books: normalizedBooks,
    skippedBooks,
  };
};

export const loadCatalogSource = async (): Promise<CatalogSource> => {
  const [booksJson, publishersJson] = await Promise.all([
    readFile(path.join(CATALOG_DIR, "books.json"), "utf8"),
    readFile(path.join(CATALOG_DIR, "publishers.json"), "utf8"),
  ]);

  return {
    books: JSON.parse(booksJson) as RawBook[],
    publishers: JSON.parse(publishersJson) as RawPublisher[],
  };
};

export const normalizeCatalog =
  async (): Promise<CatalogNormalizationResult> => {
    const { books, publishers } = await loadCatalogSource();
    const warnings: CatalogWarning[] = [];
    const normalizedPublishers = buildPublishers(publishers);
    const publisherIdBySourceId = new Map(
      normalizedPublishers.map((publisher) => [
        publisher.sourcePublisherId,
        publisher.id,
      ]),
    );
    const normalizedBooks = buildBooks(books, publisherIdBySourceId, warnings);

    return {
      publishers: normalizedPublishers,
      books: normalizedBooks.books,
      warnings,
      skippedBooks: normalizedBooks.skippedBooks,
    };
  };

export const chunkValues = chunk;
