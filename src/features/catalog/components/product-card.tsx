import Image from "next/image";

import { ArrowIcon } from "@/components/icons/site-icons";
import type { ProductCardModel, ProductStockState } from "@/features/catalog/types";
import type { Locale } from "@/i18n/config";

type ProductCardCopy = Readonly<{
  addToCart: string;
  previewOnly: string;
  stock: Record<ProductStockState, string>;
}>;

type ProductCardProps = Readonly<{
  copy: ProductCardCopy;
  locale: Locale;
  product: ProductCardModel;
}>;

export function ProductCard({ copy, locale, product }: ProductCardProps) {
  const price = new Intl.NumberFormat(locale === "sr" ? "sr-Latn-RS" : "en-IE", {
    currency: product.currency,
    style: "currency",
  }).format(product.priceAmount / 100);

  return (
    <article className="product-card">
      <div className="product-card__media">
        <Image
          alt={product.imageAlt}
          className="product-card__image"
          fill
          placeholder="blur"
          sizes="(max-width: 767px) 92vw, (max-width: 1279px) 45vw, 32vw"
          src={product.image}
        />
        <span className="product-card__preview">{copy.previewOnly}</span>
        <span className="product-card__index">A — 01</span>
      </div>

      <div className="product-card__content">
        <div>
          <p className="product-card__status">
            <span aria-hidden="true" />
            {copy.stock[product.stockState]}
          </p>
          <h3>{product.name}</h3>
        </div>
        <p className="product-card__strength">{product.strength}</p>
      </div>

      <div className="product-card__commerce">
        <p>{price}</p>
        <button aria-label={`${copy.addToCart} — ${copy.previewOnly}`} disabled type="button">
          {copy.addToCart}
          <ArrowIcon className="size-4" />
        </button>
      </div>
    </article>
  );
}
