import { ReactNode } from "react";
import { Navbar } from "@/components/navbar/Navbar";
import { Footer } from "@/components/navbar/Footer";
import { CartProvider } from "@/features/cart";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const isAdmin = session != null && (session.user as { role?: number }).role === 1;

  return (
    <CartProvider>
      <section className="flex min-h-full flex-1  flex-col bg-background">
        <Navbar accountHref={isAdmin ? "/dashboard" : "/login"} accountLabel={isAdmin ? "Dashboard" : "Login"} />
        <div className="flex flex-1 flex-col">{children}</div>
        <Footer />
      </section>
    </CartProvider>
  );
}
