"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { publisher } from "@/db/schema/publisher";
import {
  createPublisherSchema,
  publisherFieldNames,
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

export const createPublisher = async (
  input: unknown,
): Promise<PublisherActionResult> => {
  const parsed = createPublisherSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Fix the highlighted fields and try again.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  try {
    const [createdPublisher] = await db
      .insert(publisher)
      .values(parsed.data)
      .$returningId();

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/publishers");

    return {
      success: true,
      message: "Publisher created.",
      data: {
        publisher: {
          id: createdPublisher.id,
          ...parsed.data,
        },
      },
    };
  } catch {
    return {
      success: false,
      message:
        "We could not create this publisher right now. Please try again.",
    };
  }
};
