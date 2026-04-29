import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrdersStatsCards } from "@/features/orders/components/OrdersStatsCards";
import { OrdersTable } from "@/features/orders/components/OrdersTable";
import { OrdersEmptyState } from "@/features/orders/components/OrdersEmptyState";
import { getOrdersDashboardData } from "@/features/orders/services/getOrdersDashboardData";

export default async function DashboardPage() {
  const { stats, orders } = await getOrdersDashboardData();
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
          Admin overview
        </p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-2xl flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground">
              Monitor fulfilment and jump into live order work.
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Use the cards for a quick snapshot, then open the orders workspace
              to manage each order in detail.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/orders">
              <ArrowRightIcon data-icon="inline-start" />
              Open all orders
            </Link>
          </Button>
        </div>
      </section>
      <OrdersStatsCards stats={stats} />
      {recentOrders.length > 0 ? (
        <OrdersTable
          orders={recentOrders}
          description="Recent orders pulled from the live orders queue."
        />
      ) : (
        <OrdersEmptyState
          title="No recent order activity"
          description="As soon as customers place orders, the latest activity will surface here."
        />
      )}
    </div>
  );
}
