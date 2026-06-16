import { BookTypes } from "@/features/home/types/book-types";
import ProductCard from "./product-card";

type ProductListProps = {
  books: BookTypes[];
  desktopColumns?: 3 | 4 | 5;
};

export default function ProductList({ books, desktopColumns = 3 }: ProductListProps) {
  const desktopColumnClass = desktopColumns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3";

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 items-stretch gap-4 sm:gap-5  lg:gap-7 ${desktopColumnClass}`}>
      {books.map((book) => {
        return <ProductCard key={book.id} book={book} />;
      })}
    </div>
  );
}
