"use client";

import Image from "next/image";
import Link from "next/link";

import { ArrowIcon } from "@/components/icons/site-icons";
import type { ProductCardModel, ProductStockState } from "@/features/catalog/types";
import type { Locale } from "@/i18n/config";

type ProductCardCopy = Readonly<{
  addToCart: string;
  previewOnly: string;
  stock: Record<ProductStockState, string>;
}>;

type ProductCardProps = Readonly<{
  addToCart?: () => void;
  copy: ProductCardCopy;
  locale: Locale;
  product: ProductCardModel;
  href?: string;
}>;

export function ProductCard({ addToCart, copy, href, locale, product }: ProductCardProps) {
  const price = new Intl.NumberFormat(locale === "sr" ? "sr-Latn-RS" : "en-IE", {
    currency: product.currency,
    style: "currency",
  }).format(product.priceAmount / 100);
  const comparePrice = product.comparePriceAmount
    ? new Intl.NumberFormat(locale === "sr" ? "sr-Latn-RS" : "en-IE", { currency: product.currency, style: "currency" }).format(product.comparePriceAmount / 100)
    : null;
  const disabled = !addToCart || product.stockState === "OUT_OF_STOCK" || product.stockState === "DISABLED";

  const media = (
    <div className="product-card__media">
        <Image
          alt={product.imageAlt}
          className="product-card__image"
          fill
          placeholder={typeof product.image === "string" ? "empty" : "blur"}
          sizes="(max-width: 767px) 92vw, (max-width: 1279px) 45vw, 32vw"
          src={product.image}
        />
        <span className="product-card__preview">{copy.previewOnly}</span>
        <span className="product-card__index">A — 01</span>
    </div>
  );

  return (
    <article className="product-card" data-featured={product.featured ? "true" : "false"} data-stock={product.stockState}>
      {href ? <Link aria-label={product.name} href={href}>{media}</Link> : media}

      <div className="product-card__content">
        <div>
          <p className="product-card__status">
            <span aria-hidden="true" />
            {copy.stock[product.stockState]}
          </p>
          <h3>{href ? <Link href={href}>{product.name}</Link> : product.name}</h3>
        </div>
        <p className="product-card__strength">{product.strength}</p>
      </div>

      <div className="product-card__commerce">
        <p>{price}{comparePrice ? <del className="ml-2 text-ink-subtle">{comparePrice}</del> : null}</p>
        <button aria-label={copy.addToCart} disabled={disabled} onClick={addToCart} type="button">
          {copy.addToCart}
          <ArrowIcon className="size-4" />
        </button>
      </div>
    </article>
  );
}
