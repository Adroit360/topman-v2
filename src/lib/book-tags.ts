export const normalizeWhitespace = (value: string) =>
  value.replace(/\s+/g, " ").trim();

export const tokenizeTagWords = (
  ...values: Array<string | null | undefined>
) => {
  const uniqueWords = new Set<string>();

  for (const value of values) {
    const normalizedValue = normalizeWhitespace(
      String(value ?? ""),
    ).toLowerCase();

    if (!normalizedValue) {
      continue;
    }

    for (const word of normalizedValue.split(/[^a-z0-9]+/)) {
      const normalizedWord = normalizeWhitespace(word);

      if (normalizedWord) {
        uniqueWords.add(normalizedWord);
      }
    }
  }

  return [...uniqueWords];
};

export const buildBookTags = (
  title: string,
  publisherName: string,
  level?: string | null,
  type?: string | null,
) => tokenizeTagWords(title, publisherName, level, type);
