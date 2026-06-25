"use server";

import { env } from "../../../../data/env";
import {
  paymentGatewayValues,
  type PaymentGateway,
} from "../types/payment-gateway";

type InitializePaymentInput = {
  gateway: PaymentGateway;
  orderId: string;
  reference: string;
  email: string;
  amountMinor: number;
  amountDisplay: number;
  customerName: string;
  customerPhone: string;
};

type InitializePaymentResult = {
  authorizationUrl: string;
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

type HubtelInitializeResponse = {
  responseCode?: string;
  status?: string;
  data?: {
    checkoutUrl?: string;
    checkoutId?: string;
    clientReference?: string;
    message?: string;
    checkoutDirectUrl?: string;
  };
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

const initializePaystackPayment = async ({
  orderId,
  reference,
  email,
  amountMinor,
  customerName,
  customerPhone,
}: InitializePaymentInput): Promise<InitializePaymentResult> => {
  const callbackUrl = new URL("/checkout/success", env.BETTER_AUTH_URL);
  callbackUrl.searchParams.set("orderId", orderId);

  const response = await fetch(
    "https://api.paystack.co/transaction/initialize",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amountMinor,
        reference,
        currency: "GHS",
        callback_url: callbackUrl.toString(),
        metadata: {
          orderId,
          customerName,
          customerPhone,
        },
      }),
      cache: "no-store",
    },
  );

  const payload = (await response.json()) as PaystackInitializeResponse;

  if (!response.ok) {
    throw new Error(
      payload.message ||
        "We could not connect to Paystack right now. Please try again.",
    );
  }

  const authorizationUrl = payload.data?.authorization_url?.trim() ?? "";

  if (!payload.status || !authorizationUrl) {
    throw new Error(
      payload.message ||
        "We could not start your payment session right now. Please try again.",
    );
  }

  return {
    authorizationUrl,
  };
};

const initializeHubtelPayment = async ({
  orderId,
  reference,
  email,
  amountDisplay,
  customerName,
  customerPhone,
}: InitializePaymentInput): Promise<InitializePaymentResult> => {
  const callbackUrl = new URL("/api/hubtel/webhook", env.BETTER_AUTH_URL);
  const returnUrl = new URL("/checkout/success", env.BETTER_AUTH_URL);
  returnUrl.searchParams.set("orderId", orderId);
  returnUrl.searchParams.set("reference", reference);

  const cancellationUrl = new URL("/checkout", env.BETTER_AUTH_URL);

  const response = await fetch("https://payproxyapi.hubtel.com/items/initiate", {
    method: "POST",
    headers: {
      Authorization: getHubtelAuthorizationHeader(),
      Accept: "application/json",
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
    body: JSON.stringify({
      totalAmount: Number(amountDisplay.toFixed(2)),
      description: "Book Shop Checkout",
      callbackUrl: callbackUrl.toString(),
      returnUrl: returnUrl.toString(),
      merchantAccountNumber: env.HUBTEL_MERCHANT_ACCOUNT_NUMBER,
      cancellationUrl: cancellationUrl.toString(),
      clientReference: reference,
      payeeName: customerName,
      payeeMobileNumber: customerPhone,
      payeeEmail: email,
    }),
    cache: "no-store",
  });

  const payload = (await response.json()) as HubtelInitializeResponse;

  if (!response.ok || payload.responseCode !== "0000") {
    throw new Error(
      payload.data?.message ||
        "We could not connect to Hubtel right now. Please try again.",
    );
  }

  const authorizationUrl = payload.data?.checkoutUrl?.trim() ?? "";

  if (!authorizationUrl) {
    throw new Error(
      payload.data?.message ||
        "We could not start your Hubtel checkout session right now. Please try again.",
    );
  }

  return {
    authorizationUrl,
  };
};

export const initializePayment = async (
  input: InitializePaymentInput,
): Promise<InitializePaymentResult> => {
  if (input.gateway === paymentGatewayValues.hubtel) {
    return initializeHubtelPayment(input);
  }

  return initializePaystackPayment(input);
};
