import type { StaticImageData } from "next/image";

export type ProductStockState = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "DISABLED";

export type ProductCardModel = Readonly<{
  currency: "EUR";
  id: string;
  image: StaticImageData | string;
  imageAlt: string;
  name: string;
  priceAmount: number;
  slug: string;
  stockState: ProductStockState;
  strength: string;
}>;
