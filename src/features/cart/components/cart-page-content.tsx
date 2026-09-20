"use client";

import { BagIcon } from "@/components/icons/site-icons";
import { Button, ButtonLink } from "@/components/ui/button";
import { CartLines } from "@/features/cart/components/cart-lines";
import { useCart } from "@/features/cart/cart-context";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { formatMoney } from "@/lib/money";

export function CartPageContent({ copy, locale }: Readonly<{ copy: Dictionary; locale: Locale }>) {
  const { count, lines, subtotal } = useCart();
  const price = formatMoney(subtotal, "EUR", locale === "sr" ? "sr-Latn-RS" : "en-IE");
  return <>
    <header className="editorial-hero"><p className="type-eyebrow text-accent">{count} {locale === "sr" ? "artikala" : "items"}</p><h1>{copy.cart.title}</h1><p>{lines.length ? copy.cart.checkoutNote : copy.cart.emptyDescription}</p></header>
    {lines.length ? <section className="cart-page"><CartLines copy={copy.cart} locale={locale} /><div className="cart-page__summary"><div><span>{copy.cart.subtotal}</span><strong>{price}</strong></div><Button className="w-full" disabled>{copy.cart.checkout}</Button><p className="cart-checkout-note">{copy.cart.checkoutNote}</p><ButtonLink className="w-full" href={`/${locale}/shop`} variant="secondary">{copy.common.browseShop}</ButtonLink></div></section>
      : <section className="cart-page-empty"><BagIcon className="size-8 text-accent" /><h2>{copy.cart.emptyTitle}</h2><div><span>{copy.cart.subtotal}</span><strong>{price}</strong></div><ButtonLink href={`/${locale}/shop`}>{copy.common.browseShop}</ButtonLink></section>}
  </>;
}
