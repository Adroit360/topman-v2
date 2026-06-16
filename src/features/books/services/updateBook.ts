"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { book } from "@/db/schema/book";
import { publisher, publisherAuthor } from "@/db/schema/publisher";
import {
  bookFieldNames,
  toBookInsertValues,
  updateBookSchema,
  type BookActionResult,
} from "../types/book-form";

const toFieldErrors = (error: unknown): BookActionResult["fieldErrors"] => {
  const fieldErrors: Partial<Record<(typeof bookFieldNames)[number], string>> =
    {};

  if (!(error instanceof Error) || !("issues" in error)) {
    return fieldErrors;
  }

  const issues = (
    error as { issues?: Array<{ path?: Array<string>; message: string }> }
  ).issues;

  if (!issues) {
    return fieldErrors;
  }

  for (const issue of issues) {
    const fieldName = issue.path?.[0];

    if (
      fieldName &&
      bookFieldNames.includes(fieldName as (typeof bookFieldNames)[number])
    ) {
      fieldErrors[fieldName as (typeof bookFieldNames)[number]] = issue.message;
    }
  }

  return fieldErrors;
};

export const updateBook = async (input: unknown): Promise<BookActionResult> => {
  const parsed = updateBookSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Fix the highlighted fields and try again.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const { id, ...bookInput } = parsed.data;

  const [existingBook] = await db
    .select({ id: book.id })
    .from(book)
    .where(eq(book.id, id));

  if (!existingBook) {
    return {
      success: false,
      message: "This book could not be found.",
    };
  }

  const [matchedPublisher] = await db
    .select({ id: publisher.id, authorId: publisherAuthor.id })
    .from(publisher)
    .innerJoin(
      publisherAuthor,
      and(
        eq(publisherAuthor.publisherId, publisher.id),
        eq(publisherAuthor.id, bookInput.authorId),
        isNull(publisherAuthor.deletedAt),
      ),
    )
    .where(
      and(eq(publisher.id, bookInput.publisherId), isNull(publisher.deletedAt)),
    );

  if (!matchedPublisher) {
    return {
      success: false,
      message: "Choose an active publisher before saving this book.",
      fieldErrors: {
        publisherId: "Choose an active publisher.",
        authorId: "Choose an author for this publisher.",
      },
    };
  }

  try {
    await db
      .update(book)
      .set(toBookInsertValues(bookInput))
      .where(eq(book.id, id));

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/books");
    revalidatePath("/");
    revalidatePath("/shop");

    return {
      success: true,
      message: "Book updated.",
      data: {
        id,
      },
    };
  } catch {
    return {
      success: false,
      message: "We could not update this book right now. Please try again.",
    };
  }
};
