import { Badge } from "@/components/ui/badge";
import {
  getDeliveryStatusLabel,
  getPaymentStatusLabel,
  paymentStatusValues,
  type DeliveryStatusValue,
  type PaymentStatusValue,
} from "../types/order";

const deliveryStatusVariantMap: Record<
  DeliveryStatusValue,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  0: "warning",
  1: "info",
  2: "secondary",
  3: "success",
  4: "destructive",
};

export const DeliveryStatusBadge = ({
  status,
}: {
  status: DeliveryStatusValue;
}) => {
  return (
    <Badge variant={deliveryStatusVariantMap[status]}>
      {getDeliveryStatusLabel(status)}
    </Badge>
  );
};

export const PaymentStatusBadge = ({
  status,
}: {
  status: PaymentStatusValue;
}) => {
  return (
    <Badge
      variant={status === paymentStatusValues.paid ? "success" : "outline"}
    >
      {getPaymentStatusLabel(status)}
    </Badge>
  );
};
