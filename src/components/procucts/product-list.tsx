import { BookTypes } from "@/features/home/types/book-types";
import ProductCard from "./product-card";

type ProductListProps = {
  books: BookTypes[];
  desktopColumns?: 3 | 4;
};

export default function ProductList({
  books,
  desktopColumns = 3,
}: ProductListProps) {
  const desktopColumnClass =
    desktopColumns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3";

  return (
    <div
      className={`grid grid-cols-1 gap-x-0 gap-y-10 sm:grid-cols-2 sm:gap-4 ${desktopColumnClass}`}
    >
      {books.map((book) => {
        return <ProductCard key={book.id} book={book} />;
      })}
    </div>
  );
}
