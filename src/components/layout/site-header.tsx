"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Wordmark } from "@/components/brand/wordmark";
import { BagIcon, CloseIcon, MenuIcon, SearchIcon, UserIcon } from "@/components/icons/site-icons";
import type { Locale } from "@/i18n/config";

export type HeaderCopy = Readonly<{
  about: string;
  account: string;
  cart: string;
  close: string;
  collections: string;
  language: string;
  menu: string;
  products: string;
  quality: string;
  search: string;
  shop: string;
  unavailable: string;
  verification: string;
}>;

type SiteHeaderProps = Readonly<{
  copy: HeaderCopy;
  locale: Locale;
}>;

export function SiteHeader({ copy, locale }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const alternateLocale = locale === "en" ? "sr" : "en";

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 18);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (menuOpen && !dialog.open) {
      dialog.showModal();
    } else if (!menuOpen && dialog.open) {
      dialog.close();
    }
  }, [menuOpen]);

  const navigation = [
    { href: `/${locale}/shop`, label: copy.shop },
    { href: `/${locale}/shop`, label: copy.products },
    { href: "#product-preview", label: copy.collections },
    { href: "#quality", label: copy.quality },
    { href: "#verification", label: copy.verification },
    { href: "#about", label: copy.about },
  ];

  return (
    <>
      <header className="site-header" data-scrolled={scrolled ? "true" : "false"}>
        <div className="site-header__desktop">
          <Wordmark href={`/${locale}`} />

          <nav aria-label={copy.menu} className="site-header__nav">
            {navigation.map((item) => (
              <Link className="site-header__nav-link" href={item.href} key={item.label}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="site-header__actions">
            <button aria-label={`${copy.search} — ${copy.unavailable}`} className="header-icon" disabled type="button">
              <SearchIcon className="size-[1.15rem]" />
            </button>
            <Link
              aria-label={`${copy.language}: ${alternateLocale.toUpperCase()}`}
              className="header-language"
              href={`/${alternateLocale}`}
              lang={alternateLocale}
            >
              {locale.toUpperCase()}
            </Link>
            <button aria-label={`${copy.account} — ${copy.unavailable}`} className="header-icon" disabled type="button">
              <UserIcon className="size-[1.15rem]" />
            </button>
            <button aria-label={`${copy.cart}: 0 — ${copy.unavailable}`} className="header-icon header-cart" disabled type="button">
              <BagIcon className="size-[1.15rem]" />
              <span>0</span>
            </button>
          </div>
        </div>

        <div className="site-header__mobile">
          <button
            aria-controls="mobile-navigation"
            aria-expanded={menuOpen}
            aria-label={copy.menu}
            className="header-icon justify-self-start"
            onClick={() => setMenuOpen(true)}
            type="button"
          >
            <MenuIcon className="size-5" />
          </button>

          <Wordmark href={`/${locale}`} />

          <div className="flex items-center justify-self-end">
            <button aria-label={`${copy.search} — ${copy.unavailable}`} className="header-icon" disabled type="button">
              <SearchIcon className="size-[1.15rem]" />
            </button>
            <button aria-label={`${copy.cart}: 0 — ${copy.unavailable}`} className="header-icon header-cart" disabled type="button">
              <BagIcon className="size-[1.15rem]" />
              <span>0</span>
            </button>
          </div>
        </div>
      </header>

      <dialog
        aria-labelledby="mobile-navigation-title"
        className="mobile-menu"
        id="mobile-navigation"
        onCancel={() => setMenuOpen(false)}
        onClose={() => setMenuOpen(false)}
        ref={dialogRef}
      >
        <div className="mobile-menu__inner">
          <div className="mobile-menu__header">
            <Wordmark href={`/${locale}`} />
            <button aria-label={copy.close} className="header-icon" onClick={() => setMenuOpen(false)} type="button">
              <CloseIcon className="size-5" />
            </button>
          </div>

          <p className="sr-only" id="mobile-navigation-title">
            {copy.menu}
          </p>

          <nav aria-label={copy.menu} className="mobile-menu__nav">
            {navigation.map((item, index) => (
              <Link
                className="mobile-menu__link"
                href={item.href}
                key={item.label}
                onClick={() => setMenuOpen(false)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mobile-menu__footer">
            <span>{copy.language}</span>
            <div className="flex gap-4">
              <Link className={locale === "en" ? "text-ink" : undefined} href="/en" lang="en">
                EN
              </Link>
              <Link className={locale === "sr" ? "text-ink" : undefined} href="/sr" lang="sr">
                SR
              </Link>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
