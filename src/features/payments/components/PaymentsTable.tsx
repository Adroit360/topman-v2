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
import { formatOrderNumber } from "@/features/orders/types/order";
import type { PaymentTableRow } from "../types/payment";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export const PaymentsTable = ({
  payments,
}: {
  payments: PaymentTableRow[];
}) => {
  return (
    <Card className="border-border/70 bg-card/80">
      <CardHeader className="border-b border-border/60">
        <CardTitle>Payments</CardTitle>
        <CardDescription>
          Every confirmed payment receipt with a direct trace back to its order.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Receipt</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Paid at</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{payment.reference}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    asChild
                    size="sm"
                    variant="link"
                    className="h-auto px-0"
                  >
                    <Link href={`/dashboard/orders/${payment.orderId}`}>
                      {formatOrderNumber(payment.orderSerialNumber)}
                    </Link>
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{payment.customerName}</span>
                    <span className="text-xs text-muted-foreground">
                      {payment.email}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {payment.phone}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {currenctFormat(payment.total)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {dateFormatter.format(payment.paidAt)}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/dashboard/payments/${payment.id}`}>
                      View receipt
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
