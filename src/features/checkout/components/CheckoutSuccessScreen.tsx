import Link from "next/link";
import {
  CircleCheckBig,
  OctagonXIcon,
  Receipt,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SectionBread from "@/components/misc/section-breadcrumb";
import { formatOrderNumber } from "@/features/orders/types/order";
import { CheckoutSuccessEffects } from "./CheckoutSuccessEffects";

export const CheckoutSuccessScreen = ({
  success,
  orderId,
  serialNumber,
  reference,
  message,
}: {
  success: boolean;
  orderId: string;
  serialNumber: number | null;
  reference: string;
  message: string;
}) => {
  const orderNumber =
    typeof serialNumber === "number"
      ? formatOrderNumber(serialNumber)
      : orderId;

  return (
    <section className="pb-16 pt-8 sm:pt-10 lg:pb-24">
      <CheckoutSuccessEffects success={success} />
      <SectionBread
        title={success ? "Payment Confirmed" : "Payment Verification Issue"}
        description={message}
        bread={[]}
      />

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Card className="rounded-[2rem] border border-border bg-background/95 shadow-sm">
            <CardHeader className="space-y-3 border-b border-border">
              <div className="flex size-14 items-center justify-center rounded-full border border-border bg-muted/20 text-foreground">
                {success ? (
                  <CircleCheckBig className="size-7" />
                ) : (
                  <OctagonXIcon className="size-7" />
                )}
              </div>
              <CardTitle className="text-2xl font-semibold tracking-[-0.04em] text-foreground">
                {success ? "Payment confirmed" : "Payment verification issue"}
              </CardTitle>
              <CardDescription className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                {message}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.5rem] border border-border bg-muted/20 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Receipt className="size-4" />
                    Order reference
                  </div>
                  <p className="mt-2 break-all text-sm leading-6 text-muted-foreground">
                    {reference}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-border bg-muted/20 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <ShoppingBag className="size-4" />
                    Order number
                  </div>
                  <p className="mt-2 break-all text-sm leading-6 text-muted-foreground">
                    {orderNumber}
                  </p>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-border bg-muted/20 p-4 text-sm leading-6 text-muted-foreground">
                {success
                  ? "Keep your order reference for follow-up. If you need changes to delivery details, contact the store and include this payment reference."
                  : "If you completed payment but this page could not verify it yet, wait a moment and refresh this page. If the issue persists, contact the store with your payment reference."}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {success ? (
                  <Button className="rounded-full px-6" asChild>
                    <Link href="/shop">Continue Shopping</Link>
                  </Button>
                ) : (
                  <Button className="rounded-full px-6" asChild>
                    <Link href="/checkout">Return to Checkout</Link>
                  </Button>
                )}
                <Button variant="outline" className="rounded-full px-6" asChild>
                  <Link href="/list">Upload Another Book List</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
