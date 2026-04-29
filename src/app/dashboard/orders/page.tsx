import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrdersDateRangeFilter } from "@/features/orders/components/OrdersDateRangeFilter";
import { OrdersEmptyState } from "@/features/orders/components/OrdersEmptyState";
import { OrdersPaginationControls } from "@/features/orders/components/OrdersPagination";
import { OrdersStatsCards } from "@/features/orders/components/OrdersStatsCards";
import { OrdersTable } from "@/features/orders/components/OrdersTable";
import { getOrdersDashboardData } from "@/features/orders/services/getOrdersDashboardData";
import {
  deliveryStatusOptions,
  parseOrdersDateRange,
  parseOrdersPage,
  parseDeliveryStatusFilter,
} from "@/features/orders/types/order";

type OrdersPageProps = {
  searchParams?: Promise<{
    from?: string;
    page?: string;
    status?: string;
    to?: string;
  }>;
};

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const deliveryStatus = parseDeliveryStatusFilter(
    resolvedSearchParams?.status,
  );
  const dateRange = parseOrdersDateRange({
    from: resolvedSearchParams?.from,
    to: resolvedSearchParams?.to,
  });
  const page = parseOrdersPage(resolvedSearchParams?.page);
  const { stats, orders, pagination } = await getOrdersDashboardData({
    deliveryStatus,
    fromDate: dateRange.from,
    toDate: dateRange.to,
    page,
  });
  const activeStatus = deliveryStatusOptions.find(
    (option) => option.value === deliveryStatus,
  );
  const hasActiveFilters =
    Boolean(activeStatus) ||
    Boolean(dateRange.fromValue) ||
    Boolean(dateRange.toValue);

  console.log("------------- orders -------------");
  console.log(orders);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Orders workspace
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground">
                All orders
              </h1>
              {activeStatus ? (
                <Badge variant="outline">{activeStatus.label}</Badge>
              ) : null}
            </div>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              Review every order, keep delivery statuses current, and move
              directly into the order detail page when action is needed.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <OrdersDateRangeFilter
              fromDate={dateRange.from}
              toDate={dateRange.to}
            />
            {hasActiveFilters ? (
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/orders">Clear filters</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </section>
      <OrdersStatsCards stats={stats} />
      {orders.length > 0 ? (
        <div className="flex flex-col gap-4">
          <OrdersTable
            orders={orders}
            description={
              activeStatus
                ? `${activeStatus.label} orders currently in the queue.`
                : "Every store order listed with direct access to its detail page."
            }
          />
          <OrdersPaginationControls
            pagination={pagination}
            from={dateRange.fromValue}
            status={resolvedSearchParams?.status}
            to={dateRange.toValue}
          />
        </div>
      ) : (
        <OrdersEmptyState
          title={
            hasActiveFilters
              ? "No orders found for the selected filters"
              : "No orders yet"
          }
          description={
            hasActiveFilters
              ? "Adjust the current status or date range and try again."
              : "New orders will appear here once customers begin checking out."
          }
        />
      )}
    </div>
  );
}
