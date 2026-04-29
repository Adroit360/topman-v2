import { eq } from "drizzle-orm";
import { db } from "@/db";
import { book, order, orderItems, orderPayment, publisher } from "@/db/schema";
import {
  type DeliveryStatusValue,
  type OrderDetail,
  type PaymentStatusValue,
} from "../types/order";

export const getOrderById = async (
  orderId: string,
): Promise<OrderDetail | null> => {
  const [orderRow] = await db
    .select({
      id: order.id,
      serialNumber: order.serialNumber,
      customerName: order.name,
      email: order.email,
      phone: order.phone,
      deliveryAddress: order.deliveryAddress,
      total: order.total,
      processingFee: order.processingFee,
      deliveryCost: order.deliveryCost,
      paymentStatus: order.paymentStatus,
      deliveryStatus: order.deliveryStatus,
      paymentReference: order.paymentReference,
      datePaid: order.datePaid,
      ipAddress: order.ipAddress,
      customerNotes: order.notes,
      adminNotes: order.adminNotes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    })
    .from(order)
    .where(eq(order.id, orderId));

  if (!orderRow) {
    return null;
  }

  const [paymentRow] = await db
    .select({
      id: orderPayment.id,
    })
    .from(orderPayment)
    .where(eq(orderPayment.orderId, orderId));

  const orderItemRows = await db
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
    .where(eq(orderItems.orderId, orderId));

  return {
    id: orderRow.id,
    serialNumber: orderRow.serialNumber,
    paymentReceiptId: paymentRow?.id ?? null,
    customerName: orderRow.customerName,
    email: orderRow.email,
    phone: orderRow.phone,
    deliveryAddress: orderRow.deliveryAddress,
    total: Number(orderRow.total),
    processingFee: Number(orderRow.processingFee),
    deliveryCost: orderRow.deliveryCost,
    paymentStatus: orderRow.paymentStatus as PaymentStatusValue,
    deliveryStatus: orderRow.deliveryStatus as DeliveryStatusValue,
    paymentReference: orderRow.paymentReference,
    datePaid: orderRow.datePaid,
    ipAddress: orderRow.ipAddress,
    customerNotes: orderRow.customerNotes,
    adminNotes: orderRow.adminNotes,
    createdAt: orderRow.createdAt,
    updatedAt: orderRow.updatedAt,
    items: orderItemRows.map((item) => ({
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
