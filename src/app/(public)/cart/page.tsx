"use client";

import Image from "next/image";
import Link from "next/link";
import { ListRestart, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart";
import { calculateCheckoutPricing, formatPrice } from "@/features/checkout";

const cartImageLoader = ({ src }: { src: string }) => src;

export default function CartPage() {
  const {
    items,
    isHydrated,
    subtotal,
    itemCount,
    clearCart,
    removeFromCart,
    updateQuantity,
  } = useCart();
  const pricing = calculateCheckoutPricing(subtotal);

  if (!isHydrated) {
    return (
      <section className="px-4 pb-16 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <div className="h-4 w-28 rounded-full bg-muted" />
          <div className="h-12 max-w-xl rounded-full bg-muted" />
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="grid gap-4 rounded-[2rem] border border-border bg-background p-5 shadow-sm sm:grid-cols-[7rem_minmax(0,1fr)_auto]"
              >
                <div className="aspect-4/5 rounded-[1.25rem] bg-muted" />
                <div className="flex flex-col gap-3 py-2">
                  <div className="h-6 max-w-md rounded-full bg-muted" />
                  <div className="h-4 w-40 rounded-full bg-muted" />
                  <div className="h-4 w-24 rounded-full bg-muted" />
                </div>
                <div className="h-10 w-28 self-center rounded-full bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="px-4 pb-16 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center rounded-[2rem] border border-dashed border-border bg-muted/30 px-6 py-16 text-center shadow-sm sm:px-10">
          <span className="flex size-16 items-center justify-center rounded-full border border-border bg-background shadow-sm">
            <ShoppingBag className="size-6 text-muted-foreground" />
          </span>
          <p className="mt-6 text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">
            Your cart
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-foreground sm:text-4xl">
            Your cart is empty.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
            Add books from the storefront and they will appear here with saved
            quantities, prices, and quick cart controls.
          </p>
          <Button className="mt-8 rounded-full px-6" asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 pb-16 pt-32 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">
                Your cart
              </p>
              <h1 className="text-3xl font-semibold tracking-[-0.05em] text-foreground sm:text-4xl">
                {itemCount} item{itemCount === 1 ? "" : "s"} ready for checkout.
              </h1>
              <p className="text-sm leading-7 text-muted-foreground sm:text-base">
                Review quantities, remove titles, or keep building your shelf.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="rounded-md bg-blue-400/10 text-blue-400 hover:bg-blue-400/20"
              onClick={clearCart}
            >
              <ListRestart />
              Clear Cart
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <article
                key={item.bookId}
                className="grid gap-4 rounded-[2rem] border border-border bg-background p-4 shadow-sm sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:p-5"
              >
                <div className="relative aspect-4/5 overflow-hidden rounded-[1.25rem] border border-border bg-muted">
                  {item.book.image ? (
                    <Image
                      src={item.book.image}
                      alt={`Cover for ${item.book.title}`}
                      loader={cartImageLoader}
                      unoptimized
                      fill
                      sizes="(max-width: 640px) 40vw, 7rem"
                      className="object-cover"
                    />
                  ) : null}
                </div>

                <div className="flex min-w-0 flex-col justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-semibold tracking-[-0.04em] text-foreground">
                      {item.book.title}
                    </h2>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {item.book.author}
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      GHS {item.book.price.toFixed(2)} each
                    </p>
                    {!item.book.isAvailable ? (
                      <p className="text-sm text-destructive">
                        Currently unavailable
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center rounded-full border border-border bg-muted/40 p-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-full"
                        onClick={() =>
                          updateQuantity(item.bookId, item.quantity - 1)
                        }
                        aria-label={`Decrease quantity for ${item.book.title}`}
                      >
                        <Minus />
                      </Button>
                      <span className="min-w-10 text-center text-sm font-medium text-foreground">
                        {item.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-full"
                        onClick={() =>
                          updateQuantity(item.bookId, item.quantity + 1)
                        }
                        aria-label={`Increase quantity for ${item.book.title}`}
                      >
                        <Plus />
                      </Button>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      className="rounded-md bg-red-400/10 hover:bg-red-400/20 text-red-400"
                      onClick={() => removeFromCart(item.bookId)}
                    >
                      <Trash2 data-icon="inline-start" />
                      Remove
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col items-start justify-between gap-3 sm:items-end">
                  <p className="text-sm text-muted-foreground"></p>
                  <p className="text-xl font-semibold tracking-[-0.04em] text-foreground">
                    GHS {(item.book.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-[2rem] border border-border bg-background p-5 shadow-sm sm:p-6 lg:sticky lg:top-28">
          <div className="flex flex-col gap-4">
            <div className="border-b border-border pb-4">
              <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">
                Summary
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground">
                Cart total
              </h2>
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Items</span>
              <span>{itemCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>GHS {formatPrice(pricing.subtotalAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Processing fee</span>
              <span>GHS {formatPrice(pricing.processingFeeAmount)}</span>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4 text-base font-semibold text-foreground">
              <span>Total</span>
              <span>GHS {formatPrice(pricing.totalAmount)}</span>
            </div>

            {/* <p className="rounded-2xl border border-border bg-muted/30 px-4 py-3 text-sm leading-6 text-muted-foreground">
              A processing fee of 2% is added at checkout.
            </p> */}
            <Button className="mt-2 w-full rounded-md" asChild>
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
            <Button variant="outline" className="w-full rounded-md" asChild>
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </aside>
      </div>
    </section>
  );
}
