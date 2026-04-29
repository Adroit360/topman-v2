import z from "zod";

export const checkoutFieldNames = [
  "name",
  "email",
  "phone",
  "location",
  "notes",
] as const;

export const checkoutCartItemSchema = z.object({
  bookId: z.string().min(1),
  quantity: z.number().int().positive().max(99),
});

const checkoutNotesSchema = z
  .string()
  .max(1000, "Notes must be 1000 characters or less.")
  .optional()
  .transform((value) => {
    const trimmed = value?.trim() ?? "";

    return trimmed.length > 0 ? trimmed : undefined;
  });

export const checkoutFormSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name."),
  email: z.email("Enter a valid email address."),
  phone: z.string().trim().min(7, "Enter a valid phone number."),
  location: z.string().trim().min(2, "Enter your location."),
  notes: checkoutNotesSchema,
});

export const checkoutServerSchema = checkoutFormSchema.extend({
  items: z
    .array(checkoutCartItemSchema)
    .min(1, "Your cart is empty. Add at least one book before checkout."),
});

export type CheckoutFieldName = (typeof checkoutFieldNames)[number];
export type CheckoutFormValues = z.input<typeof checkoutFormSchema>;
export type CheckoutSubmission = z.infer<typeof checkoutServerSchema>;
export type CheckoutCartItemInput = z.infer<typeof checkoutCartItemSchema>;

export type CheckoutActionState = {
  success: boolean;
  message: string;
  fieldErrors?: Partial<Record<CheckoutFieldName, string>>;
};

export type CheckoutPaymentSession = {
  orderId: string;
  reference: string;
  email: string;
  amountMinor: number;
  customerName: string;
  customerPhone: string;
  authorizationUrl: string;
};

export type CreateCheckoutOrderResult = CheckoutActionState & {
  data?: CheckoutPaymentSession;
};

export type VerifyCheckoutPaymentResult = CheckoutActionState & {
  data?: {
    orderId: string;
    serialNumber: number;
    reference: string;
  };
};

export const initialCheckoutActionState: CheckoutActionState = {
  success: false,
  message: "",
};
