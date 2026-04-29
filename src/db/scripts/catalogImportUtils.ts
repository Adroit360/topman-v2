import { readFile } from "node:fs/promises";
import path from "node:path";
import { buildBookTags, normalizeWhitespace } from "../../lib/book-tags";

const CATALOG_DIR = path.resolve(process.cwd(), "data/catalog");

export const chunkValues = <T>(values: T[], size: number) => {
  const chunks: T[][] = [];

  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }

  return chunks;
};

export const slugify = (value: string) =>
  normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "publisher";

export const createUniqueSlug = (baseSlug: string, usedSlugs: Set<string>) => {
  if (!usedSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let counter = 2;
  let nextSlug = `${baseSlug}-${counter}`;

  while (usedSlugs.has(nextSlug)) {
    counter += 1;
    nextSlug = `${baseSlug}-${counter}`;
  }

  return nextSlug;
};

export const loadJsonFile = async <T>(filePath: string): Promise<T> => {
  const contents = await readFile(filePath, "utf8");

  return JSON.parse(contents) as T;
};

export const resolveCatalogImportPath = (
  defaultFileName: string,
  inputPath?: string,
) =>
  path.resolve(
    process.cwd(),
    inputPath || path.join(CATALOG_DIR, defaultFileName),
  );

export const hasFlag = (args: string[], flag: string) => args.includes(flag);

export const getOptionValue = (args: string[], option: string) => {
  const optionIndex = args.indexOf(option);

  if (optionIndex === -1) {
    return undefined;
  }

  return args[optionIndex + 1];
};

export const getPositionalArgs = (args: string[]) => {
  const positionals: string[] = [];

  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];

    if (value.startsWith("--")) {
      if (args[index + 1] && !args[index + 1].startsWith("--")) {
        index += 1;
      }

      continue;
    }

    positionals.push(value);
  }

  return positionals;
};

export const createBookImportTags = (
  title: string,
  publisherName: string,
  level: string,
  type: string,
) => buildBookTags(title, publisherName, level, type);
