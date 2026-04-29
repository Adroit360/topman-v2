"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { bookListUpload } from "@/db/schema/book-list-upload";
import {
  updateListOrderStatusSchema,
  type UpdateListOrderStatusResult,
} from "../types/list-order";

export const updateListOrderStatus = async (
  input: unknown,
): Promise<UpdateListOrderStatusResult> => {
  const parsed = updateListOrderStatusSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Fix the highlighted fields and try again.",
    };
  }

  const { id, status } = parsed.data;

  const [existingItem] = await db
    .select({ id: bookListUpload.id })
    .from(bookListUpload)
    .where(eq(bookListUpload.id, id));

  if (!existingItem) {
    return {
      success: false,
      message: "This list order could not be found.",
    };
  }

  try {
    await db
      .update(bookListUpload)
      .set({
        status,
      })
      .where(eq(bookListUpload.id, id));

    revalidatePath("/dashboard/list");

    return {
      success: true,
      message: "Status updated.",
    };
  } catch {
    return {
      success: false,
      message:
        "We could not update this list order right now. Please try again.",
    };
  }
};
