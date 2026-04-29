import { Edit2Icon, Trash2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BookRecord } from "@/features/catalog";
import { currenctFormat } from "@/utils/currency-format";

export const BooksTable = ({
  books,
  onEdit,
  onDelete,
}: {
  books: BookRecord[];
  onEdit: (book: BookRecord) => void;
  onDelete: (book: BookRecord) => void;
}) => {
  return (
    <Card className="border-border/70 bg-card/80">
      <CardHeader className="border-b border-border/60">
        <CardTitle>Books</CardTitle>
        <CardDescription>
          Manage every book record used across the catalog.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[32%] whitespace-normal">Title</TableHead>
              <TableHead className="w-[20%] whitespace-normal">
                Publisher
              </TableHead>
              <TableHead className="w-[12%]">Price</TableHead>
              <TableHead className="w-[14%] whitespace-normal">
                Availability
              </TableHead>
              <TableHead className="w-[10%] whitespace-normal">Level</TableHead>
              <TableHead className="w-[8%] whitespace-normal">Type</TableHead>
              <TableHead className="w-24 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.map((book) => (
              <TableRow key={book.id}>
                <TableCell className="whitespace-normal align-top">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium leading-snug capitalize">
                      {book.title}
                    </span>
                    {book.tags.length > 0 ? (
                      <span className="text-xs text-muted-foreground wrap-break-word">
                        {book.tags.slice(0, 3).join(", ")}
                      </span>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="whitespace-normal text-muted-foreground align-top wrap-break-word capitalize">
                  {book.publisher.name}
                </TableCell>
                <TableCell className="font-medium">
                  {currenctFormat(book.price)}
                </TableCell>
                <TableCell className="whitespace-normal">
                  <Badge variant={book.isAvailable ? "success" : "outline"}>
                    {book.isAvailable ? "Available" : "Unavailable"}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-normal text-muted-foreground">
                  {book.level}
                </TableCell>
                <TableCell className="whitespace-normal text-muted-foreground">
                  {book.type}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="bg-yellow-400/10 text-yellow-500"
                      onClick={() => onEdit(book)}
                      aria-label={`Edit ${book.title}`}
                      title={`Edit ${book.title}`}
                    >
                      <Edit2Icon />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="bg-destructive/10 text-destructive"
                      onClick={() => onDelete(book)}
                      aria-label={`Delete ${book.title}`}
                      title={`Delete ${book.title}`}
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
