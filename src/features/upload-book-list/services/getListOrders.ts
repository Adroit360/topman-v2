import "server-only";

import { desc } from "drizzle-orm";
import { db } from "@/db";
import { bookListUpload } from "@/db/schema/book-list-upload";
import {
  listOrderNoteSchema,
  listOrderStatusValues,
  type ListOrderNote,
  type ListOrderRecord,
  type ListOrderStatus,
} from "../types/list-order";

const statusSet = new Set(listOrderStatusValues);

const parseStatus = (status: string): ListOrderStatus => {
  if (statusSet.has(status as ListOrderStatus)) {
    return status as ListOrderStatus;
  }

  return "submitted";
};

const parseNotes = (notes: unknown): ListOrderNote[] => {
  if (!Array.isArray(notes)) {
    return [];
  }

  const parsed = notes
    .map((item) => listOrderNoteSchema.safeParse(item))
    .filter((result) => result.success)
    .map((result) => result.data);

  return parsed;
};

export const getListOrders = async (): Promise<ListOrderRecord[]> => {
  const rows = await db
    .select()
    .from(bookListUpload)
    .orderBy(desc(bookListUpload.createdAt));

  return rows.map((row) => ({
    ...row,
    status: parseStatus(row.status),
    notes: parseNotes(row.notes),
  }));
};
