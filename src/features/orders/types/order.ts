import { format, isValid, parseISO } from "date-fns";

export const deliveryStatusValues = {
  pending: 0,
  processing: 1,
  shipped: 2,
  delivered: 3,
  cancelled: 4,
} as const;

export const paymentStatusValues = {
  unpaid: 0,
  paid: 1,
} as const;

export type DeliveryStatusValue =
  (typeof deliveryStatusValues)[keyof typeof deliveryStatusValues];

export type PaymentStatusValue =
  (typeof paymentStatusValues)[keyof typeof paymentStatusValues];

export type OrderStatusOption = {
  label: string;
  value: DeliveryStatusValue;
  slug: string;
};

export const deliveryStatusOptions: OrderStatusOption[] = [
  {
    label: "Pending",
    value: deliveryStatusValues.pending,
    slug: "pending",
  },
  {
    label: "Processing",
    value: deliveryStatusValues.processing,
    slug: "processing",
  },
  {
    label: "Shipped",
    value: deliveryStatusValues.shipped,
    slug: "shipped",
  },
  {
    label: "Delivered",
    value: deliveryStatusValues.delivered,
    slug: "delivered",
  },
  {
    label: "Cancelled",
    value: deliveryStatusValues.cancelled,
    slug: "cancelled",
  },
];

export const deliveryStatusSlugMap = new Map(
  deliveryStatusOptions.map((option) => [option.slug, option.value]),
);

export const deliveryStatusLabelMap = new Map(
  deliveryStatusOptions.map((option) => [option.value, option.label]),
);

export type OrderStats = {
  totalOrders: number;
  pendingOrders: number;
  paidOrders: number;
  totalRevenue: number;
};

export type OrdersPagination = {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type OrdersDateRangeFilter = {
  from?: Date;
  to?: Date;
  fromValue?: string;
  toValue?: string;
};

export type OrdersTableRow = {
  id: string;
  serialNumber: number;
  customerName: string;
  email: string;
  phone: string;
  total: number;
  address: string;
  paymentStatus: PaymentStatusValue;
  deliveryStatus: DeliveryStatusValue;
  createdAt: Date;
};

export type OrderDetailItem = {
  id: string;
  bookId: string;
  title: string;
  publisherName: string;
  image: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type OrderDetail = {
  id: string;
  serialNumber: number;
  paymentReceiptId: string | null;
  customerName: string;
  email: string;
  phone: string;
  deliveryAddress: string;
  total: number;
  processingFee: number;
  deliveryCost: number;
  paymentStatus: PaymentStatusValue;
  deliveryStatus: DeliveryStatusValue;
  paymentReference: string | null;
  datePaid: string | null;
  ipAddress: string | null;
  customerNotes: string | null;
  adminNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: OrderDetailItem[];
};

export const parseDeliveryStatusFilter = (
  value: string | string[] | undefined,
): DeliveryStatusValue | undefined => {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (!rawValue) {
    return undefined;
  }

  return deliveryStatusSlugMap.get(rawValue);
};

export const parseOrdersPage = (value: string | string[] | undefined) => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const parsedPage = Number(rawValue);

  if (!Number.isInteger(parsedPage) || parsedPage < 1) {
    return 1;
  }

  return parsedPage;
};

const parseOrdersDate = (value: string | string[] | undefined) => {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (!rawValue) {
    return undefined;
  }

  const parsedDate = parseISO(rawValue);

  if (!isValid(parsedDate)) {
    return undefined;
  }

  return parsedDate;
};

export const parseOrdersDateRange = ({
  from,
  to,
}: {
  from?: string | string[];
  to?: string | string[];
}): OrdersDateRangeFilter => {
  const fromDate = parseOrdersDate(from);
  const toDate = parseOrdersDate(to);

  return {
    from: fromDate,
    to: toDate,
    fromValue: fromDate ? format(fromDate, "yyyy-MM-dd") : undefined,
    toValue: toDate ? format(toDate, "yyyy-MM-dd") : undefined,
  };
};

export const getDeliveryStatusLabel = (value: DeliveryStatusValue) => {
  return deliveryStatusLabelMap.get(value) ?? "Pending";
};

export const getPaymentStatusLabel = (value: PaymentStatusValue) => {
  return value === paymentStatusValues.paid ? "Paid" : "Unpaid";
};

export const formatOrderNumber = (serialNumber: number) => {
  return `TMB-${serialNumber}`;
};
