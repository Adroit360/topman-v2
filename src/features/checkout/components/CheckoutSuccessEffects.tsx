"use client";

import { useEffect } from "react";
import { clearCartStorage } from "@/features/cart/services/cartStorage";

export const CheckoutSuccessEffects = ({ success }: { success: boolean }) => {
  useEffect(() => {
    if (!success) {
      return;
    }

    clearCartStorage();
  }, [success]);

  return null;
};
