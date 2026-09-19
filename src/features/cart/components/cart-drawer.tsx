"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { BagIcon, CloseIcon } from "@/components/icons/site-icons";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

type CartDrawerProps = Readonly<{ copy: Dictionary["cart"]; instanceId: string; locale: Locale; triggerLabel: string }>;

export function CartDrawer({ copy, instanceId, locale, triggerLabel }: CartDrawerProps) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return <>
    <button aria-label={`${triggerLabel}: 0`} className="header-icon header-cart" onClick={() => setOpen(true)} type="button"><BagIcon className="size-[1.15rem]" /><span>0</span></button>
    <dialog aria-labelledby={`${instanceId}-title`} className="cart-drawer" onCancel={() => setOpen(false)} onClose={() => setOpen(false)} ref={dialogRef}>
      <div className="cart-drawer__panel">
        <div className="cart-drawer__header"><h2 id={`${instanceId}-title`}>{copy.title}</h2><button aria-label="Close" className="header-icon" onClick={() => setOpen(false)} type="button"><CloseIcon className="size-5" /></button></div>
        <div className="cart-drawer__empty"><BagIcon className="size-7 text-accent" /><h3>{copy.emptyTitle}</h3><p>{copy.emptyDescription}</p></div>
        <div className="cart-drawer__footer"><div><span>{copy.subtotal}</span><strong>€0.00</strong></div><Button className="w-full" disabled>{copy.checkout}</Button><Link className="text-center text-xs uppercase tracking-[0.14em] text-ink-muted underline underline-offset-4" href={`/${locale}/cart`} onClick={() => setOpen(false)}>{copy.viewCart}</Link></div>
      </div>
    </dialog>
  </>;
}
