"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { z } from "zod";

import { isPurchasableProduct } from "@/features/cart/eligibility";
import type { CartLine, CartProduct } from "@/features/cart/types";

const storageKey = "airon-cart-v1";
const cartLineSchema = z.object({
  currency: z.literal("EUR"), id: z.string().min(1), name: z.string().min(1), priceAmount: z.number().int().nonnegative(),
  quantity: z.number().int().positive(), slug: z.string().min(1), stockQuantity: z.number().int().nonnegative(),
  stockState: z.enum(["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "DISABLED"]), strength: z.string(), unit: z.string().optional(),
});
const storedCartSchema = z.array(cartLineSchema).max(100);

type CartContextValue = Readonly<{
  addItem: (product: CartProduct, quantity?: number) => boolean;
  closeCart: () => void;
  count: number;
  decreaseItem: (id: string) => void;
  increaseItem: (id: string) => void;
  lines: readonly CartLine[];
  openCart: () => void;
  open: boolean;
  removeItem: (id: string) => void;
  subtotal: number;
}>;

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart() {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = storedCartSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data.filter(isPurchasableProduct).map((line) => ({ ...line, quantity: Math.min(line.quantity, line.stockQuantity) })) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hydrate = window.setTimeout(() => {
      setLines(readStoredCart());
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(hydrate);
  }, []);

  useEffect(() => {
    if (loaded) window.localStorage.setItem(storageKey, JSON.stringify(lines));
  }, [lines, loaded]);

  const addItem = useCallback((product: CartProduct, quantity = 1) => {
    if (!isPurchasableProduct(product) || quantity < 1) return false;
    setLines((current) => {
      const existing = current.find((line) => line.id === product.id);
      if (!existing) return [...current, { ...product, quantity: Math.min(quantity, product.stockQuantity) }];
      return current.map((line) => line.id === product.id
        ? { ...product, quantity: Math.min(line.quantity + quantity, product.stockQuantity) }
        : line);
    });
    return true;
  }, []);
  const removeItem = useCallback((id: string) => setLines((current) => current.filter((line) => line.id !== id)), []);
  const decreaseItem = useCallback((id: string) => setLines((current) => current.flatMap((line) => line.id !== id ? [line] : line.quantity > 1 ? [{ ...line, quantity: line.quantity - 1 }] : [])), []);
  const increaseItem = useCallback((id: string) => setLines((current) => current.map((line) => line.id === id ? { ...line, quantity: Math.min(line.quantity + 1, line.stockQuantity) } : line)), []);
  const value = useMemo<CartContextValue>(() => ({
    addItem, closeCart: () => setOpen(false), count: lines.reduce((sum, line) => sum + line.quantity, 0), decreaseItem,
    increaseItem, lines, openCart: () => setOpen(true), open, removeItem,
    subtotal: lines.reduce((sum, line) => sum + line.priceAmount * line.quantity, 0),
  }), [addItem, decreaseItem, increaseItem, lines, open, removeItem]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider.");
  return value;
}
