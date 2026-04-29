import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { env } from "../../../../../data/env";
import { finalizePaystackPayment } from "@/features/checkout/services/finalizePaystackPayment";

type PaystackWebhookEvent = {
  event?: string;
  data?: {
    reference?: string;
    amount?: number;
    status?: string;
    paid_at?: string;
  };
};

const hasValidPaystackSignature = ({
  rawBody,
  signature,
}: {
  rawBody: string;
  signature: string;
}) => {
  const expectedSignature = createHmac("sha512", env.PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");

  const providedBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, expectedBuffer);
};

export const POST = async (request: Request) => {
  const signature = request.headers.get("x-paystack-signature")?.trim();

  if (!signature) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const rawBody = await request.text();

  if (!hasValidPaystackSignature({ rawBody, signature })) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let payload: PaystackWebhookEvent;

  try {
    payload = JSON.parse(rawBody) as PaystackWebhookEvent;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid webhook payload." },
      { status: 400 },
    );
  }

  if (payload.event !== "charge.success") {
    return NextResponse.json({ ok: true, ignored: true }, { status: 200 });
  }

  const reference = payload.data?.reference?.trim();
  const amountMinor = payload.data?.amount;
  const paymentStatus = payload.data?.status;

  if (
    !reference ||
    typeof amountMinor !== "number" ||
    paymentStatus !== "success"
  ) {
    return NextResponse.json(
      { ok: false, message: "Invalid charge.success payload." },
      { status: 400 },
    );
  }

  const finalized = await finalizePaystackPayment({
    reference,
    amountMinor,
    paidAt: payload.data?.paid_at,
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
