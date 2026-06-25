"use server";

import { env } from "../../../../data/env";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { order } from "@/db/schema";
import { finalizeCheckoutPayment } from "./finalizeCheckoutPayment";
import { formatPrice } from "./checkoutPricing";
import type { VerifyCheckoutPaymentResult } from "../types/checkout";
import {
  isPaymentGateway,
  paymentGatewayValues,
  type PaymentGateway,
} from "../types/payment-gateway";

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

type HubtelStatusCheckResponse = {
  message?: string;
  responseCode?: string;
  data?: {
    date?: string;
    status?: string;
    transactionId?: string;
    externalTransactionId?: string;
    paymentMethod?: string;
    clientReference?: string;
    currencyCode?: string | null;
    amount?: number;
    charges?: number;
    amountAfterCharges?: number;
    isFulfilled?: boolean | null;
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

const getStoredPaymentGateway = async ({
  orderId,
  reference,
}: {
  orderId: string;
  reference: string;
}): Promise<PaymentGateway | null> => {
  const [orderRow] = await db
    .select({ paymentGateway: order.paymentGateway })
    .from(order)
    .where(
      and(eq(order.id, orderId), eq(order.paymentReference, reference)),
    );

  if (!orderRow || !isPaymentGateway(orderRow.paymentGateway)) {
    return null;
  }

  return orderRow.paymentGateway;
};

const getHubtelAuthorizationHeader = () => {
  if (
    !env.HUBTEL_CLIENT_ID ||
    !env.HUBTEL_CLIENT_SECRET ||
    !env.HUBTEL_MERCHANT_ACCOUNT_NUMBER
  ) {
    throw new Error("Hubtel credentials are not configured.");
  }

  const credentials = Buffer.from(
    `${env.HUBTEL_CLIENT_ID}:${env.HUBTEL_CLIENT_SECRET}`,
  ).toString("base64");

  return `Basic ${credentials}`;
};

const verifyPaystackPayment = async ({
  orderId,
  reference,
}: {
  orderId: string;
  reference: string;
}): Promise<VerifyCheckoutPaymentResult> => {
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
      message: "Payment verification failed. Please contact support if charged.",
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

  const finalized = await finalizeCheckoutPayment({
    gateway: paymentGatewayValues.paystack,
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
};

const verifyHubtelPayment = async ({
  orderId,
  reference,
}: {
  orderId: string;
  reference: string;
}): Promise<VerifyCheckoutPaymentResult> => {
  const url = new URL(
    `https://api-txnstatus.hubtel.com/transactions/${encodeURIComponent(
      env.HUBTEL_MERCHANT_ACCOUNT_NUMBER ?? "",
    )}/status`,
  );
  url.searchParams.set("clientReference", reference);

  const response = await fetch(url, {
    headers: {
      Authorization: getHubtelAuthorizationHeader(),
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      success: false,
      message: "Payment verification failed. Please contact support if charged.",
    };
  }

  const payload = (await response.json()) as HubtelStatusCheckResponse;
  const amount = payload.data?.amount;

  if (
    payload.responseCode !== "0000" ||
    payload.data?.status !== "Paid" ||
    payload.data.clientReference !== reference ||
    typeof amount !== "number"
  ) {
    return {
      success: false,
      message: payload.message || "Payment was not completed successfully.",
    };
  }

  const finalized = await finalizeCheckoutPayment({
    gateway: paymentGatewayValues.hubtel,
    orderId,
    reference,
    amountMinor: Math.round(amount * 100),
    paidAt: payload.data.date,
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
};

export const verifyCheckoutPayment = async (input: {
  orderId?: string;
  reference?: string;
}): Promise<VerifyCheckoutPaymentResult> => {
  try {
    const { orderId, reference } = paymentVerificationSchema.parse(input);
    const gateway = await getStoredPaymentGateway({ orderId, reference });

    if (!gateway) {
      return {
        success: false,
        message: "We could not find this order. Please try checkout again.",
      };
    }

    if (gateway === paymentGatewayValues.hubtel) {
      return verifyHubtelPayment({ orderId, reference });
    }

    return verifyPaystackPayment({ orderId, reference });
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error && error.message
          ? error.message
          : "We could not verify your payment right now. Please try again.",
    };
  }
};
