"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { CatalogContextValue, CatalogData } from "../types/catalog";

const CatalogContext = createContext<CatalogContextValue | null>(null);

export const useCatalogState = ({
  books,
  publishers,
}: CatalogData): CatalogContextValue => {
  const [catalogBooks, setCatalogBooks] = useState(books);
  const [catalogPublishers, setCatalogPublishers] = useState(publishers);

  const publishersById = useMemo(
    () =>
      new Map(catalogPublishers.map((publisher) => [publisher.id, publisher])),
    [catalogPublishers],
  );

  return {
    books: catalogBooks,
    publishers: catalogPublishers,
    publishersById,
    setBooks: setCatalogBooks,
    setPublishers: setCatalogPublishers,
  };
};

export const CatalogContextProvider = CatalogContext.Provider;

export const useCatalog = (): CatalogContextValue => {
  const context = useContext(CatalogContext);

  if (!context) {
    throw new Error("useCatalog must be used within a CatalogProvider.");
  }

  return context;
};
