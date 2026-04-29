"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { BookRecord } from "@/features/catalog";
import { deleteBook } from "../services/deleteBook";
import type { DeleteBookResult } from "../types/book-form";

export const DeleteBookDialog = ({
  open,
  book,
  onOpenChange,
  onDeleted,
}: {
  open: boolean;
  book: BookRecord | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: (result: DeleteBookResult) => void;
}) => {
  const [isPending, startTransition] = useTransition();

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
  };

  const handleConfirmDelete = () => {
    if (!book) {
      return;
    }

    startTransition(async () => {
      const result = await deleteBook({ id: book.id });

      if (result.success) {
        onDeleted(result);
        handleOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>Delete book</DialogTitle>
          <DialogDescription>
            {book
              ? `This will soft delete ${book.title} and remove it from the books dashboard list.`
              : "This will soft delete the selected book and remove it from the books dashboard list."}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending || !book}
            onClick={handleConfirmDelete}
          >
            {isPending ? "Deleting..." : "Delete book"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
