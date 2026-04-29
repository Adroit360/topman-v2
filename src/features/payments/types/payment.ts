import type { OrderDetailItem } from "@/features/orders/types/order";

export type PaymentTableRow = {
  id: string;
  reference: string;
  orderId: string;
  orderSerialNumber: number;
  customerName: string;
  email: string;
  phone: string;
  total: number;
  paidAt: Date;
  createdAt: Date;
};

export type PaymentReceiptDetail = {
  id: string;
  reference: string;
  orderId: string;
  orderSerialNumber: number;
  customerName: string;
  email: string;
  phone: string;
  deliveryAddress: string;
  total: number;
  processingFee: number;
  deliveryCost: number;
  paidAt: Date;
  createdAt: Date;
  items: OrderDetailItem[];
};
