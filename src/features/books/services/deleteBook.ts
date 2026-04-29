"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { book } from "@/db/schema/book";
import { deleteBookSchema, type DeleteBookResult } from "../types/book-form";

export const deleteBook = async (input: unknown): Promise<DeleteBookResult> => {
  const parsed = deleteBookSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "This book could not be deleted because its id is missing.",
    };
  }

  const { id } = parsed.data;

  const [existingBook] = await db
    .select({ id: book.id, title: book.title })
    .from(book)
    .where(and(eq(book.id, id), isNull(book.deletedAt)));

  if (!existingBook) {
    return {
      success: false,
      message: "This book could not be found.",
    };
  }

  try {
    await db
      .update(book)
      .set({ deletedAt: new Date() })
      .where(and(eq(book.id, id), isNull(book.deletedAt)));

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/books");
    revalidatePath("/");
    revalidatePath("/shop");

    return {
      success: true,
      message: `${existingBook.title} was moved to deleted books.`,
    };
  } catch {
    return {
      success: false,
      message: "We could not delete this book right now. Please try again.",
    };
  }
};
