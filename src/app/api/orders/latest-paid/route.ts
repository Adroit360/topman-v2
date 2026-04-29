import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { order, orderPayment } from "@/db/schema";
import {
  formatOrderNumber,
  paymentStatusValues,
} from "@/features/orders/types/order";

export const GET = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized." },
      { status: 401 },
    );
  }

  if ((session.user as { role?: number }).role !== 1) {
    return NextResponse.json(
      { success: false, message: "Forbidden." },
      { status: 403 },
    );
  }

  const [latestPaidOrder] = await db
    .select({
      paymentId: orderPayment.id,
      orderId: order.id,
      serialNumber: order.serialNumber,
      customerName: order.name,
      total: order.total,
      paidAt: order.datePaid,
      createdAt: orderPayment.createdAt,
    })
    .from(orderPayment)
    .innerJoin(order, eq(orderPayment.orderId, order.id))
    .where(eq(order.paymentStatus, paymentStatusValues.paid))
    .orderBy(desc(orderPayment.createdAt))
    .limit(1);

  if (!latestPaidOrder) {
    return NextResponse.json({ success: true, data: null }, { status: 200 });
  }

  return NextResponse.json(
    {
      success: true,
      data: {
        paymentId: latestPaidOrder.paymentId,
        orderId: latestPaidOrder.orderId,
        orderNumber: formatOrderNumber(latestPaidOrder.serialNumber),
        customerName: latestPaidOrder.customerName,
        total: Number(latestPaidOrder.total),
        paidAt:
          latestPaidOrder.paidAt ?? latestPaidOrder.createdAt.toISOString(),
      },
    },
    { status: 200 },
  );
};
