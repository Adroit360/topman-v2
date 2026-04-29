import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { navbarLinks } from "./navbar-links";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8">
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-3 text-foreground transition-colors hover:text-foreground/80"
            aria-label="Topman Bookshop home"
          >
            <span className="flex size-10 items-center justify-center rounded-full border border-border bg-muted text-foreground">
              <BookOpen className="size-5" />
            </span>
            <span className="flex flex-col">
              <span className="text-[10px] font-medium tracking-[0.18em] text-muted-foreground uppercase sm:text-xs">
                Topman
              </span>
              <span className="text-sm font-semibold tracking-tight sm:text-base">
                Bookshop
              </span>
            </span>
          </Link>

          {/* Nav links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {navbarLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <Separator />

          {/* Copyright */}
          <p className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Topman Bookshop. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
