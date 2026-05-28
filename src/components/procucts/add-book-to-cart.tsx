"use client";

import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart";
import { useState } from "react";
import type { BookTypes } from "@/features/home/types/book-types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Field, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

export default function AddBookToCart({ book }: { book: BookTypes }) {
  const { addToCart, getCartItemQuantity, removeFromCart, updateQuantity } = useCart();
  const currentQuantity = getCartItemQuantity(book.id);

  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(Math.max(1, currentQuantity || 1));

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (nextOpen) {
      setQuantity(Math.max(1, currentQuantity || 1));
    }
  };

  const handleSave = () => {
    if (currentQuantity > 0) {
      updateQuantity(book.id, quantity);
    } else {
      addToCart({
        id: book.id,
        title: book.title,
        image: book.image,
        price: book.price,
        isAvailable: book.isAvailable,
        author: book.author,
        quantity,
      });
    }

    setOpen(false);
  };

  const handleRemove = () => {
    removeFromCart(book.id);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="sm:h-10 w-full rounded-full bg-orange-600 text-xs sm:text-sm font-medium text-white shadow-none transition duration-300 hover:bg-orange-500 disabled:bg-slate-200 disabled:text-slate-500" disabled={!book.isAvailable}>
          <ShoppingBag className="me-2 size-3 sm:size-4" />
          {book.isAvailable ? (currentQuantity > 0 ? "Update Cart" : "Add to Cart") : "Out of Stock"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{book.title}</DialogTitle>
          <DialogDescription>{currentQuantity > 0 ? "Update the quantity of this book in your cart." : "Add this book to your cart."}</DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
          <Input
            id="quantity"
            type="number"
            min={1}
            value={quantity}
            onChange={(event) => {
              const nextQuantity = Number(event.target.value);
              setQuantity(Number.isNaN(nextQuantity) ? 1 : Math.max(1, nextQuantity));
            }}
          />
        </Field>
        <DialogFooter className="gap-x-2">
          <Button variant={"outline"} onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          {currentQuantity > 0 ? (
            <Button variant={"destructive"} onClick={handleRemove}>
              Remove
            </Button>
          ) : null}
          <Button onClick={handleSave}>{currentQuantity > 0 ? "Save changes" : "Add to cart"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
