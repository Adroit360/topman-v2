import type { PublisherSummary } from "./publisher";

export type BookTag = string;

export type BookAuthorSummary = {
  id: string;
  name: string;
};

export type BookRecord = {
  id: string;
  title: string;
  level: string;
  type: string;
  image: string | null;
  isAvailable: boolean;
  price: number;
  tags: BookTag[];
  publisherId: string;
  authorId: string | null;
  author: BookAuthorSummary | null;
  publisher: PublisherSummary;
};
