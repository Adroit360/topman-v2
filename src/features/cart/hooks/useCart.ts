"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import {
  clearCartStorage,
  getCartStorageSnapshot,
  subscribeToCartStorage,
  writeCartToStorage,
} from "../services/cartStorage";
import type { AddToCartInput, CartContextValue, CartItem } from "../types/cart";

const CartContext = createContext<CartContextValue | null>(null);
const EMPTY_CART_ITEMS: CartItem[] = [];

const sanitizeQuantity = (quantity: number) => {
  if (!Number.isFinite(quantity)) {
    return 1;
  }

  return Math.max(1, Math.floor(quantity));
};

const normalizeCartItems = (items: CartItem[]) =>
  items.filter((item) => item.quantity > 0 && item.bookId && item.book.id);

const subscribeToHydration = () => () => undefined;

const getServerSnapshot = () => false;

const getClientSnapshot = () => true;

export const useCartState = (): CartContextValue => {
  const items = useSyncExternalStore(
    subscribeToCartStorage,
    getCartStorageSnapshot,
    () => EMPTY_CART_ITEMS,
  );
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientSnapshot,
    getServerSnapshot,
  );

  const commitCartItems = (nextItems: CartItem[]) => {
    const normalizedItems = normalizeCartItems(nextItems);

    if (normalizedItems.length === 0) {
      clearCartStorage();
      return;
    }

    writeCartToStorage(normalizedItems);
  };

  const addToCart = (input: AddToCartInput) => {
    const nextQuantity = sanitizeQuantity(input.quantity ?? 1);
    const existingItem = items.find((item) => item.bookId === input.id);

    if (existingItem) {
      commitCartItems(
        items.map((item) =>
          item.bookId === input.id
            ? {
                ...item,
                quantity: item.quantity + nextQuantity,
                book: {
                  id: input.id,
                  title: input.title,
                  image: input.image,
                  price: input.price,
                  isAvailable: input.isAvailable,
                  author: input.author,
                },
              }
            : item,
        ),
      );

      return;
    }

    commitCartItems([
      ...items,
      {
        bookId: input.id,
        quantity: nextQuantity,
        book: {
          id: input.id,
          title: input.title,
          image: input.image,
          price: input.price,
          isAvailable: input.isAvailable,
          author: input.author,
        },
      },
    ]);
  };

  const removeFromCart = (bookId: string) => {
    commitCartItems(items.filter((item) => item.bookId !== bookId));
  };

  const updateQuantity = (bookId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(bookId);
      return;
    }

    const nextQuantity = sanitizeQuantity(quantity);

    commitCartItems(
      items.map((item) =>
        item.bookId === bookId ? { ...item, quantity: nextQuantity } : item,
      ),
    );
  };

  const clearCart = () => {
    clearCartStorage();
  };

  const getCartItemQuantity = (bookId: string) =>
    items.find((item) => item.bookId === bookId)?.quantity ?? 0;

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce(
    (total, item) => total + item.book.price * item.quantity,
    0,
  );

  return {
    items,
    isHydrated,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItemQuantity,
    itemCount,
    subtotal,
  };
};

export const CartContextProvider = CartContext.Provider;

export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider.");
  }

  return context;
};
