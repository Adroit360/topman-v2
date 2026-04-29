"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { publisher } from "@/db/schema/publisher";
import {
  deletePublisherSchema,
  type DeletePublisherResult,
} from "../types/publisher-form";

export const deletePublisher = async (
  input: unknown,
): Promise<DeletePublisherResult> => {
  const parsed = deletePublisherSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "This publisher could not be deleted because its id is missing.",
    };
  }

  const { id } = parsed.data;

  const [existingPublisher] = await db
    .select({ id: publisher.id, name: publisher.name })
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
      .set({ deletedAt: new Date() })
      .where(and(eq(publisher.id, id), isNull(publisher.deletedAt)));

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/publishers");

    return {
      success: true,
      message: `${existingPublisher.name} was moved to deleted publishers.`,
    };
  } catch {
    return {
      success: false,
      message:
        "We could not delete this publisher right now. Please try again.",
    };
  }
};
