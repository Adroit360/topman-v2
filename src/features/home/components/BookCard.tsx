import Image from "next/image";
import { BookOpen } from "lucide-react";
import type { PublisherSectionBook } from "../types/publisher-section";

type BookCardProps = {
  book: PublisherSectionBook;
};

const bookCoverLoader = ({ src }: { src: string }) => src;

export const BookCard = ({ book }: BookCardProps) => {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-border bg-background shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
      <div className="relative aspect-4/5 overflow-hidden border-b border-border bg-muted">
        {book.image ? (
          <Image
            src={book.image}
            alt={`Cover for ${book.title}`}
            loader={bookCoverLoader}
            unoptimized
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-3 px-6 text-center text-muted-foreground">
            <span className="flex size-12 items-center justify-center rounded-full border border-border bg-background shadow-sm">
              <BookOpen className="size-5" />
            </span>
            <p className="text-sm leading-6">Cover unavailable</p>
          </div>
        )}
      </div>

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
