import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionBread from "@/components/misc/section-breadcrumb";
import { CheckoutForm } from "./CheckoutForm";
import { CheckoutSummary } from "./CheckoutSummary";

export const CheckoutPage = () => {
  return (
    <section className="pb-16 pt-8 sm:pt-10 lg:pb-24">
      <SectionBread
        title="Checkout"
        description="Confirm your delivery details, review the 2% processing fee, and complete payment securely with Paystack."
        bread={[]}
      />

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="outline" className="w-fit rounded-md" asChild>
              <Link href="/cart">
                <ArrowLeft data-icon="inline-start" />
                Back to cart
              </Link>
            </Button>

            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/20 px-4 py-2 text-sm text-muted-foreground">
              <ShieldCheck className="size-4" />
              Secure checkout powered by Paystack
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
            <CheckoutForm />
            <CheckoutSummary />
          </div>
        </div>
      </div>
    </section>
  );
};
