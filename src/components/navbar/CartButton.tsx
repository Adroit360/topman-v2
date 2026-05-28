"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart";

type CartButtonProps = {
  cartHref?: string;
};

export const CartButton = ({ cartHref = "/cart" }: CartButtonProps) => {
  const { itemCount, isHydrated } = useCart();

  return (
    <Button variant="outline" className="text-md" asChild>
      <Link href={cartHref} aria-label="Open cart">
        <ShoppingBag data-icon="inline-start" />
        Cart
        {isHydrated && itemCount > 0 ? <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-orange-600 px-1.5 py-0.5 text-[11px] font-semibold text-background">{itemCount}</span> : null}
      </Link>
    </Button>
  );
};
