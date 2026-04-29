"use server";

import { headers } from "next/headers";
import { inArray } from "drizzle-orm";
import { env } from "../../../../data/env";
import { db } from "@/db";
import { book, order, orderItems } from "@/db/schema";
import { calculateCheckoutPricing } from "./checkoutPricing";
import {
  checkoutFieldNames,
  checkoutServerSchema,
  type CreateCheckoutOrderResult,
} from "../types/checkout";

const toFieldErrors = (
  error: unknown,
): CreateCheckoutOrderResult["fieldErrors"] => {
  const fieldErrors: Partial<
    Record<(typeof checkoutFieldNames)[number], string>
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
      checkoutFieldNames.includes(
        fieldName as (typeof checkoutFieldNames)[number],
      )
    ) {
      fieldErrors[fieldName as (typeof checkoutFieldNames)[number]] =
        issue.message;
    }
  }

  return fieldErrors;
};

const createPaymentReference = () => {
  const suffix = crypto.randomUUID().slice(0, 8);

  return `topman_${Date.now()}_${suffix}`;
};

type PaystackInitializeResponse = {
  status: boolean;
  message: string;
  data?: {
    authorization_url?: string;
    access_code?: string;
    reference?: string;
  };
};

export const createCheckoutOrder = async (
  input: unknown,
): Promise<CreateCheckoutOrderResult> => {
  const parsed = checkoutServerSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Fix the highlighted fields and try again.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const { name, email, phone, location, notes, items } = parsed.data;
  const uniqueBookIds = [...new Set(items.map((item) => item.bookId))];

  try {
    const bookRows = await db
      .select({
        id: book.id,
        price: book.price,
        isAvailable: book.isAvailable,
        title: book.title,
      })
      .from(book)
      .where(inArray(book.id, uniqueBookIds));

    if (bookRows.length !== uniqueBookIds.length) {
      return {
        success: false,
        message:
          "One or more books in your cart could not be found. Refresh your cart and try again.",
      };
    }

    const bookMap = new Map(bookRows.map((bookRow) => [bookRow.id, bookRow]));
    const unavailableBooks = bookRows
      .filter((bookRow) => !bookRow.isAvailable)
      .map((bookRow) => bookRow.title);

    if (unavailableBooks.length > 0) {
      return {
        success: false,
        message: `These books are currently unavailable: ${unavailableBooks.join(", ")}. Update your cart and try again.`,
      };
    }

    const subtotal = items.reduce((total, item) => {
      const matchedBook = bookMap.get(item.bookId);

      if (!matchedBook) {
        return total;
      }

      return total + matchedBook.price * item.quantity;
    }, 0);

    if (subtotal <= 0) {
      return {
        success: false,
        message: "Your cart total is invalid. Refresh and try again.",
      };
    }

    const pricing = calculateCheckoutPricing(subtotal);
    const orderId = crypto.randomUUID();
    const reference = createPaymentReference();
    const forwardedFor = (await headers()).get("x-forwarded-for");
    const ipAddress = forwardedFor?.split(",")[0]?.trim() ?? null;
    const callbackUrl = new URL("/checkout/success", env.BETTER_AUTH_URL);
    callbackUrl.searchParams.set("orderId", orderId);

    await db.transaction(async (tx) => {
      await tx.insert(order).values({
        id: orderId,
        name,
        email,
        userId: null,
        total: pricing.totalDisplay,
        processingFee: pricing.processingFeeDisplay,
        phone,
        deliveryAddress: location,
        notes,
        deliveryCost: 0,
        paymentReference: reference,
        ipAddress,
      });

      await tx.insert(orderItems).values(
        items.map((item) => ({
          id: crypto.randomUUID(),
          quantity: item.quantity,
          bookId: item.bookId,
          orderId,
        })),
      );
    });

    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: pricing.totalMinor,
          reference,
          currency: "GHS",
          callback_url: callbackUrl.toString(),
          metadata: {
            orderId,
            customerName: name,
            customerPhone: phone,
          },
        }),
        cache: "no-store",
      },
    );

    const paystackPayload =
      (await paystackResponse.json()) as PaystackInitializeResponse;

    if (!paystackResponse.ok) {
      return {
        success: false,
        message:
          paystackPayload.message ||
          "We could not connect to Paystack right now. Please try again.",
      };
    }

    const authorizationUrl =
      paystackPayload.data?.authorization_url?.trim() ?? "";

    if (!paystackPayload.status || !authorizationUrl) {
      return {
        success: false,
        message:
          paystackPayload.message ||
          "We could not start your payment session right now. Please try again.",
      };
    }

    return {
      success: true,
      message: "Order created. Complete payment to confirm your checkout.",
      data: {
        orderId,
        reference,
        email,
        amountMinor: pricing.totalMinor,
        customerName: name,
        customerPhone: phone,
        authorizationUrl,
      },
    };
  } catch {
    return {
      success: false,
      message: "We could not start checkout right now. Please try again.",
    };
  }
};
