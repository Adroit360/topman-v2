import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { currenctFormat } from "@/utils/currency-format";
import { OrderManagementForm } from "@/features/orders/components/OrderManagementForm";
import {
  DeliveryStatusBadge,
  PaymentStatusBadge,
} from "@/features/orders/components/OrderStatusBadge";
import { getOrderById } from "@/features/orders/services/getOrderById";
import { formatOrderNumber } from "@/features/orders/types/order";

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

type OrderDetailsPageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

export default async function OrderDetailsPage({
  params,
}: OrderDetailsPageProps) {
  const { orderId } = await params;
  const order = await getOrderById(orderId);

  if (!order) {
    notFound();
  }

  const itemsSubtotal = order.items.reduce(
    (runningTotal, item) => runningTotal + item.lineTotal,
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
            Order detail
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground">
              Order {formatOrderNumber(order.serialNumber)}
            </h1>
            <DeliveryStatusBadge status={order.deliveryStatus} />
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
          <p className="text-sm text-muted-foreground sm:text-base">
            Placed on {dateTimeFormatter.format(order.createdAt)} by{" "}
            {order.customerName}.
          </p>
        </div>
      </section>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
        <div className="flex flex-col gap-6">
          <Card className="border-border/70 bg-card/80">
            <CardHeader className="border-b border-border/60">
              <CardTitle>Order summary</CardTitle>
              <CardDescription>
                Core customer, payment, and fulfilment information for this
                order.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground">Order number</p>
                <p className="font-medium text-foreground">
                  {formatOrderNumber(order.serialNumber)}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-medium text-foreground">
                  {order.customerName}
                </p>
                <p className="text-sm ">{order.email}</p>
                <p className="text-sm ">{order.phone}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground">
                  Delivery address
                </p>
                <p className="font-medium text-foreground">
                  {order.deliveryAddress}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground">
                  Payment reference
                </p>
                <p className="font-medium text-foreground">
                  {order.paymentReference ?? "Pending payment"}
                </p>
                <p className="text-sm">
                  {order.datePaid
                    ? `Paid on ${dateTimeFormatter.format(new Date(order.datePaid))}`
                    : "Payment has not been confirmed yet."}
                </p>
                {order.paymentReceiptId ? (
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="mt-2 w-fit"
                  >
                    <Link
                      href={`/dashboard/payments/${order.paymentReceiptId}`}
                    >
                      View payment receipt
                    </Link>
                  </Button>
                ) : null}
              </div>
              {/* <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground">Network</p>
                <p className="font-medium text-foreground">
                  {order.ipAddress ?? "No IP address captured"}
                </p>
              </div> */}
            </CardContent>
          </Card>
          <Card className="border-border/70 bg-card/80">
            <CardHeader className="border-b border-border/60">
              <CardTitle>Items ordered</CardTitle>
              <CardDescription>
                Each book in the order with quantity and total line value.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit price</TableHead>
                    <TableHead>Line total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{item.title}</span>
                          <span className="text-xs text-muted-foreground capitalize">
                            {item.publisherName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{currenctFormat(item.unitPrice)}</TableCell>
                      <TableCell>{currenctFormat(item.lineTotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col gap-6">
          <Card className="border-border/70 bg-card/80">
            <CardHeader className="border-b border-border/60">
              <CardTitle>Financials</CardTitle>
              <CardDescription>
                Totals recorded when the order was created.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Items total</span>
                <span className="font-medium">
                  {currenctFormat(itemsSubtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Processing fee</span>
                <span className="font-medium">
                  {currenctFormat(order.processingFee)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Delivery cost</span>
                <span className="font-medium">
                  {currenctFormat(order.deliveryCost)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3 text-base">
                <span className="font-medium text-foreground">Order total</span>
                <span className="font-semibold text-foreground">
                  {currenctFormat(order.total)}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/70 bg-card/80">
            <CardHeader className="border-b border-border/60">
              <CardTitle>Customer notes</CardTitle>
              <CardDescription>
                The note the customer submitted at checkout.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {order.customerNotes || "No customer notes were provided."}
              </p>
            </CardContent>
          </Card>
          <OrderManagementForm
            orderId={order.id}
            deliveryStatus={order.deliveryStatus}
            adminNotes={order.adminNotes}
          />
        </div>
      </div>
    </div>
  );
}
