"use client";

import ProductList from "@/components/procucts/product-list";
import { Button } from "@/components/ui/button";
import type { BookRecord } from "@/features/catalog/types/book";
import type { BookTypes } from "@/features/home/types/book-types";

type ShopResultsProps = {
  books: BookRecord[];
  onResetFilters: () => void;
};

const toProductListBook = (book: BookRecord): BookTypes => ({
  id: book.id,
  title: book.title,
  image: book.image ?? "/placeholder-book.png",
  author: book.publisher.author,
  price: book.price,
  level: book.level,
  type: book.type,
  isAvailable: book.isAvailable,
  publisher: {
    id: book.publisher.id,
    name: book.publisher.name,
    reference: book.publisher.reference,
  },
});

export const ShopResults = ({ books, onResetFilters }: ShopResultsProps) => {
  if (books.length === 0) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center rounded-[2rem] border border-dashed border-border bg-muted/30 px-6 py-14 text-center">
        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-foreground">
          No books match these filters
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
          Try clearing some filters or using a broader search keyword to see
          more results.
        </p>
        <Button className="mt-6 rounded-full" onClick={onResetFilters}>
          Reset filters
        </Button>
      </div>
    );
  }

  return (
    <ProductList books={books.map(toProductListBook)} desktopColumns={3} />
  );
};
