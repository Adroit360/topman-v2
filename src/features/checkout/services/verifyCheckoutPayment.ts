"use server";

import { env } from "../../../../data/env";
import { formatPrice } from "./checkoutPricing";
import { finalizePaystackPayment } from "./finalizePaystackPayment";
import type { VerifyCheckoutPaymentResult } from "../types/checkout";

type PaystackVerificationResponse = {
  status: boolean;
  message: string;
  data?: {
    status?: string;
    reference?: string;
    amount?: number;
    paid_at?: string;
  };
};

const paymentVerificationSchema = {
  parse: (input: { orderId?: string; reference?: string }) => {
    const orderId = input.orderId?.trim();
    const reference = input.reference?.trim();

    if (!orderId || !reference) {
      throw new Error("Missing payment reference.");
    }

    return { orderId, reference };
  },
};

export const verifyCheckoutPayment = async (input: {
  orderId?: string;
  reference?: string;
}): Promise<VerifyCheckoutPaymentResult> => {
  try {
    const { orderId, reference } = paymentVerificationSchema.parse(input);
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return {
        success: false,
        message:
          "Payment verification failed. Please contact support if charged.",
      };
    }

    const payload = (await response.json()) as PaystackVerificationResponse;

    if (
      !payload.status ||
      payload.data?.status !== "success" ||
      payload.data.reference !== reference ||
      typeof payload.data.amount !== "number"
    ) {
      return {
        success: false,
        message: payload.message || "Payment was not completed successfully.",
      };
    }

    const finalized = await finalizePaystackPayment({
      orderId,
      reference,
      amountMinor: payload.data.amount,
      paidAt: payload.data.paid_at,
    });

    if (!finalized.success || !finalized.data) {
      return {
        success: false,
        message: finalized.message,
      };
    }

    return {
      success: true,
      message: `Payment confirmed. Your order total of GHS ${formatPrice(finalized.data.totalAmount)} has been recorded.`,
      data: {
        orderId: finalized.data.orderId,
        serialNumber: finalized.data.serialNumber,
        reference: finalized.data.reference,
      },
    };
  } catch {
    return {
      success: false,
      message: "We could not verify your payment right now. Please try again.",
    };
  }
};
