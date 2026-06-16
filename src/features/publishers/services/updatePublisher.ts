"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { publisher, publisherAuthor } from "@/db/schema/publisher";
import {
  publisherFieldNames,
  updatePublisherSchema,
  type PublisherActionResult,
} from "../types/publisher-form";

const toFieldErrors = (
  error: unknown,
): PublisherActionResult["fieldErrors"] => {
  const fieldErrors: Partial<
    Record<(typeof publisherFieldNames)[number], string>
  > = {};

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
      publisherFieldNames.includes(
        fieldName as (typeof publisherFieldNames)[number],
      )
    ) {
      fieldErrors[fieldName as (typeof publisherFieldNames)[number]] =
        issue.message;
    }
  }

  return fieldErrors;
};

export const updatePublisher = async (
  input: unknown,
): Promise<PublisherActionResult> => {
  const parsed = updatePublisherSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Fix the highlighted fields and try again.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const { id, ...publisherInput } = parsed.data;

  const [existingPublisher] = await db
    .select({ id: publisher.id })
    .from(publisher)
    .where(and(eq(publisher.id, id), isNull(publisher.deletedAt)));

  if (!existingPublisher) {
    return {
      success: false,
      message: "This publisher could not be found.",
    };
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(publisher)
        .set({
          name: publisherInput.name,
          reference: publisherInput.reference,
          author: publisherInput.authors[0] ?? "Unknown",
        })
        .where(and(eq(publisher.id, id), isNull(publisher.deletedAt)));

      const existingAuthors = await tx
        .select({
          id: publisherAuthor.id,
          name: publisherAuthor.name,
        })
        .from(publisherAuthor)
        .where(
          and(
            eq(publisherAuthor.publisherId, id),
            isNull(publisherAuthor.deletedAt),
          ),
        );

      const nextAuthorKeys = new Set(
        publisherInput.authors.map((authorName) => authorName.toLowerCase()),
      );
      const existingAuthorsByKey = new Map(
        existingAuthors.map((author) => [author.name.toLowerCase(), author]),
      );

      for (const existingAuthor of existingAuthors) {
        if (!nextAuthorKeys.has(existingAuthor.name.toLowerCase())) {
          await tx
            .update(publisherAuthor)
            .set({ deletedAt: new Date() })
            .where(eq(publisherAuthor.id, existingAuthor.id));
        }
      }

      for (const authorName of publisherInput.authors) {
        const existingAuthor = existingAuthorsByKey.get(
          authorName.toLowerCase(),
        );

        if (existingAuthor && existingAuthor.name !== authorName) {
          await tx
            .update(publisherAuthor)
            .set({ name: authorName })
            .where(eq(publisherAuthor.id, existingAuthor.id));
        }
      }

      const authorValues = publisherInput.authors
        .filter(
          (authorName) => !existingAuthorsByKey.has(authorName.toLowerCase()),
        )
        .map((authorName) => ({
          publisherId: id,
          name: authorName,
        }));

      if (authorValues.length > 0) {
        await tx.insert(publisherAuthor).values(authorValues);
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/publishers");

    return {
      success: true,
      message: "Publisher updated.",
      data: {
        publisher: {
          id,
          name: publisherInput.name,
          reference: publisherInput.reference,
          author: publisherInput.authors[0] ?? "Unknown",
          authors: publisherInput.authors.map((authorName) => ({
            id: "",
            publisherId: id,
            name: authorName,
          })),
        },
      },
    };
  } catch {
    return {
      success: false,
      message:
        "We could not update this publisher right now. Please try again.",
    };
  }
};
