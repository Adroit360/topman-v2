import type { PublisherSummary } from "./publisher";

export type BookTag = string;

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
  publisher: PublisherSummary;
};
