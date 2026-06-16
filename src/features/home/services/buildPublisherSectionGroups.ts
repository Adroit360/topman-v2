import type { BookRecord } from "@/features/catalog/types/book";
import type { PublisherSummary } from "@/features/catalog/types/publisher";
import type {
  PublisherSectionBook,
  PublisherSectionGroup,
} from "../types/publisher-section";

const MAX_PUBLISHERS = 4;
const MAX_BOOKS_PER_PUBLISHER = 4;
const LITERATURE_GROUP_ID = "literature";
const LITERATURE_GROUP_NAME = "Literature";

const hashSeed = (value: string) => {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

const createRandomNumberGenerator = (seed: string) => {
  let state = hashSeed(seed) || 1;

  return () => {
    state += 0x6d2b79f5;

    let next = Math.imul(state ^ (state >>> 15), state | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);

    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
};

const shuffleItems = <Item>(items: Item[], seed: string) => {
  const random = createRandomNumberGenerator(seed);
  const shuffledItems = [...items];

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const currentItem = shuffledItems[index];

    shuffledItems[index] = shuffledItems[swapIndex];
    shuffledItems[swapIndex] = currentItem;
  }

  return shuffledItems;
};

const toSectionBook = (book: BookRecord): PublisherSectionBook => ({
  id: book.id,
  title: book.title,
  image: book.image,
  author: book.author?.name ?? book.publisher.author,
  price: book.price,
});

const buildGroupDescription = (publisher: PublisherSummary, count: number) => {
  if (publisher.author && publisher.author !== "Unknown") {
    return `${count} curated titles by ${publisher.author}.`;
  }

  return `${count} curated titles from ${publisher.name}.`;
};

export const buildPublisherSectionGroups = ({
  books,
  publishers,
  shuffleSeed,
}: {
  books: BookRecord[];
  publishers: PublisherSummary[];
  shuffleSeed?: string | null;
}): PublisherSectionGroup[] => {
  const booksByPublisher = new Map<string, BookRecord[]>();

  for (const book of books) {
    const publisherBooks = booksByPublisher.get(book.publisherId) ?? [];
    publisherBooks.push(book);
    booksByPublisher.set(book.publisherId, publisherBooks);
  }

  const eligiblePublishers = publishers.filter(
    (publisher) => (booksByPublisher.get(publisher.id)?.length ?? 0) > 0,
  );
  const featuredPublishers = eligiblePublishers.slice(0, MAX_PUBLISHERS - 1);
  const selectedPublishers = (
    shuffleSeed
      ? shuffleItems(featuredPublishers, `${shuffleSeed}:publishers`)
      : featuredPublishers
  ).slice(0, MAX_PUBLISHERS - 1);

  const usedBookIds = new Set<string>();
  const publisherGroups = selectedPublishers.map<PublisherSectionGroup>(
    (publisher) => {
      const availablePublisherBooks = (
        booksByPublisher.get(publisher.id) ?? []
      ).slice(0, MAX_BOOKS_PER_PUBLISHER);
      const publisherBooks = (
        shuffleSeed
          ? shuffleItems(
              availablePublisherBooks,
              `${shuffleSeed}:publisher-books:${publisher.id}`,
            )
          : availablePublisherBooks
      ).slice(0, MAX_BOOKS_PER_PUBLISHER);

      for (const book of publisherBooks) {
        usedBookIds.add(book.id);
      }

      return {
        id: publisher.id,
        name: publisher.name,
        description: buildGroupDescription(publisher, publisherBooks.length),
        books: publisherBooks.map(toSectionBook),
      };
    },
  );

  const availableLiteratureBooks = books.filter(
    (book) => !usedBookIds.has(book.id) && book.type === LITERATURE_GROUP_NAME,
  );
  const literatureBooks = (
    shuffleSeed
      ? shuffleItems(
          availableLiteratureBooks,
          `${shuffleSeed}:literature-books`,
        )
      : availableLiteratureBooks
  )
    .slice(0, MAX_BOOKS_PER_PUBLISHER)
    .map(toSectionBook);

  const literatureGroup: PublisherSectionGroup = {
    id: LITERATURE_GROUP_ID,
    name: LITERATURE_GROUP_NAME,
    description:
      "A curated shelf of literature picks drawn from across the catalog.",
    books: literatureBooks,
    isGeneral: true,
  };

  return [...publisherGroups, literatureGroup].slice(0, MAX_PUBLISHERS);
};
