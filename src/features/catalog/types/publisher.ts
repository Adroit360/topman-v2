export type PublisherAuthorSummary = {
  id: string;
  publisherId: string;
  name: string;
};

export type PublisherSummary = {
  id: string;
  name: string;
  reference: string;
  author: string;
  authors: PublisherAuthorSummary[];
};
