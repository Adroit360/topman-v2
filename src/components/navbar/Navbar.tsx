import Link from "next/link";
import Image from "next/image";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartButton } from "./CartButton";
import { MobileMenu } from "./MobileMenu";
import { navbarLinks } from "./navbar-links";

type NavbarProps = {
  accountHref?: string | null;
  accountLabel?: string;
  cartHref?: string;
};

export const Navbar = ({ accountHref, accountLabel = "Login", cartHref = "/cart" }: NavbarProps) => {
  return (
    <header className="fixed inset-x-0 top-4 z-50 px-3 sm:px-6 lg:px-8">
      <div className="relative mx-auto flex w-full max-w-7xl items-center gap-3 rounded-3xl border border-border bg-background/95 px-3 py-2.5 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/80 sm:gap-4 sm:px-4 sm:py-3">
        <Link href="/" className="flex min-w-0 items-center rounded-full transition-opacity hover:opacity-90" aria-label="Topman Books home">
          <Image src="/images/topmanlogo.png" alt="Topman Books" width={320} height={140} priority className="h-12 w-auto sm:h-14   " />
        </Link>

        <nav aria-label="Primary navigation" className="hidden flex-1 items-center justify-center md:flex">
          <div className="flex items-center gap-1 p-1">
            {navbarLinks.map((link) => (
              <Button key={link.href} variant="ghost" className="px-4 text-md" asChild>
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </div>
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <CartButton cartHref={cartHref} />

          {accountHref ? (
            <Button variant="default" asChild className=" bg-orange-600">
              <Link href={accountHref}>
                <User data-icon="inline-start" />
                {accountLabel}
              </Link>
            </Button>
          ) : null}
        </div>

        <div className="ml-auto md:hidden">
          <MobileMenu links={navbarLinks} cartHref={cartHref} accountHref={accountHref} accountLabel={accountLabel} />
        </div>
      </div>
    </header>
  );
};
