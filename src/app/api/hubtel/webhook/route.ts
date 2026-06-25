import { NextResponse } from "next/server";
import { finalizeCheckoutPayment } from "@/features/checkout/services/finalizeCheckoutPayment";
import { paymentGatewayValues } from "@/features/checkout/types/payment-gateway";

type HubtelWebhookEvent = {
  ResponseCode?: string;
  Status?: string;
  Data?: {
    CheckoutId?: string;
    SalesInvoiceId?: string;
    ClientReference?: string;
    Status?: string;
    Amount?: number;
    CustomerPhoneNumber?: string;
    Description?: string;
  };
};

export const POST = async (request: Request) => {
  let payload: HubtelWebhookEvent;

  try {
    payload = (await request.json()) as HubtelWebhookEvent;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid webhook payload." },
      { status: 400 },
    );
  }

  const reference = payload.Data?.ClientReference?.trim();
  const amount = payload.Data?.Amount;

  if (
    payload.ResponseCode !== "0000" ||
    payload.Data?.Status !== "Success" ||
    !reference ||
    typeof amount !== "number"
  ) {
    return NextResponse.json({ ok: true, ignored: true }, { status: 200 });
  }

  const finalized = await finalizeCheckoutPayment({
    gateway: paymentGatewayValues.hubtel,
    reference,
    amountMinor: Math.round(amount * 100),
  });

  if (!finalized.success) {
    const status =
      finalized.code === "not_found" || finalized.code === "amount_mismatch"
        ? 400
        : 422;

    return NextResponse.json(
      {
        ok: false,
        message: finalized.message,
      },
      { status },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      status: finalized.code,
      orderId: finalized.data?.orderId,
      reference: finalized.data?.reference,
    },
    { status: 200 },
  );
};
