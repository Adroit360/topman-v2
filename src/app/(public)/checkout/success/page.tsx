import { verifyCheckoutPayment } from "@/features/checkout/services/verifyCheckoutPayment";
import { CheckoutSuccessScreen } from "@/features/checkout/components/CheckoutSuccessScreen";

type CheckoutSuccessRouteProps = {
  searchParams?: Promise<{
    orderId?: string;
    reference?: string;
  }>;
};

export default async function CheckoutSuccessRoute({
  searchParams,
}: CheckoutSuccessRouteProps) {
  const params = (await searchParams) ?? {};
  const orderId = params.orderId?.trim();
  const reference = params.reference?.trim();

  if (!reference) {
    return (
      <CheckoutSuccessScreen
        success={false}
        orderId={orderId ?? "Unavailable"}
        serialNumber={null}
        reference="Unavailable"
        message="Missing payment reference. Please contact support if you were charged."
      />
    );
  }

  const verificationResult = await verifyCheckoutPayment({
    orderId,
    reference,
  });

  return (
    <CheckoutSuccessScreen
      success={verificationResult.success}
      orderId={verificationResult.data?.orderId ?? orderId ?? "Unavailable"}
      serialNumber={verificationResult.data?.serialNumber ?? null}
      reference={verificationResult.data?.reference ?? reference}
      message={verificationResult.message}
    />
  );
}
