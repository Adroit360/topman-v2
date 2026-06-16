export const sourceBookTypeOptions = [
  "Activity Book",
  "Handbook",
  "Literature",
  "Past Questions",
  "Practical Book",
  "Sensoral Practice",
  "Textbook",
  "Workbook",
  "Writing Book",
] as const;

export const sourceBookLevelOptions = [
  "All",
  "Colleges",
  "Junior High Schools",
  "Preschool",
  "Primary",
  "Senior High School",
] as const;

export type SourceBookType = (typeof sourceBookTypeOptions)[number];
export type SourceBookLevel = (typeof sourceBookLevelOptions)[number];

const normalizeTaxonomyKey = (value: string) => value.trim().toLowerCase();

const sourceBookTypeByKey = new Map<string, SourceBookType>();
const sourceBookLevelByKey = new Map<string, SourceBookLevel>();

const sourceBookTypeAliases: Record<string, SourceBookType> = {
  "activity book": "Activity Book",
  "practice book": "Practical Book",
  workbook: "Workbook",
};

const sourceBookLevelAliases: Record<string, SourceBookLevel> = {
  preschool: "Preschool",
  primary: "Primary",
};

for (const typeOption of sourceBookTypeOptions) {
  const key = normalizeTaxonomyKey(typeOption);

  sourceBookTypeByKey.set(key, sourceBookTypeAliases[key] ?? typeOption);
}

for (const levelOption of sourceBookLevelOptions) {
  const key = normalizeTaxonomyKey(levelOption);

  sourceBookLevelByKey.set(key, sourceBookLevelAliases[key] ?? levelOption);
}

export const getSourceBookTypeOption = (
  value: string,
): SourceBookType | null => sourceBookTypeByKey.get(normalizeTaxonomyKey(value)) ?? null;

export const getSourceBookLevelOption = (
  value: string,
): SourceBookLevel | null =>
  sourceBookLevelByKey.get(normalizeTaxonomyKey(value)) ?? null;

export const isSourceBookType = (value: string): value is SourceBookType =>
  Boolean(getSourceBookTypeOption(value));

export const isSourceBookLevel = (value: string): value is SourceBookLevel =>
  Boolean(getSourceBookLevelOption(value));

export const trimSourceBookType = (value: string | null | undefined) =>
  String(value ?? "").trim();

export const trimSourceBookLevel = (value: string | null | undefined) =>
  String(value ?? "").trim();
