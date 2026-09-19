"use client";

import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { ProductDetailModel } from "@/features/catalog/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

type ProductDetailProps = Readonly<{ copy: Dictionary["product"]; locale: Locale; product: ProductDetailModel }>;

export function ProductDetail({ copy, locale, product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const price = new Intl.NumberFormat(locale === "sr" ? "sr-Latn-RS" : "en-IE", { currency: product.currency, style: "currency" }).format(product.priceAmount / 100);
  return <main className="product-detail">
    <div className="product-detail__gallery">{product.gallery.map((image, index) => <div className="product-detail__image" key={index}><Image alt={index === 0 ? product.imageAlt : ""} fill placeholder={typeof image === "string" ? "empty" : "blur"} priority={index === 0} sizes="(max-width: 767px) 100vw, 55vw" src={image} /></div>)}</div>
    <aside className="product-detail__summary"><p className="type-eyebrow text-warning">{copy.developmentOnly}</p><h1>{product.name}</h1><p className="product-detail__strength">{product.strength} {product.unit}</p><p className="product-detail__price">{price}</p><p className="product-detail__short">{product.shortDescription}</p><div className="quantity-control"><span>{copy.quantity}</span><button aria-label="Decrease quantity" disabled={quantity === 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))} type="button">−</button><output>{quantity}</output><button aria-label="Increase quantity" onClick={() => setQuantity((value) => value + 1)} type="button">+</button></div><Button className="w-full" disabled>{copy.addToCart}</Button><Button className="mt-3 w-full" disabled variant="secondary">{copy.buyNow}</Button>
      <div className="product-detail__accordions"><details open><summary>{copy.description}</summary><p>{product.description}</p></details><details><summary>{copy.specifications}</summary><dl>{product.specifications.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl></details><details><summary>{copy.storage}</summary><p>{product.storageInformation}</p></details><details><summary>{copy.batch}</summary><p>{product.batchInformation}</p></details><details><summary>{copy.coa}</summary><p>{product.coaAvailable ? "Available" : "Not available"}</p></details><details><summary>{copy.shipping}</summary><p>{product.shippingInformation}</p></details><details><summary>{copy.disclaimer}</summary><p>{product.disclaimer}</p></details></div>
    </aside>
  </main>;
}
