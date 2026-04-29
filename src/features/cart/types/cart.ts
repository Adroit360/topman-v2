export type CartBookSnapshot = {
  id: string;
  title: string;
  image: string | null;
  price: number;
  isAvailable: boolean;
  author: string;
};

export type CartItem = {
  bookId: string;
  quantity: number;
  book: CartBookSnapshot;
};

export type CartStoragePayload = {
  items: CartItem[];
};

export type AddToCartInput = CartBookSnapshot & {
  quantity?: number;
};

export type CartContextValue = {
  items: CartItem[];
  isHydrated: boolean;
  addToCart: (input: AddToCartInput) => void;
  removeFromCart: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
  getCartItemQuantity: (bookId: string) => number;
  itemCount: number;
  subtotal: number;
};
