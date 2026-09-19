import productFixtureImage from "../../public/images/art-direction/airon-product-fixture.png";

import type { ProductCardModel, ProductDetailModel } from "@/features/catalog/types";

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
  unit: "VIAL",
};

const developmentProductDetailFixture: ProductDetailModel = {
  ...developmentProductFixture,
  batchInformation: "Development preview — no production batch data",
  coaAvailable: false,
  description: "A visual-development object used to validate AIRON product-detail composition. It is not a commercial product and is excluded from production builds.",
  disclaimer: "Development fixture only. Not for sale and not product information.",
  gallery: [productFixtureImage],
  shippingInformation: "Shipping is not configured in Phase 3.",
  shortDescription: "An internal visual study for image scale, hierarchy and responsive behaviour.",
  specifications: [{ label: "Status", value: "Development fixture" }, { label: "Commerce", value: "Disabled" }],
  storageInformation: "Not applicable to this development fixture.",
};

export function getDevelopmentProductFixture(): ProductCardModel | null {
  return process.env.NODE_ENV === "development" ? developmentProductFixture : null;
}

export function getDevelopmentProductDetailFixture(slug: string): ProductDetailModel | null {
  return process.env.NODE_ENV === "development" && slug === developmentProductDetailFixture.slug
    ? developmentProductDetailFixture
    : null;
}
