import Link from "next/link";
import { BookOpen, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartButton } from "./CartButton";
import { MobileMenu } from "./MobileMenu";
import { navbarLinks } from "./navbar-links";

type NavbarProps = {
  accountHref?: string | null;
  accountLabel?: string;
  cartHref?: string;
};

export const Navbar = ({
  accountHref,
  accountLabel = "Login",
  cartHref = "/cart",
}: NavbarProps) => {
  return (
    <header className="fixed inset-x-0 top-4 z-50 px-3 sm:px-6 lg:px-8">
      <div className="relative mx-auto flex w-full max-w-7xl items-center gap-3 rounded-3xl border border-border bg-background/95 px-3 py-2.5 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/80 sm:gap-4 sm:px-4 sm:py-3">
        <Link
          href="/"
          className="min-w-0 flex items-center gap-2 rounded-full px-1 py-1 text-foreground transition-colors hover:text-foreground/80 sm:gap-3"
          aria-label="Topman Bookshop home"
        >
          <span className="flex size-9 items-center justify-center rounded-full border border-border bg-muted text-foreground sm:size-10">
            <BookOpen />
          </span>

          <span className="flex min-w-0 flex-col">
            <span className="truncate text-[10px] font-medium tracking-[0.18em] text-muted-foreground uppercase sm:text-sm">
              Topman
            </span>
            <span className="truncate text-sm font-semibold tracking-tight sm:text-base">
              Bookshop
            </span>
          </span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden flex-1 items-center justify-center md:flex"
        >
          <div className="flex items-center gap-1 p-1">
            {navbarLinks.map((link) => (
              <Button
                key={link.href}
                variant="ghost"
                className="px-4 text-md"
                asChild
              >
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </div>
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <CartButton cartHref={cartHref} />

          {accountHref ? (
            <Button variant="default" asChild>
              <Link href={accountHref}>
                <User data-icon="inline-start" />
                {accountLabel}
              </Link>
            </Button>
          ) : null}
        </div>

        <div className="ml-auto md:hidden">
          <MobileMenu
            links={navbarLinks}
            cartHref={cartHref}
            accountHref={accountHref}
            accountLabel={accountLabel}
          />
        </div>
      </div>
    </header>
  );
};
