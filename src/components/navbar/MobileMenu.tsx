"use client";

import Link from "next/link";
import { Menu, ShoppingBag, User, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart";
import type { NavbarLink } from "./navbar-links";

type MobileMenuProps = {
  links: NavbarLink[];
  cartHref?: string;
  accountHref?: string | null;
  accountLabel?: string;
};

export const MobileMenu = ({
  links,
  cartHref = "/cart",
  accountHref,
  accountLabel = "Login",
}: MobileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { itemCount, isHydrated } = useCart();

  const closeMenu = () => setIsOpen(false);
  const toggleMenu = () => setIsOpen((open) => !open);

  return (
    <div className="flex items-center md:hidden">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="rounded-full"
        aria-expanded={isOpen}
        aria-controls="public-mobile-menu"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        onClick={toggleMenu}
      >
        {isOpen ? <X /> : <Menu />}
      </Button>

      {isOpen ? (
        <div
          id="public-mobile-menu"
          className="absolute right-0 top-[calc(100%+0.75rem)] w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-3xl border border-border bg-background/95 shadow-lg backdrop-blur supports-backdrop-filter:bg-background/80"
        >
          <div className="flex flex-col gap-2 p-3">
            <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
              {links.map((link) => (
                <Button
                  key={link.href}
                  variant="ghost"
                  size="lg"
                  className="justify-start rounded-2xl px-3"
                  asChild
                >
                  <Link href={link.href} onClick={closeMenu}>
                    {link.label}
                  </Link>
                </Button>
              ))}
            </nav>

            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
              <Button
                variant="outline"
                size="lg"
                className="w-full rounded-full"
                asChild
              >
                <Link href={cartHref} onClick={closeMenu}>
                  <ShoppingBag data-icon="inline-start" />
                  Cart
                  {isHydrated && itemCount > 0 ? (
                    <span className="ml-1 inline-flex min-w-6 items-center justify-center rounded-full bg-foreground px-1.5 py-0.5 text-[11px] font-semibold text-background">
                      {itemCount}
                    </span>
                  ) : null}
                </Link>
              </Button>

              {accountHref ? (
                <Button
                  variant="default"
                  size="lg"
                  className="w-full rounded-full"
                  asChild
                >
                  <Link href={accountHref} onClick={closeMenu}>
                    <User data-icon="inline-start" />
                    {accountLabel}
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
