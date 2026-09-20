import type { ProductStockState } from "@/features/catalog/types";

export type CartProduct = Readonly<{
  currency: "EUR";
  id: string;
  name: string;
  priceAmount: number;
  slug: string;
  stockQuantity: number;
  stockState: ProductStockState;
  strength: string;
  unit?: string;
}>;

export type CartLine = Readonly<CartProduct & { quantity: number }>;
