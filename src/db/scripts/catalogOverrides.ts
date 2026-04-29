export type CatalogOverride = {
  level?: string;
  type?: string;
};

export const fallbackLevelByType: Record<string, string> = {
  literature: "shs",
};

export const titleOverrides: Record<string, CatalogOverride> = {
  "de modzaka 2": { level: "jhs" },
};
