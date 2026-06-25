export const paymentGatewayValues = {
  paystack: "paystack",
  hubtel: "hubtel",
} as const;

export type PaymentGateway =
  (typeof paymentGatewayValues)[keyof typeof paymentGatewayValues];

export const paymentGatewayOptions: Array<{
  value: PaymentGateway;
  label: string;
  description: string;
}> = [
  {
    value: paymentGatewayValues.paystack,
    label: "Paystack",
    description: "Redirect customers to Paystack for card and mobile payments.",
  },
  {
    value: paymentGatewayValues.hubtel,
    label: "Hubtel",
    description: "Redirect customers to Hubtel Online Checkout.",
  },
];

export const isPaymentGateway = (value: string): value is PaymentGateway =>
  value === paymentGatewayValues.paystack ||
  value === paymentGatewayValues.hubtel;

export const formatPaymentGateway = (gateway: PaymentGateway) =>
  paymentGatewayOptions.find((option) => option.value === gateway)?.label ??
  gateway;
