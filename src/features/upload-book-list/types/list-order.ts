import { z } from "zod";
import type { BookListUploadSelect } from "@/db/schema/book-list-upload";
import type { VariantProps } from "class-variance-authority";
import { badgeVariants } from "@/components/ui/badge";

export const listOrderStatusValues = [
  "submitted",
  "processing",
  "completed",
  "cancelled",
] as const;

export type ListOrderStatus = (typeof listOrderStatusValues)[number];

export const listOrderNoteSchema = z.object({
  content: z.string().trim().min(1),
  createdAt: z.string().trim().min(1),
});

export type ListOrderNote = z.infer<typeof listOrderNoteSchema>;

export type ListOrderRecord = Omit<BookListUploadSelect, "status" | "notes"> & {
  status: ListOrderStatus;
  notes: ListOrderNote[];
};

export const listOrderStatusLabelMap: Record<ListOrderStatus, string> = {
  submitted: "Submitted",
  processing: "Processing",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const listOrderStatusBadgeVariantMap: Record<
  ListOrderStatus,
  VariantProps<typeof badgeVariants>["variant"]
> = {
  submitted: "warning",
  processing: "info",
  completed: "success",
  cancelled: "error",
};

export const updateListOrderStatusSchema = z.object({
  id: z.string().trim().min(1, "List id is required."),
  status: z.enum(listOrderStatusValues, {
    error: "Choose a valid status.",
  }),
});

export const addListOrderNoteSchema = z.object({
  id: z.string().trim().min(1, "List id is required."),
  content: z
    .string()
    .trim()
    .min(1, "Add a note before saving.")
    .max(1000, "Note must be 1000 characters or less."),
});

export type UpdateListOrderStatusResult = {
  success: boolean;
  message: string;
};

export type AddListOrderNoteResult = {
  success: boolean;
  message: string;
};
