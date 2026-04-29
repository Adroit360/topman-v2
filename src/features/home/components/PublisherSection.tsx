"use client";

import { useCatalog } from "@/features/catalog/hooks/useCatalog";
import type { BookTypes } from "@/features/home/types/book-types";
import { useSessionShuffleSeed } from "../hooks/useSessionShuffleSeed";
import { buildPublisherSectionGroups } from "../services/buildPublisherSectionGroups";
import CategorySectionHeader from "./CategoryHeader";
import ProductList from "@/components/procucts/product-list";
import NoBooksPublisher from "./NoBooksPublisher";
import NoPublisherList from "./NoPublisherList";
import PublisherHeader from "./PublisherHeader";

export const PublisherSection = () => {
  const { books, publishers } = useCatalog();
  const shuffleSeed = useSessionShuffleSeed();

  const groups = buildPublisherSectionGroups({
    books,
    publishers,
    shuffleSeed,
  }).filter((group) => group.books.length > 0);

  if (!books.length && !publishers.length) {
    return <NoBooksPublisher />;
  }

  if (!groups.length) {
    return <NoPublisherList />;
  }

  return (
    <section className="px-4 pb-14 sm:px-6 sm:pb-18 lg:px-8 lg:pb-24">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 sm:gap-12">
        <PublisherHeader />

        <div className="flex flex-col gap-6 lg:gap-8">
          {groups.map((group) => {
            const productListBooks: BookTypes[] = group.books.map((book) => ({
              ...book,
              level: "Featured",
              type: group.isGeneral ? "Literature" : "Publisher",
              isAvailable: true,
              image: book.image ?? "/placeholder-book.png",
              publisher: {
                id: group.id,
                name: group.name,
                reference: group.id,
              },
            }));

            return (
              <section
                key={group.id}
                className="flex flex-col gap-5 shadow-sm"
                aria-label={`${group.name} books`}
              >
                <CategorySectionHeader title={group.name} link="#" />

                <ProductList books={productListBooks} desktopColumns={4} />
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
};
