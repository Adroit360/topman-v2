"use client";

import type { ReactNode } from "react";
import { CartContextProvider, useCartState } from "../hooks/useCart";

type CartProviderProps = {
  children: ReactNode;
};

export const CartProvider = ({ children }: CartProviderProps) => {
  const value = useCartState();

  return <CartContextProvider value={value}>{children}</CartContextProvider>;
};
