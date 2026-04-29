"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { ListOrderRecord } from "../types/list-order";
import { ListOrderDetailDialog } from "./ListOrderDetailDialog";
import { ListOrdersTable } from "./ListOrdersTable";

export const ListOrdersManagement = ({
  orders,
}: {
  orders: ListOrderRecord[];
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex max-w-3xl flex-col gap-2">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
              List order workspace
            </p>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground">
              Book list orders
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Track every uploaded list, preview files, update processing
              status, and keep a visible admin timeline for handoffs.
            </p>
          </div>
        </div>
      </section>

      {orders.length > 0 ? (
        <ListOrdersTable
          orders={orders}
          onView={(order) => setSelectedOrderId(order.id)}
        />
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card/60 p-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <h2 className="text-xl font-semibold text-foreground">
              No uploaded lists yet
            </h2>
            <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
              New customer list submissions will appear here once they upload
              from the public upload page.
            </p>
            <Button variant="outline" disabled>
              Waiting for uploads
            </Button>
          </div>
        </div>
      )}

      <ListOrderDetailDialog
        order={selectedOrder}
        open={Boolean(selectedOrder)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedOrderId(null);
          }
        }}
      />
    </div>
  );
};
