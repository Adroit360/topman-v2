"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { book } from "@/db/schema/book";
import { publisher } from "@/db/schema/publisher";
import {
  createBookSchema,
  bookFieldNames,
  toBookInsertValues,
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

export const createBook = async (input: unknown): Promise<BookActionResult> => {
  const parsed = createBookSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Fix the highlighted fields and try again.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const [matchedPublisher] = await db
    .select({ id: publisher.id, name: publisher.name })
    .from(publisher)
    .where(
      and(
        eq(publisher.id, parsed.data.publisherId),
        isNull(publisher.deletedAt),
      ),
    );

  if (!matchedPublisher) {
    return {
      success: false,
      message: "Choose an active publisher before saving this book.",
      fieldErrors: {
        publisherId: "Choose an active publisher.",
      },
    };
  }

  try {
    const [createdBook] = await db
      .insert(book)
      .values(toBookInsertValues(parsed.data, matchedPublisher.name))
      .$returningId();

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/books");
    revalidatePath("/");
    revalidatePath("/shop");

    return {
      success: true,
      message: "Book created.",
      data: {
        id: createdBook.id,
      },
    };
  } catch {
    return {
      success: false,
      message: "We could not create this book right now. Please try again.",
    };
  }
};
