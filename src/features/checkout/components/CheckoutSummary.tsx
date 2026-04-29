"use client";

import Image from "next/image";
import { useCart } from "@/features/cart";
import {
  calculateCheckoutPricing,
  formatPrice,
} from "../services/checkoutPricing";

const cartImageLoader = ({ src }: { src: string }) => src;

export const CheckoutSummary = () => {
  const { items, itemCount, subtotal } = useCart();
  const pricing = calculateCheckoutPricing(subtotal);

  return (
    <aside className="rounded-[2rem] border border-border bg-background p-5 shadow-sm sm:p-6 lg:sticky lg:top-28">
      <div className="flex flex-col gap-5">
        <div className="border-b border-border pb-4">
          <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">
            Order summary
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground">
            {itemCount} item{itemCount === 1 ? "" : "s"} in your order
          </h2>
        </div>

        <div className="flex max-h-80 flex-col gap-4 overflow-y-auto pr-1">
          {items.map((item) => (
            <article
              key={item.bookId}
              className="grid grid-cols-[4rem_minmax(0,1fr)] gap-3 rounded-[1.5rem] p-3"
            >
              <div className="relative aspect-4/5 overflow-hidden rounded-[1rem] border border-border bg-muted">
                {item.book.image ? (
                  <Image
                    src={item.book.image}
                    alt={`Cover for ${item.book.title}`}
                    loader={cartImageLoader}
                    unoptimized
                    fill
                    sizes="4rem"
                    className="object-cover"
                  />
                ) : null}
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-foreground">
                  {item.book.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Qty {item.quantity}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  GHS {formatPrice(item.book.price * item.quantity)}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="space-y-3 border-t border-border pt-4 text-sm">
          <div className="flex items-center justify-between ">
            <span>Subtotal</span>
            <span>GHS {formatPrice(pricing.subtotalAmount)}</span>
          </div>
          <div className="flex items-center justify-between ">
            <span>Processing fee</span>
            <span>GHS {formatPrice(pricing.processingFeeAmount)}</span>
          </div>
          <div className="italic text-sm leading-6 text-red-500">
            *** A processing fee of 2% is added to cover payment processing. ***
          </div>
          <div className="flex items-center justify-between border-t border-border pt-4 text-base font-semibold text-foreground">
            <span>Total</span>
            <span>GHS {formatPrice(pricing.totalAmount)}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
