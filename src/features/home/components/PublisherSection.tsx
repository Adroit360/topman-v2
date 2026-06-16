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
    <section className="bg-[#f5f5f7] px-4 py-16 sm:px-6 sm:py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 sm:gap-12">
        {/* <PublisherHeader /> */}

        <div className="flex flex-col gap-10 lg:gap-18">
          {groups.map((group) => {
            const categoryLink = group.isGeneral ? "/shop?type=Literature" : `/shop?publisher=${encodeURIComponent(group.name)}`;
            const productListBooks: BookTypes[] = group.books.map((book) => ({
              ...book,
              level: "Featured",
              type: group.isGeneral ? "Literature" : "Publisher",
              isAvailable: true,
              image: book.image,
              publisher: {
                id: group.id,
                name: group.name,
                reference: group.id,
              },
            }));

            return (
              <section key={group.id} className="flex flex-col" aria-label={`${group.name} books`}>
                <CategorySectionHeader title={group.name} link={categoryLink} />

                <ProductList books={productListBooks} desktopColumns={4} />
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
};
