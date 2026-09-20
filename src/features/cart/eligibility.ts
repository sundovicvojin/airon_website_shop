import type { ProductCardModel } from "@/features/catalog/types";

export function isPurchasableProduct(product: Pick<ProductCardModel, "stockQuantity" | "stockState">) {
  return (product.stockState === "IN_STOCK" || product.stockState === "LOW_STOCK")
    && (product.stockQuantity ?? 0) > 0;
}
