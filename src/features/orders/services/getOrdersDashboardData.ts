import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import { endOfDay, startOfDay } from "date-fns";
import { db } from "@/db";
import { order } from "@/db/schema";
import {
  deliveryStatusValues,
  paymentStatusValues,
  type OrdersDateRangeFilter,
  type DeliveryStatusValue,
  type OrdersPagination,
  type OrderStats,
  type PaymentStatusValue,
  type OrdersTableRow,
} from "../types/order";

type OrdersDashboardData = {
  stats: OrderStats;
  orders: OrdersTableRow[];
  pagination: OrdersPagination;
};

type GetOrdersDashboardDataOptions = {
  deliveryStatus?: DeliveryStatusValue;
  fromDate?: OrdersDateRangeFilter["from"];
  toDate?: OrdersDateRangeFilter["to"];
  page?: number;
  pageSize?: number;
};

const buildOrdersWhereClause = ({
  deliveryStatus,
  fromDate,
  toDate,
}: {
  deliveryStatus?: DeliveryStatusValue;
  fromDate?: Date;
  toDate?: Date;
}) => {
  const filters = [eq(order.paymentStatus, paymentStatusValues.paid)];

  if (deliveryStatus !== undefined) {
    filters.push(eq(order.deliveryStatus, deliveryStatus));
  }

  if (fromDate) {
    filters.push(gte(order.createdAt, startOfDay(fromDate)));
  }

  if (toDate) {
    filters.push(lte(order.createdAt, endOfDay(toDate)));
  }

  if (filters.length === 0) {
    return sql`1 = 1`;
  }

  if (filters.length === 1) {
    return filters[0];
  }

  return and(...filters);
};

export const getOrdersDashboardData = async ({
  deliveryStatus,
  fromDate,
  toDate,
  page = 1,
  pageSize = 10,
}: GetOrdersDashboardDataOptions = {}): Promise<OrdersDashboardData> => {
  const whereClause = buildOrdersWhereClause({
    deliveryStatus,
    fromDate,
    toDate,
  });

  const [statsRow] = await db
    .select({
      totalOrders: count().mapWith(Number),
      pendingOrders:
        sql<number>`coalesce(sum(case when ${order.deliveryStatus} = ${deliveryStatusValues.pending} then 1 else 0 end), 0)`.mapWith(
          Number,
        ),
      paidOrders:
        sql<number>`coalesce(sum(case when ${order.paymentStatus} = ${paymentStatusValues.paid} then 1 else 0 end), 0)`.mapWith(
          Number,
        ),
      totalRevenue:
        sql<number>`coalesce(sum(case when ${order.paymentStatus} = ${paymentStatusValues.paid} then ${order.total} else 0 end), 0)`.mapWith(
          Number,
        ),
    })
    .from(order)
    .where(whereClause);

  const [totalItemsRow] = await db
    .select({ value: count() })
    .from(order)
    .where(whereClause);

  const totalItems = totalItemsRow?.value ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const offset = (currentPage - 1) * pageSize;

  const orderRows = await db
    .select({
      id: order.id,
      serialNumber: order.serialNumber,
      customerName: order.name,
      email: order.email,
      phone: order.phone,
      total: order.total,
      paymentStatus: order.paymentStatus,
      deliveryStatus: order.deliveryStatus,
      address: order.deliveryAddress,
      createdAt: order.createdAt,
    })
    .from(order)
    .where(whereClause)
    .limit(pageSize)
    .offset(offset)
    .orderBy(desc(order.createdAt));

  return {
    stats: {
      totalOrders: statsRow?.totalOrders ?? 0,
      pendingOrders: statsRow?.pendingOrders ?? 0,
      paidOrders: statsRow?.paidOrders ?? 0,
      totalRevenue: statsRow?.totalRevenue ?? 0,
    },
    pagination: {
      currentPage,
      pageSize,
      totalItems,
      totalPages,
    },
    orders: orderRows.map((orderRow) => ({
      id: orderRow.id,
      serialNumber: orderRow.serialNumber,
      customerName: orderRow.customerName,
      email: orderRow.email,
      phone: orderRow.phone,
      total: Number(orderRow.total),
      paymentStatus: orderRow.paymentStatus as PaymentStatusValue,
      deliveryStatus: orderRow.deliveryStatus as DeliveryStatusValue,
      address: orderRow.address,
      createdAt: orderRow.createdAt,
    })),
  };
};
