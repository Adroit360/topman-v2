"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { publisher } from "@/db/schema/publisher";
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
    await db
      .update(publisher)
      .set(publisherInput)
      .where(and(eq(publisher.id, id), isNull(publisher.deletedAt)));

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/publishers");

    return {
      success: true,
      message: "Publisher updated.",
      data: {
        publisher: {
          id,
          ...publisherInput,
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
