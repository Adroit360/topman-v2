"use server";

import { headers } from "next/headers";
import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { book, order, orderItems } from "@/db/schema";
import { calculateCheckoutPricing } from "./checkoutPricing";
import { getActivePaymentGateway } from "./paymentGatewaySettings";
import { initializePayment } from "./paymentProviders";
import {
  checkoutFieldNames,
  checkoutServerSchema,
  type CreateCheckoutOrderResult,
} from "../types/checkout";
import {
  paymentGatewayValues,
  type PaymentGateway,
} from "../types/payment-gateway";

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

const createPaystackPaymentReference = () => {
  const suffix = crypto.randomUUID().slice(0, 8);

  return `topman_${Date.now()}_${suffix}`;
};

const createHubtelPaymentReference = () => {
  const timestamp = Date.now().toString(36);
  const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 8);

  return `tm_${timestamp}_${suffix}`;
};

const createPaymentReference = (gateway: PaymentGateway) => {
  if (gateway === paymentGatewayValues.hubtel) {
    return createHubtelPaymentReference();
  }

  return createPaystackPaymentReference();
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
    const paymentGateway = await getActivePaymentGateway();
    const reference = createPaymentReference(paymentGateway);
    const forwardedFor = (await headers()).get("x-forwarded-for");
    const ipAddress = forwardedFor?.split(",")[0]?.trim() ?? null;

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
        paymentGateway,
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

    const paymentSession = await initializePayment({
      gateway: paymentGateway,
      orderId,
      reference,
      email,
      amountMinor: pricing.totalMinor,
      amountDisplay: pricing.totalAmount,
      customerName: name,
      customerPhone: phone,
    });

    return {
      success: true,
      message: "Order created. Complete payment to confirm your checkout.",
      data: {
        orderId,
        reference,
        gateway: paymentGateway,
        email,
        amountMinor: pricing.totalMinor,
        customerName: name,
        customerPhone: phone,
        authorizationUrl: paymentSession.authorizationUrl,
      },
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error && error.message
          ? error.message
          : "We could not start checkout right now. Please try again.",
    };
  }
};
