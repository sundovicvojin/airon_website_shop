"use client";

import Link from "next/link";

import { useCart } from "@/features/cart/cart-context";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { formatMoney } from "@/lib/money";

export function CartLines({ copy, locale }: Readonly<{ copy: Dictionary["cart"]; locale: Locale }>) {
  const { decreaseItem, increaseItem, lines, removeItem } = useCart();
  const numberLocale = locale === "sr" ? "sr-Latn-RS" : "en-IE";

  return <ul className="cart-lines">
    {lines.map((line) => <li className="cart-line" key={line.id}>
      <div className="cart-line__heading">
        <div><Link href={`/${locale}/products/${line.slug}`}>{line.name}</Link><small>{line.strength} {line.unit}</small></div>
        <strong>{formatMoney(line.priceAmount * line.quantity, line.currency, numberLocale)}</strong>
      </div>
      <div className="cart-line__actions">
        <div className="cart-line__quantity">
          <button aria-label={`${copy.decrease}: ${line.name}`} onClick={() => decreaseItem(line.id)} type="button">−</button>
          <output aria-label={`${line.quantity}`}>{line.quantity}</output>
          <button aria-label={`${copy.increase}: ${line.name}`} disabled={line.quantity >= line.stockQuantity} onClick={() => increaseItem(line.id)} type="button">+</button>
        </div>
        <button className="cart-line__remove" onClick={() => removeItem(line.id)} type="button">{copy.remove}</button>
      </div>
    </li>)}
  </ul>;
}
