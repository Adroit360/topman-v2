"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { paymentGatewaySetting } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import {
  isPaymentGateway,
  paymentGatewayValues,
  type PaymentGateway,
} from "../types/payment-gateway";

const singletonGatewaySettingId = "default";

export type PaymentGatewaySettingsResult = {
  success: boolean;
  message: string;
  data?: {
    gateway: PaymentGateway;
  };
  fieldErrors?: {
    gateway?: string;
  };
};

export const getActivePaymentGateway = async (): Promise<PaymentGateway> => {
  const [setting] = await db
    .select({ gateway: paymentGatewaySetting.gateway })
    .from(paymentGatewaySetting)
    .where(eq(paymentGatewaySetting.id, singletonGatewaySettingId));

  if (setting && isPaymentGateway(setting.gateway)) {
    return setting.gateway;
  }

  await db
    .insert(paymentGatewaySetting)
    .values({
      id: singletonGatewaySettingId,
      gateway: paymentGatewayValues.paystack,
    })
    .$returningId()
    .catch(() => []);

  return paymentGatewayValues.paystack;
};

export const updateActivePaymentGateway = async (
  input: unknown,
): Promise<PaymentGatewaySettingsResult> => {
  await requireAdmin();

  const gateway =
    typeof input === "object" && input && "gateway" in input
      ? String((input as { gateway?: unknown }).gateway ?? "").trim()
      : "";

  if (!isPaymentGateway(gateway)) {
    return {
      success: false,
      message: "Choose a supported payment gateway.",
      fieldErrors: {
        gateway: "Choose Paystack or Hubtel.",
      },
    };
  }

  const [existingSetting] = await db
    .select({ id: paymentGatewaySetting.id })
    .from(paymentGatewaySetting)
    .where(eq(paymentGatewaySetting.id, singletonGatewaySettingId));

  if (existingSetting) {
    await db
      .update(paymentGatewaySetting)
      .set({ gateway })
      .where(eq(paymentGatewaySetting.id, singletonGatewaySettingId));
  } else {
    await db.insert(paymentGatewaySetting).values({
      id: singletonGatewaySettingId,
      gateway,
    });
  }

  revalidatePath("/dashboard/settings/payments");

  return {
    success: true,
    message: "Payment gateway updated.",
    data: {
      gateway,
    },
  };
};
