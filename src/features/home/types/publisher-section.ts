export type PublisherSectionBook = {
  id: string;
  title: string;
  image: string | null;
  author: string;
  price: number;
};

export type PublisherSectionGroup = {
  id: string;
  name: string;
  description: string;
  books: PublisherSectionBook[];
  isGeneral?: boolean;
};
