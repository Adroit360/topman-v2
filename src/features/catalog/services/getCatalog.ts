import "server-only";

import { getBooks } from "./getBooks";
import { getPublishers } from "./getPublishers";
import type { CatalogData } from "../types/catalog";

export const getCatalog = async (): Promise<CatalogData> => {
  const [books, publishers] = await Promise.all([getBooks(), getPublishers()]);

  return {
    books,
    publishers,
  };
};
