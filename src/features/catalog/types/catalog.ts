import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { BookRecord } from "./book";
import type { PublisherSummary } from "./publisher";

export type CatalogData = {
  books: BookRecord[];
  publishers: PublisherSummary[];
};

export type CatalogProviderProps = {
  children: ReactNode;
  initialBooks: BookRecord[];
  initialPublishers: PublisherSummary[];
};

export type CatalogContextValue = {
  books: BookRecord[];
  publishers: PublisherSummary[];
  publishersById: Map<string, PublisherSummary>;
  setBooks: Dispatch<SetStateAction<BookRecord[]>>;
  setPublishers: Dispatch<SetStateAction<PublisherSummary[]>>;
};
