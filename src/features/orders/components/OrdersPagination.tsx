import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type OrdersPagination } from "../types/order";

const buildPageHref = ({
  page,
  status,
  from,
  to,
}: {
  page: number;
  status?: string;
  from?: string;
  to?: string;
}) => {
  const params = new URLSearchParams();

  if (status) {
    params.set("status", status);
  }

  if (from) {
    params.set("from", from);
  }

  if (to) {
    params.set("to", to);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();

  return query ? `/dashboard/orders?${query}` : "/dashboard/orders";
};

export const OrdersPaginationControls = ({
  pagination,
  status,
  from,
  to,
}: {
  pagination: OrdersPagination;
  status?: string;
  from?: string;
  to?: string;
}) => {
  if (pagination.totalItems <= pagination.pageSize) {
    return null;
  }

  const startItem = (pagination.currentPage - 1) * pagination.pageSize + 1;
  const endItem = Math.min(
    pagination.currentPage * pagination.pageSize,
    pagination.totalItems,
  );

  return (
    <Card className="border-border/70 bg-card/80">
      <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {startItem.toLocaleString()}-{endItem.toLocaleString()} of{" "}
          {pagination.totalItems.toLocaleString()} orders.
        </p>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            asChild
            disabled={pagination.currentPage <= 1}
            size="sm"
            variant="outline"
          >
            <Link
              aria-disabled={pagination.currentPage <= 1}
              href={buildPageHref({
                page: pagination.currentPage - 1,
                status,
                from,
                to,
              })}
            >
              <ChevronLeftIcon data-icon="inline-start" />
              Previous
            </Link>
          </Button>
          <div className="min-w-24 text-center text-sm text-muted-foreground">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>
          <Button
            asChild
            disabled={pagination.currentPage >= pagination.totalPages}
            size="sm"
            variant="outline"
          >
            <Link
              aria-disabled={pagination.currentPage >= pagination.totalPages}
              href={buildPageHref({
                page: pagination.currentPage + 1,
                status,
                from,
                to,
              })}
            >
              Next
              <ChevronRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
