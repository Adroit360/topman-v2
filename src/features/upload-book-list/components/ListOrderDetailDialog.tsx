"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addListOrderNote } from "../services/addListOrderNote";
import { updateListOrderStatus } from "../services/updateListOrderStatus";
import {
  listOrderStatusLabelMap,
  listOrderStatusValues,
  type ListOrderRecord,
  type ListOrderStatus,
} from "../types/list-order";
import { ListOrderStatusBadge } from "./ListOrderStatusBadge";

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

const fileSizeFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

const formatFileSize = (size: number) => {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${fileSizeFormatter.format(size / 1024)} KB`;
  }

  return `${fileSizeFormatter.format(size / (1024 * 1024))} MB`;
};

const isImageFile = (contentType: string) => contentType.startsWith("image/");
const isPdfFile = (contentType: string) => contentType === "application/pdf";

export const ListOrderDetailDialog = ({
  order,
  open,
  onOpenChange,
}: {
  order: ListOrderRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [isStatusPending, startStatusTransition] = useTransition();
  const [isNotePending, startNoteTransition] = useTransition();
  const [nextStatus, setNextStatus] = useState<ListOrderStatus>("submitted");
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState<string | null>(null);

  useEffect(() => {
    if (order) {
      setNextStatus(order.status);
      setNote("");
      setNoteError(null);
    }
  }, [order]);

  const handleUpdateStatus = () => {
    if (!order) return;

    startStatusTransition(async () => {
      const result = await updateListOrderStatus({
        id: order.id,
        status: nextStatus,
      });

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleAddNote = () => {
    if (!order) return;

    if (!note.trim()) {
      setNoteError("Add a note before saving.");
      return;
    }

    startNoteTransition(async () => {
      const result = await addListOrderNote({
        id: order.id,
        content: note,
      });

      if (result.success) {
        toast.success(result.message);
        setNote("");
        setNoteError(null);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>List Order Details</DialogTitle>
          <DialogDescription>
            Review file preview, update status, and append timeline notes for
            team visibility.
          </DialogDescription>
        </DialogHeader>

        {order ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="border-b border-border/60">
                <CardTitle>Preview</CardTitle>
                <CardDescription>{order.fileName}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pt-4">
                <p className="text-sm text-muted-foreground">
                  {order.contentType} - {formatFileSize(order.fileSize)}
                </p>
                {isImageFile(order.contentType) ? (
                  <a
                    href={order.blobUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                    title="Open preview in a new tab"
                  >
                    <img
                      src={order.blobUrl}
                      alt={order.fileName}
                      className="max-h-80 w-full rounded-md border border-border object-contain"
                    />
                  </a>
                ) : null}
                {isPdfFile(order.contentType) ? (
                  <div className="relative">
                    <iframe
                      src={order.blobUrl}
                      title={order.fileName}
                      className="h-88 w-full rounded-md border border-border"
                    />
                    <a
                      href={order.blobUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute inset-0"
                      title="Open preview in a new tab"
                    >
                      <span className="sr-only">Open PDF in a new tab</span>
                    </a>
                  </div>
                ) : null}
                {!isImageFile(order.contentType) &&
                !isPdfFile(order.contentType) ? (
                  <a
                    href={order.blobUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Open file
                  </a>
                ) : null}
              </CardContent>
            </Card>

            <div className="flex flex-col gap-4">
              <Card>
                <CardHeader className="border-b border-border/60">
                  <CardTitle>Status</CardTitle>
                  <CardDescription>
                    Current status:{" "}
                    <ListOrderStatusBadge status={order.status} />
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Update status</FieldLabel>
                      <FieldContent>
                        <Select
                          value={nextStatus}
                          onValueChange={(value) =>
                            setNextStatus(value as ListOrderStatus)
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choose status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {listOrderStatusValues.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {listOrderStatusLabelMap[status]}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FieldContent>
                    </Field>
                  </FieldGroup>
                  <div className="mt-3 flex justify-end">
                    <Button
                      onClick={handleUpdateStatus}
                      disabled={isStatusPending}
                      size="sm"
                    >
                      {isStatusPending ? "Saving..." : "Save status"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b border-border/60">
                  <CardTitle>Admin Notes Timeline</CardTitle>
                  <CardDescription>
                    Leave update notes so other admins can follow progress.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 pt-4">
                  <div className="max-h-44 space-y-2 overflow-y-auto rounded-md border border-border/70 p-3">
                    {order.notes.length > 0 ? (
                      order.notes.map((item, index) => (
                        <div
                          key={`${item.createdAt}-${index}`}
                          className="rounded-md border border-border bg-muted/20 p-2"
                        >
                          <p className="text-sm text-foreground">
                            {item.content}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {dateTimeFormatter.format(new Date(item.createdAt))}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No notes yet.
                      </p>
                    )}
                  </div>

                  <FieldGroup>
                    <Field data-invalid={noteError ? true : undefined}>
                      <FieldLabel htmlFor="list-order-note">
                        Add note
                      </FieldLabel>
                      <FieldContent>
                        <Textarea
                          id="list-order-note"
                          value={note}
                          onChange={(event) => {
                            setNote(event.target.value);
                            if (noteError) {
                              setNoteError(null);
                            }
                          }}
                          placeholder="Write a quick timeline update for other admins."
                          aria-invalid={noteError ? true : undefined}
                        />
                        <FieldError
                          errors={noteError ? [{ message: noteError }] : []}
                        />
                      </FieldContent>
                    </Field>
                  </FieldGroup>

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      onClick={handleAddNote}
                      disabled={isNotePending}
                      size="sm"
                    >
                      {isNotePending ? "Adding..." : "Add note"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
