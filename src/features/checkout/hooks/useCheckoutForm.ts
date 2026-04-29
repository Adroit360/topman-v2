"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useCart } from "@/features/cart";
import { createCheckoutOrder } from "../services/createCheckoutOrder";
import {
  checkoutFieldNames,
  checkoutFormSchema,
  initialCheckoutActionState,
  type CheckoutFieldName,
  type CheckoutFormValues,
  type CheckoutPaymentSession,
  type CreateCheckoutOrderResult,
} from "../types/checkout";

const mapFieldErrors = (
  result: Pick<CreateCheckoutOrderResult, "fieldErrors">,
  setError: ReturnType<typeof useForm<CheckoutFormValues>>["setError"],
) => {
  const fieldErrors = result.fieldErrors ?? {};

  for (const [fieldName, message] of Object.entries(fieldErrors)) {
    if (
      !message ||
      !checkoutFieldNames.includes(fieldName as CheckoutFieldName)
    ) {
      continue;
    }

    setError(fieldName as CheckoutFieldName, {
      type: "server",
      message,
    });
  }
};

export const useCheckoutForm = () => {
  const { items, subtotal } = useCart();
  const cartItems = useMemo(
    () =>
      items.map((item) => ({ bookId: item.bookId, quantity: item.quantity })),
    [items],
  );
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      location: "",
      notes: "",
    },
  });
  const [result, setResult] = useState(initialCheckoutActionState);
  const [isPending, startTransition] = useTransition();
  const [pendingPayment, setPendingPayment] =
    useState<CheckoutPaymentSession | null>(null);

  const redirectToPaymentPage = (authorizationUrl: string) => {
    if (!authorizationUrl) {
      return;
    }

    window.location.assign(authorizationUrl);
  };

  const resumePendingPayment = () => {
    if (!pendingPayment || isPending) {
      return;
    }

    setResult(initialCheckoutActionState);
    redirectToPaymentPage(pendingPayment.authorizationUrl);
  };

  const submitCheckout = form.handleSubmit((values) => {
    if (cartItems.length === 0 || subtotal <= 0) {
      setResult({
        success: false,
        message: "Your cart is empty. Add books before checkout.",
      });
      return;
    }

    if (pendingPayment) {
      setResult(initialCheckoutActionState);
      redirectToPaymentPage(pendingPayment.authorizationUrl);
      return;
    }

    setResult(initialCheckoutActionState);

    startTransition(async () => {
      const checkoutOrder = await createCheckoutOrder({
        ...values,
        items: cartItems,
      });

      if (!checkoutOrder.success || !checkoutOrder.data) {
        setResult(checkoutOrder);
        mapFieldErrors(checkoutOrder, form.setError);
        return;
      }

      setPendingPayment(checkoutOrder.data);
      setResult({
        success: true,
        message: "Redirecting to the Paystack payment page.",
      });
      redirectToPaymentPage(checkoutOrder.data.authorizationUrl);
    });
  });

  return {
    form,
    result,
    isPending,
    pendingPayment,
    resumePendingPayment,
    submitCheckout,
  };
};
