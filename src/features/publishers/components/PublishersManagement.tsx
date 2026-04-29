"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PublisherSummary } from "@/features/catalog";
import type { DeletePublisherResult } from "../types/publisher-form";
import { DeletePublisherDialog } from "./DeletePublisherDialog";
import { PublisherFormDialog } from "./PublisherFormDialog";
import { PublishersTable } from "./PublishersTable";

export const PublishersManagement = ({
  publishers,
}: {
  publishers: PublisherSummary[];
}) => {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPublisher, setEditingPublisher] =
    useState<PublisherSummary | null>(null);
  const [deletingPublisher, setDeletingPublisher] =
    useState<PublisherSummary | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSuccess = () => {
    setDeleteMessage(null);
    router.refresh();
  };

  const handleDeleted = (result: DeletePublisherResult) => {
    setDeleteMessage({
      success: result.success,
      message: result.message,
    });
    router.refresh();
  };

  return (
    <>
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-2xl flex-col gap-2">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Catalog workspace
            </p>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground">
              Publishers
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Create new publishers, review the current list, and update records
              without leaving the dashboard.
            </p>
            {deleteMessage ? (
              <p
                className={
                  deleteMessage.success
                    ? "text-sm text-green-500"
                    : "text-sm text-destructive"
                }
              >
                {deleteMessage.message}
              </p>
            ) : null}
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <PlusIcon data-icon="inline-start" />
            Add publisher
          </Button>
        </div>
      </section>

      {publishers.length > 0 ? (
        <PublishersTable
          publishers={publishers}
          onEdit={(publisher) => setEditingPublisher(publisher)}
          onDelete={(publisher) => {
            setDeleteMessage(null);
            setDeletingPublisher(publisher);
          }}
        />
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card/60 p-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <h2 className="text-xl font-semibold text-foreground">
              No publishers yet
            </h2>
            <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
              Add your first publisher to start managing catalog ownership and
              references from the dashboard.
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>Add publisher</Button>
          </div>
        </div>
      )}

      <PublisherFormDialog
        mode="create"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={handleSuccess}
      />
      <PublisherFormDialog
        mode="edit"
        open={Boolean(editingPublisher)}
        publisher={editingPublisher}
        onOpenChange={(open) => {
          if (!open) {
            setEditingPublisher(null);
          }
        }}
        onSuccess={handleSuccess}
      />
      <DeletePublisherDialog
        open={Boolean(deletingPublisher)}
        publisher={deletingPublisher}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingPublisher(null);
          }
        }}
        onDeleted={handleDeleted}
      />
    </>
  );
};
