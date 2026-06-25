"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { order, orderPayment } from "@/db/schema";
import {
  paymentGatewayValues,
  type PaymentGateway,
} from "../types/payment-gateway";

export type FinalizeCheckoutPaymentInput = {
  gateway: PaymentGateway;
  reference: string;
  amountMinor: number;
  orderId?: string;
  paidAt?: string;
};

export type FinalizeCheckoutPaymentResult = {
  success: boolean;
  message: string;
  code:
    | "paid"
    | "already_paid"
    | "not_found"
    | "amount_mismatch"
    | "invalid_reference";
  data?: {
    orderId: string;
    serialNumber: number;
    reference: string;
    totalAmount: number;
  };
};

export const finalizeCheckoutPayment = async ({
  gateway,
  reference,
  amountMinor,
  orderId,
  paidAt,
}: FinalizeCheckoutPaymentInput): Promise<FinalizeCheckoutPaymentResult> => {
  const trimmedReference = reference.trim();
  const trimmedOrderId = orderId?.trim();

  if (!trimmedReference) {
    return {
      success: false,
      message: "Missing payment reference.",
      code: "invalid_reference",
    };
  }

  const [orderRow] = await db
    .select({
      id: order.id,
      serialNumber: order.serialNumber,
      total: order.total,
      paymentStatus: order.paymentStatus,
      paymentGateway: order.paymentGateway,
    })
    .from(order)
    .where(
      trimmedOrderId
        ? and(
            eq(order.paymentReference, trimmedReference),
            eq(order.id, trimmedOrderId),
          )
        : eq(order.paymentReference, trimmedReference),
    );

  if (!orderRow || orderRow.paymentGateway !== gateway) {
    return {
      success: false,
      message: "We could not find this order. Please try checkout again.",
      code: "not_found",
    };
  }

  const totalAmount = Number(orderRow.total);
  const expectedAmountMinor = Math.round(totalAmount * 100);

  if (amountMinor !== expectedAmountMinor) {
    return {
      success: false,
      message: "Payment amount did not match the expected total.",
      code: "amount_mismatch",
      data: {
        orderId: orderRow.id,
        serialNumber: orderRow.serialNumber,
        reference: trimmedReference,
        totalAmount,
      },
    };
  }

  const [existingPayment] = await db
    .select({
      id: orderPayment.id,
    })
    .from(orderPayment)
    .where(
      and(
        eq(orderPayment.reference, trimmedReference),
        eq(orderPayment.paymentGateway, gateway),
      ),
    );

  if (orderRow.paymentStatus === 1 || existingPayment) {
    return {
      success: true,
      message: "Payment already verified.",
      code: "already_paid",
      data: {
        orderId: orderRow.id,
        serialNumber: orderRow.serialNumber,
        reference: trimmedReference,
        totalAmount,
      },
    };
  }

  await db.transaction(async (tx) => {
    const [transactionOrder] = await tx
      .select({
        id: order.id,
        paymentStatus: order.paymentStatus,
      })
      .from(order)
      .where(eq(order.id, orderRow.id));

    if (!transactionOrder || transactionOrder.paymentStatus === 1) {
      return;
    }

    const [transactionPayment] = await tx
      .select({
        id: orderPayment.id,
      })
      .from(orderPayment)
      .where(
        and(
          eq(orderPayment.reference, trimmedReference),
          eq(orderPayment.paymentGateway, gateway),
        ),
      );

    await tx
      .update(order)
      .set({
        paymentStatus: 1,
        paymentReference: trimmedReference,
        paymentGateway: gateway,
        datePaid: paidAt ?? new Date().toISOString(),
      })
      .where(eq(order.id, orderRow.id));

    if (!transactionPayment) {
      await tx.insert(orderPayment).values({
        id: crypto.randomUUID(),
        reference: trimmedReference,
        paymentGateway: gateway,
        orderId: orderRow.id,
      });
    }
  });

  return {
    success: true,
    message: "Payment confirmed.",
    code: "paid",
    data: {
      orderId: orderRow.id,
      serialNumber: orderRow.serialNumber,
      reference: trimmedReference,
      totalAmount,
    },
  };
};

export const finalizePaystackPayment = async (
  input: Omit<FinalizeCheckoutPaymentInput, "gateway">,
) =>
  finalizeCheckoutPayment({
    ...input,
    gateway: paymentGatewayValues.paystack,
  });
