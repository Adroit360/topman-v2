"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { bookListUpload } from "@/db/schema/book-list-upload";
import {
  addListOrderNoteSchema,
  listOrderNoteSchema,
  type AddListOrderNoteResult,
  type ListOrderNote,
} from "../types/list-order";

const parseNotes = (notes: unknown): ListOrderNote[] => {
  if (!Array.isArray(notes)) {
    return [];
  }

  return notes
    .map((item) => listOrderNoteSchema.safeParse(item))
    .filter((result) => result.success)
    .map((result) => result.data);
};

export const addListOrderNote = async (
  input: unknown,
): Promise<AddListOrderNoteResult> => {
  const parsed = addListOrderNoteSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Add a valid note before saving.",
    };
  }

  const { id, content } = parsed.data;

  const [existingItem] = await db
    .select({ id: bookListUpload.id, notes: bookListUpload.notes })
    .from(bookListUpload)
    .where(eq(bookListUpload.id, id));

  if (!existingItem) {
    return {
      success: false,
      message: "This list order could not be found.",
    };
  }

  const previousNotes = parseNotes(existingItem.notes);
  const nextNotes: ListOrderNote[] = [
    {
      content,
      createdAt: new Date().toISOString(),
    },
    ...previousNotes,
  ];

  try {
    await db
      .update(bookListUpload)
      .set({
        notes: nextNotes,
      })
      .where(eq(bookListUpload.id, id));

    revalidatePath("/dashboard/list");

    return {
      success: true,
      message: "Note added.",
    };
  } catch {
    return {
      success: false,
      message: "We could not save this note right now. Please try again.",
    };
  }
};
