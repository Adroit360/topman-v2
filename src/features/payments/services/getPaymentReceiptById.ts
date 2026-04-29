import "server-only";

import { eq } from "drizzle-orm";
import { isValid, parseISO } from "date-fns";
import { db } from "@/db";
import { book, order, orderItems, orderPayment, publisher } from "@/db/schema";
import type { PaymentReceiptDetail } from "../types/payment";

const toPaidAt = (value: string | null, fallback: Date) => {
  if (!value) {
    return fallback;
  }

  const parsedDate = parseISO(value);

  return isValid(parsedDate) ? parsedDate : fallback;
};

export const getPaymentReceiptById = async (
  paymentId: string,
): Promise<PaymentReceiptDetail | null> => {
  const [paymentRow] = await db
    .select({
      id: orderPayment.id,
      reference: orderPayment.reference,
      createdAt: orderPayment.createdAt,
      orderId: order.id,
      orderSerialNumber: order.serialNumber,
      customerName: order.name,
      email: order.email,
      phone: order.phone,
      deliveryAddress: order.deliveryAddress,
      total: order.total,
      processingFee: order.processingFee,
      deliveryCost: order.deliveryCost,
      datePaid: order.datePaid,
    })
    .from(orderPayment)
    .innerJoin(order, eq(orderPayment.orderId, order.id))
    .where(eq(orderPayment.id, paymentId));

  if (!paymentRow) {
    return null;
  }

  const itemRows = await db
    .select({
      id: orderItems.id,
      bookId: orderItems.bookId,
      quantity: orderItems.quantity,
      title: book.title,
      publisherName: publisher.name,
      image: book.image,
      unitPrice: book.price,
    })
    .from(orderItems)
    .innerJoin(book, eq(orderItems.bookId, book.id))
    .innerJoin(publisher, eq(book.publisherId, publisher.id))
    .where(eq(orderItems.orderId, paymentRow.orderId));

  return {
    id: paymentRow.id,
    reference: paymentRow.reference,
    orderId: paymentRow.orderId,
    orderSerialNumber: paymentRow.orderSerialNumber,
    customerName: paymentRow.customerName,
    email: paymentRow.email,
    phone: paymentRow.phone,
    deliveryAddress: paymentRow.deliveryAddress,
    total: Number(paymentRow.total),
    processingFee: Number(paymentRow.processingFee),
    deliveryCost: paymentRow.deliveryCost,
    paidAt: toPaidAt(paymentRow.datePaid, paymentRow.createdAt),
    createdAt: paymentRow.createdAt,
    items: itemRows.map((item) => ({
      id: item.id,
      bookId: item.bookId,
      title: item.title,
      publisherName: item.publisherName,
      image: item.image,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.unitPrice * item.quantity,
    })),
  };
};
