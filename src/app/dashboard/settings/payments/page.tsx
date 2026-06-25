import { PaymentGatewaySettingsForm } from "@/features/checkout/components/PaymentGatewaySettingsForm";
import { getActivePaymentGateway } from "@/features/checkout/services/paymentGatewaySettings";

export default async function PaymentSettingsPage() {
  const activeGateway = await getActivePaymentGateway();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Payment Settings
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          Control which payment gateway customers use when they start a new
          checkout session.
        </p>
      </div>

      <PaymentGatewaySettingsForm gateway={activeGateway} />
    </div>
  );
}
