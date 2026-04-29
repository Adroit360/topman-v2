export const sourceBookTypeOptions = [
  "Activity Book",
  "Activity book",
  "Handbook",
  "Literature",
  "Practical Book",
  "Practice Book",
  "Sensoral Practice",
  "Textbook",
  "WorkBook",
  "Workbook",
  "Writing Book",
] as const;

export const sourceBookLevelOptions = [
  "All",
  "Colleges",
  "Junior High Schools",
  "PreSchool",
  "Preschool",
  "Primary",
  "Senior High School",
  "primary",
] as const;

export type SourceBookType = (typeof sourceBookTypeOptions)[number];
export type SourceBookLevel = (typeof sourceBookLevelOptions)[number];

const sourceBookTypeSet = new Set<string>(sourceBookTypeOptions);
const sourceBookLevelSet = new Set<string>(sourceBookLevelOptions);

export const isSourceBookType = (value: string): value is SourceBookType =>
  sourceBookTypeSet.has(value);

export const isSourceBookLevel = (value: string): value is SourceBookLevel =>
  sourceBookLevelSet.has(value);

export const trimSourceBookType = (value: string | null | undefined) =>
  String(value ?? "").trim();

export const trimSourceBookLevel = (value: string | null | undefined) =>
  String(value ?? "").trim();
