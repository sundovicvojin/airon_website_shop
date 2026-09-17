import productFixtureImage from "../../public/images/art-direction/airon-product-fixture.png";

import type { ProductCardModel } from "@/features/catalog/types";

const developmentProductFixture: ProductCardModel = {
  currency: "EUR",
  id: "development-visual-study-01",
  image: productFixtureImage,
  imageAlt: "Unbranded smoked-glass vial used only to preview the AIRON product-card design",
  name: "Formula 01 — Design Study",
  priceAmount: 12800,
  slug: "development-visual-study-01",
  stockState: "IN_STOCK",
  strength: "10 MG",
};

export function getDevelopmentProductFixture(): ProductCardModel | null {
  return process.env.NODE_ENV === "development" ? developmentProductFixture : null;
}
