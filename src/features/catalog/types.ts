import type { StaticImageData } from "next/image";

export type ProductStockState = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "DISABLED";

export type ProductCardModel = Readonly<{
  comparePriceAmount?: number;
  currency: "EUR";
  featured?: boolean;
  id: string;
  image: StaticImageData | string;
  imageAlt: string;
  name: string;
  priceAmount: number;
  shortName?: string;
  slug: string;
  stockState: ProductStockState;
  strength: string;
  unit?: string;
}>;

export type ProductDetailModel = ProductCardModel & Readonly<{
  gallery: readonly (StaticImageData | string)[];
  shortDescription: string;
  description: string;
  specifications: readonly Readonly<{ label: string; value: string }>[];
  storageInformation: string;
  batchInformation: string;
  coaAvailable: boolean;
  shippingInformation: string;
  disclaimer: string;
}>;
