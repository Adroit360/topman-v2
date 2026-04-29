import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { currenctFormat } from "@/utils/currency-format";
import { DeliveryStatusBadge } from "./OrderStatusBadge";
import { formatOrderNumber, type OrdersTableRow } from "../types/order";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export const OrdersTable = ({
  orders,
  description,
}: {
  orders: OrdersTableRow[];
  description?: string;
}) => {
  return (
    <Card className="border-border/70 bg-card/80">
      <CardHeader className="border-b border-border/60">
        <CardTitle>Orders</CardTitle>
        <CardDescription>
          {description ??
            "Track incoming orders and jump into each order detail."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              {/* <TableHead>Payment</TableHead> */}
              <TableHead>Delivery</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">
                      {formatOrderNumber(order.serialNumber)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{order.customerName}</span>
                    <span className="text-xs text-muted-foreground">
                      {order.email}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {order.phone}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {currenctFormat(order.total)}
                </TableCell>
                {/* <TableCell>
                  <PaymentStatusBadge status={order.paymentStatus} />
                </TableCell> */}
                <TableCell>
                  <DeliveryStatusBadge status={order.deliveryStatus} />
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {order.address}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/dashboard/orders/${order.id}`}>
                      View details
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
