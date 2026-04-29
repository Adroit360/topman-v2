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
import { formatOrderNumber } from "@/features/orders/types/order";
import { getPaymentReceiptById } from "@/features/payments";

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

type PaymentReceiptPageProps = {
  params: Promise<{
    paymentId: string;
  }>;
};

export default async function PaymentReceiptPage({
  params,
}: PaymentReceiptPageProps) {
  const { paymentId } = await params;
  const payment = await getPaymentReceiptById(paymentId);

  if (!payment) {
    notFound();
  }

  const itemsSubtotal = payment.items.reduce(
    (runningTotal, item) => runningTotal + item.lineTotal,
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
            Payment receipt
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground">
            {payment.reference}
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Confirmed on {dateTimeFormatter.format(payment.paidAt)} for order{" "}
            {formatOrderNumber(payment.orderSerialNumber)}.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/dashboard/orders/${payment.orderId}`}>
            Open linked order
          </Link>
        </Button>
      </section>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
        <div className="flex flex-col gap-6">
          <Card className="border-border/70 bg-card/80">
            <CardHeader className="border-b border-border/60">
              <CardTitle>Receipt summary</CardTitle>
              <CardDescription>
                Payment, customer, and linked order details for this receipt.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground">
                  Receipt reference
                </p>
                <p className="font-medium text-foreground">
                  {payment.reference}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground">Linked order</p>
                <Button
                  asChild
                  variant="link"
                  className="h-auto justify-start px-0 font-medium"
                >
                  <Link href={`/dashboard/orders/${payment.orderId}`}>
                    {formatOrderNumber(payment.orderSerialNumber)}
                  </Link>
                </Button>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-medium text-foreground">
                  {payment.customerName}
                </p>
                <p className="text-sm">{payment.email}</p>
                <p className="text-sm">{payment.phone}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground">
                  Delivery address
                </p>
                <p className="font-medium text-foreground">
                  {payment.deliveryAddress}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/70 bg-card/80">
            <CardHeader className="border-b border-border/60">
              <CardTitle>Items covered by this payment</CardTitle>
              <CardDescription>
                Every ordered item included in the linked order.
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
                  {payment.items.map((item) => (
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
                Totals recorded for the order this payment confirmed.
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
                  {currenctFormat(payment.processingFee)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Delivery cost</span>
                <span className="font-medium">
                  {currenctFormat(payment.deliveryCost)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3 text-base">
                <span className="font-medium text-foreground">Paid total</span>
                <span className="font-semibold text-foreground">
                  {currenctFormat(payment.total)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
