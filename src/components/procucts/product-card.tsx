import { BookTypes } from "@/features/home/types/book-types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import Image from "next/image";
import { Badge } from "../ui/badge";
import { currenctFormat } from "@/utils/currency-format";
import AddBookToCart from "./add-book-to-cart";

export default function ProductCard({ book }: { book: BookTypes }) {
  return (
    <Card className="group w-full overflow-hidden pt-0">
      <div className="relative aspect-3/4 overflow-hidden rounded-t-xl bg-muted">
        <Image
          loader={({ src }) => src}
          unoptimized
          src={book.image ?? ""}
          alt={book.title}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <CardHeader className="space-y-2 text-center">
        {/* <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="secondary">{book.level}</Badge>
          <Badge variant="outline">{book.type}</Badge>
          {!book.isAvailable ? (
            <Badge variant="destructive">Sold out</Badge>
          ) : null}
        </div> */}
        <CardTitle className="line-clamp-2 min-h-14 text-xl leading-tight capitalize">
          {book.title}
        </CardTitle>
        <CardDescription className="uppercase">
          {book.publisher?.name ?? "Publisher unavailable"}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto space-y-4 text-center">
        <div className="italic text-lg font-medium text-primary">
          {currenctFormat(book.price)}
        </div>
        <AddBookToCart book={book} />
      </CardContent>
    </Card>
  );
}
