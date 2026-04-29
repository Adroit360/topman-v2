"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PublisherSummary } from "@/features/catalog";
import { deletePublisher } from "../services/deletePublisher";
import type { DeletePublisherResult } from "../types/publisher-form";

const initialState: DeletePublisherResult = {
  success: false,
  message: "",
};

export const DeletePublisherDialog = ({
  open,
  publisher,
  onOpenChange,
  onDeleted,
}: {
  open: boolean;
  publisher: PublisherSummary | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: (result: DeletePublisherResult) => void;
}) => {
  const [actionState, setActionState] = useState(initialState);
  const [isPending, startTransition] = useTransition();

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setActionState(initialState);
    }

    onOpenChange(nextOpen);
  };

  const handleConfirmDelete = () => {
    if (!publisher) {
      return;
    }

    startTransition(async () => {
      const result = await deletePublisher({ id: publisher.id });

      setActionState(result);

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
          <DialogTitle>Delete publisher</DialogTitle>
          <DialogDescription>
            {publisher
              ? `This will soft delete ${publisher.name} and remove it from the publishers dashboard list.`
              : "This will soft delete the selected publisher and remove it from the publishers dashboard list."}
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
            disabled={isPending || !publisher}
            onClick={handleConfirmDelete}
          >
            {isPending ? "Deleting..." : "Delete publisher"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
