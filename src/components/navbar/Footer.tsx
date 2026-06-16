import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
import { navbarLinks } from "./navbar-links";

export const Footer = () => {
  return (
    <footer className="relative isolate overflow-hidden bg-orange-600 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#f97316_0%,#ea580c_38%,#c2410c_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.16)_0_1px,transparent_1px_100%),linear-gradient(180deg,rgba(255,255,255,0.12)_0_1px,transparent_1px_100%)] bg-size-[72px_72px] opacity-35" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.16)_0%,transparent_34%,rgba(124,45,18,0.16)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-white/35" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr_0.8fr] lg:items-start">
          <div className="max-w-xl">
            <Link href="/" className="inline-flex rounded-lg bg-white p-2 shadow-[0_18px_38px_rgba(124,45,18,0.22)] transition-opacity hover:opacity-90" aria-label="Topman Books home">
              <Image src="/images/original-logo-cropped.png" alt="Topman Books" width={320} height={140} className="h-16 w-auto" />
            </Link>

            <h2 className="mt-8 max-w-lg text-3xl font-bold leading-tight sm:text-3xl">Discover your next great read.</h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/78 sm:text-base">A warm, reliable place to find school books, novels, classics, and reading essentials for home and classroom shelves.</p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase text-white/62">Explore</p>
            <nav className="mt-5" aria-label="Footer navigation">
              <ul className="grid gap-3">
                {navbarLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="inline-flex text-base font-medium text-white transition duration-300 hover:translate-x-1 hover:text-orange-100" aria-label={`Navigate to ${link.label}`}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase text-white/62">Visit & Support</p>
            <div className="mt-5 grid gap-3 text-sm text-white/86">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-white/14">
                  <MapPin className="size-4" />
                </span>
                <span>123 Bookshop Lane, Accra, Ghana</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/14">
                  <Phone className="size-4" />
                </span>
                <span>+233 20 000 0000</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/14">
                  <Mail className="size-4" />
                </span>
                <span>hello@topmanbooks.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/18 pt-6 text-sm text-white/68 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Topman Bookshop. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/shop" className="transition hover:text-white">
              Shop books
            </Link>
            <Link href="/list" className="transition hover:text-white">
              Upload book list
            </Link>
            <Link href="/contact" className="transition hover:text-white">
              Get support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
