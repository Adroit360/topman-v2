import { PaymentsEmptyState, PaymentsTable } from "@/features/payments";
import { getPaymentsDashboardData } from "@/features/payments";

export default async function PaymentsPage() {
  const payments = await getPaymentsDashboardData();

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Payments workspace
            </p>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground">
              Payment receipts
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              Review every confirmed payment and jump directly to the related
              order when follow-up is needed.
            </p>
          </div>
        </div>
      </section>
      {payments.length > 0 ? (
        <PaymentsTable payments={payments} />
      ) : (
        <PaymentsEmptyState />
      )}
    </div>
  );
}
