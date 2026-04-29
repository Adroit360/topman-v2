import z from "zod";
import { deliveryStatusOptions, type DeliveryStatusValue } from "./order";

export const orderAdminFieldNames = ["deliveryStatus", "adminNotes"] as const;

const deliveryStatusValues = deliveryStatusOptions.map(
  (option) => option.value,
);

export const orderAdminSchema = z.object({
  orderId: z.string().trim().min(1),
  deliveryStatus: z
    .number({ error: "Choose an order status." })
    .int()
    .refine(
      (value): value is DeliveryStatusValue =>
        deliveryStatusValues.includes(value as DeliveryStatusValue),
      "Choose a valid order status.",
    ),
  adminNotes: z
    .string()
    .max(2000, "Admin notes must be 2000 characters or less.")
    .optional()
    .transform((value) => {
      const trimmedValue = value?.trim() ?? "";

      return trimmedValue.length > 0 ? trimmedValue : undefined;
    }),
});

export type OrderAdminFormValues = z.input<typeof orderAdminSchema>;

export type UpdateOrderAdminResult = {
  success: boolean;
  message: string;
  fieldErrors?: Partial<Record<(typeof orderAdminFieldNames)[number], string>>;
  data?: {
    adminNotes?: string;
  };
};
