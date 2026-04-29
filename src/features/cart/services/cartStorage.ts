import { z } from "zod";
import type { CartItem, CartStoragePayload } from "../types/cart";

const CART_STORAGE_KEY = "topman.cart";
const CART_STORAGE_EVENT = "topman:cart-storage-change";

let cachedRawCartValue: string | null | undefined;
let cachedCartItems: CartItem[] = [];

const cartItemSchema = z.object({
  bookId: z.string().min(1),
  quantity: z.number().int().positive(),
  book: z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    image: z.string().nullable(),
    price: z.number().nonnegative(),
    isAvailable: z.boolean(),
    author: z.string().min(1),
  }),
});

const cartStoragePayloadSchema = z.object({
  items: z.array(cartItemSchema),
});

const canUseStorage = () => typeof window !== "undefined";

const emitCartStorageChange = () => {
  if (!canUseStorage()) {
    return;
  }

  window.dispatchEvent(new Event(CART_STORAGE_EVENT));
};

export const getCartStorageKey = () => CART_STORAGE_KEY;

export const readCartFromStorage = (): CartItem[] => {
  if (!canUseStorage()) {
    return [];
  }

  const rawValue = window.localStorage.getItem(CART_STORAGE_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as CartStoragePayload;
    const result = cartStoragePayloadSchema.safeParse(parsed);

    if (!result.success) {
      return [];
    }

    return result.data.items;
  } catch {
    return [];
  }
};

export const getCartStorageSnapshot = (): CartItem[] => {
  if (!canUseStorage()) {
    return [];
  }

  const rawValue = window.localStorage.getItem(CART_STORAGE_KEY);

  if (rawValue === cachedRawCartValue) {
    return cachedCartItems;
  }

  if (!rawValue) {
    cachedRawCartValue = rawValue;
    cachedCartItems = [];
    return cachedCartItems;
  }

  try {
    const parsed = JSON.parse(rawValue) as CartStoragePayload;
    const result = cartStoragePayloadSchema.safeParse(parsed);

    cachedRawCartValue = rawValue;
    cachedCartItems = result.success ? result.data.items : [];

    return cachedCartItems;
  } catch {
    cachedRawCartValue = rawValue;
    cachedCartItems = [];
    return cachedCartItems;
  }
};

export const writeCartToStorage = (items: CartItem[]) => {
  if (!canUseStorage()) {
    return;
  }

  const payload: CartStoragePayload = { items };
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(payload));
  emitCartStorageChange();
};

export const clearCartStorage = () => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(CART_STORAGE_KEY);
  emitCartStorageChange();
};

export const subscribeToCartStorage = (onStoreChange: () => void) => {
  if (!canUseStorage()) {
    return () => undefined;
  }

  const handleStorageChange = (event: StorageEvent) => {
    if (!event.key || event.key === CART_STORAGE_KEY) {
      onStoreChange();
    }
  };

  window.addEventListener("storage", handleStorageChange);
  window.addEventListener(CART_STORAGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener(CART_STORAGE_EVENT, onStoreChange);
  };
};
