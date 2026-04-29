"use client";

import type { CatalogProviderProps } from "../types/catalog";
import { CatalogContextProvider, useCatalogState } from "../hooks/useCatalog";

export const CatalogProvider = ({
  children,
  initialBooks,
  initialPublishers,
}: CatalogProviderProps) => {
  const value = useCatalogState({
    books: initialBooks,
    publishers: initialPublishers,
  });

  return (
    <CatalogContextProvider value={value}>{children}</CatalogContextProvider>
  );
};
