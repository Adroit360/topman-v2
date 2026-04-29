"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { order } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import {
  orderAdminFieldNames,
  orderAdminSchema,
  type UpdateOrderAdminResult,
} from "../types/order-admin-form";

const toFieldErrors = (
  error: unknown,
): UpdateOrderAdminResult["fieldErrors"] => {
  const fieldErrors: Partial<
    Record<(typeof orderAdminFieldNames)[number], string>
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
      orderAdminFieldNames.includes(
        fieldName as (typeof orderAdminFieldNames)[number],
      )
    ) {
      fieldErrors[fieldName as (typeof orderAdminFieldNames)[number]] =
        issue.message;
    }
  }

  return fieldErrors;
};

export const updateOrderAdminDetails = async (
  input: unknown,
): Promise<UpdateOrderAdminResult> => {
  await requireAdmin();

  const parsed = orderAdminSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Fix the highlighted fields and try again.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const { orderId, deliveryStatus, adminNotes } = parsed.data;

  const [existingOrder] = await db
    .select({ id: order.id })
    .from(order)
    .where(eq(order.id, orderId));

  if (!existingOrder) {
    return {
      success: false,
      message: "This order could not be found.",
    };
  }

  try {
    await db
      .update(order)
      .set({
        deliveryStatus,
        adminNotes,
      })
      .where(eq(order.id, orderId));

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${orderId}`);

    return {
      success: true,
      message: "Order details updated.",
      data: {
        adminNotes,
      },
    };
  } catch {
    return {
      success: false,
      message: "We could not update this order right now. Please try again.",
    };
  }
};
