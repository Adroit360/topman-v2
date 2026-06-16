import { BookCoverImage } from "@/components/branding/BookCoverImage";
import type { PublisherSectionBook } from "../types/publisher-section";

type BookCardProps = {
  book: PublisherSectionBook;
};

export const BookCard = ({ book }: BookCardProps) => {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-border bg-background shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
      <BookCoverImage
        src={book.image}
        alt={`Cover for ${book.title}`}
        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
        containerClassName="aspect-4/5 border-b border-border"
        imageClassName="group-hover:scale-[1.02]"
      />

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex flex-1 flex-col gap-2">
          <h3 className="line-clamp-2 text-base font-semibold tracking-[-0.03em] text-foreground">
            {book.title}
          </h3>
          <p className="text-sm leading-6 text-muted-foreground">
            {book.author}
          </p>
        </div>

        <p className="text-base font-semibold tracking-[-0.03em] text-foreground">
          GHS {book.price.toFixed(2)}
        </p>
      </div>
    </article>
  );
};
