import "server-only";

import { desc, eq } from "drizzle-orm";
import { isValid, parseISO } from "date-fns";
import { db } from "@/db";
import { order, orderPayment } from "@/db/schema";
import type { PaymentTableRow } from "../types/payment";

const toPaidAt = (value: string | null, fallback: Date) => {
  if (!value) {
    return fallback;
  }

  const parsedDate = parseISO(value);

  return isValid(parsedDate) ? parsedDate : fallback;
};

export const getPaymentsDashboardData = async (): Promise<
  PaymentTableRow[]
> => {
  const rows = await db
    .select({
      id: orderPayment.id,
      reference: orderPayment.reference,
      createdAt: orderPayment.createdAt,
      orderId: order.id,
      orderSerialNumber: order.serialNumber,
      customerName: order.name,
      email: order.email,
      phone: order.phone,
      total: order.total,
      datePaid: order.datePaid,
    })
    .from(orderPayment)
    .innerJoin(order, eq(orderPayment.orderId, order.id))
    .where(eq(order.paymentStatus, 1))
    .orderBy(desc(orderPayment.createdAt));

  return rows.map((row) => ({
    id: row.id,
    reference: row.reference,
    orderId: row.orderId,
    orderSerialNumber: row.orderSerialNumber,
    customerName: row.customerName,
    email: row.email,
    phone: row.phone,
    total: Number(row.total),
    paidAt: toPaidAt(row.datePaid, row.createdAt),
    createdAt: row.createdAt,
  }));
};
