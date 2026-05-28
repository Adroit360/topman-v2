import { BookTypes } from "@/features/home/types/book-types";
import Image from "next/image";
import { currenctFormat } from "@/utils/currency-format";
import AddBookToCart from "./add-book-to-cart";

export default function ProductCard({ book }: { book: BookTypes }) {
  return (
    <article className="group flex h-full min-w-0 flex-col rounded-[1.75rem] bg-white p-3 shadow-[0_1px_0_rgba(15,23,42,0.04),0_22px_55px_rgba(15,23,42,0.08)] ring-1 ring-black/[0.04] transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_1px_0_rgba(15,23,42,0.04),0_34px_70px_rgba(15,23,42,0.14)] sm:p-4">
      <div className="relative mx-auto aspect-[4/4] md:aspect-[3/4] w-full overflow-hidden rounded-2xl">
        <Image
          loader={({ src }) => src}
          unoptimized
          src={book.image ?? ""}
          alt={book.title}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-[1.035]"
        />
      </div>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-4 text-center">
        <h3 className=" line-clamp-2 min-h-11 text-sm sm:text-[15px] sm:font-medium leading-5 text-slate-900 capitalize">{book.title}</h3>

        <p className=" text-base mt-1 sm:mt-0 sm:text-lg font-semibold text-slate-950">{currenctFormat(book.price)}</p>

        <div className="mt-2 sm:mt-4">
          <AddBookToCart book={book} />
        </div>
      </div>
    </article>
  );
}
