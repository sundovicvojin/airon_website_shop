"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { BagIcon, CloseIcon } from "@/components/icons/site-icons";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/cart-context";
import { CartLines } from "@/features/cart/components/cart-lines";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

type CartDrawerProps = Readonly<{ copy: Dictionary["cart"]; instanceId: string; locale: Locale; triggerLabel: string }>;

export function CartDrawer({ copy, instanceId, locale, triggerLabel }: CartDrawerProps) {
  const { closeCart, count, lines, open, openCart, subtotal } = useCart();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const triggerVisible = Boolean(triggerRef.current?.getClientRects().length);
    if (open && triggerVisible && !dialog.open) dialog.showModal();
    if ((!open || !triggerVisible) && dialog.open) dialog.close();
  }, [open]);

  const price = new Intl.NumberFormat(locale === "sr" ? "sr-Latn-RS" : "en-IE", { currency: "EUR", style: "currency" }).format(subtotal / 100);

  return <>
    <button aria-label={`${triggerLabel}: ${count}`} className="header-icon header-cart" onClick={openCart} ref={triggerRef} type="button"><BagIcon className="size-[1.15rem]" /><span>{count}</span></button>
    <dialog aria-labelledby={`${instanceId}-title`} className="cart-drawer" onCancel={closeCart} onClose={closeCart} ref={dialogRef}>
      <div className="cart-drawer__panel">
        <div className="cart-drawer__header"><h2 id={`${instanceId}-title`}>{copy.title}</h2><button aria-label="Close" className="header-icon" onClick={closeCart} type="button"><CloseIcon className="size-5" /></button></div>
        {lines.length ? <CartLines copy={copy} locale={locale} /> : <div className="cart-drawer__empty"><BagIcon className="size-7 text-accent" /><h3>{copy.emptyTitle}</h3><p>{copy.emptyDescription}</p></div>}
        <div className="cart-drawer__footer"><div><span>{copy.subtotal}</span><strong>{price}</strong></div><Button className="w-full" disabled>{copy.checkout}</Button><p className="cart-checkout-note">{copy.checkoutNote}</p><Link className="text-center text-xs uppercase tracking-[0.14em] text-ink-muted underline underline-offset-4" href={`/${locale}/cart`} onClick={closeCart}>{copy.viewCart}</Link></div>
      </div>
    </dialog>
  </>;
}
