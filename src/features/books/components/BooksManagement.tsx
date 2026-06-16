"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, SearchIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BookRecord, PublisherSummary } from "@/features/catalog";
import type { DeleteBookResult } from "../types/book-form";
import { BookFormDialog } from "./BookFormDialog";
import { BooksTable } from "./BooksTable";
import { DeleteBookDialog } from "./DeleteBookDialog";

export const BooksManagement = ({ books, publishers }: { books: BookRecord[]; publishers: PublisherSummary[] }) => {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BookRecord | null>(null);
  const [deletingBook, setDeletingBook] = useState<BookRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBooks = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    if (!normalizedSearchTerm) {
      return books;
    }

    return books.filter((book) => {
      const haystack = [book.title, book.publisher.name, book.author?.name ?? "", book.publisher.author, book.level, book.type, ...book.tags].join(" ").toLowerCase();

      return haystack.includes(normalizedSearchTerm);
    });
  }, [books, searchTerm]);

  const handleSuccess = () => {
    router.refresh();
  };

  const handleDeleted = (result: DeleteBookResult) => {
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }

    router.refresh();
  };

  return (
    <>
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-2xl flex-col gap-2">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">Catalog workspace</p>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground">Books</h1>
            <p className="text-sm text-muted-foreground sm:text-base">Add new books, review current inventory records, and update book details without leaving the dashboard.</p>
          </div>
          <div className="flex w-full max-w-sm flex-col gap-3 self-stretch lg:self-end">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Filter books" className="pl-9" />
            </div>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <PlusIcon data-icon="inline-start" />
            Add book
          </Button>
        </div>
      </section>

      {books.length > 0 ? (
        filteredBooks.length > 0 ? (
          <BooksTable books={filteredBooks} onEdit={setEditingBook} onDelete={setDeletingBook} />
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card/60 p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <h2 className="text-xl font-semibold text-foreground">No matching books</h2>
              <p className="max-w-xl text-sm text-muted-foreground sm:text-base">Try a different title, publisher, level, or type in the filter box.</p>
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Clear filter
              </Button>
            </div>
          </div>
        )
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card/60 p-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <h2 className="text-xl font-semibold text-foreground">No books yet</h2>
            <p className="max-w-xl text-sm text-muted-foreground sm:text-base">Add your first book to start managing catalog records from the dashboard.</p>
            <Button onClick={() => setIsCreateOpen(true)}>Add book</Button>
          </div>
        </div>
      )}

      <BookFormDialog mode="create" open={isCreateOpen} publishers={publishers} onOpenChange={setIsCreateOpen} onSuccess={handleSuccess} />
      <BookFormDialog
        mode="edit"
        open={Boolean(editingBook)}
        book={editingBook}
        publishers={publishers}
        onOpenChange={(open) => {
          if (!open) {
            setEditingBook(null);
          }
        }}
        onSuccess={handleSuccess}
      />
      <DeleteBookDialog
        open={Boolean(deletingBook)}
        book={deletingBook}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingBook(null);
          }
        }}
        onDeleted={handleDeleted}
      />
    </>
  );
};
