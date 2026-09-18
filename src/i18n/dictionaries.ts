import type { Locale } from "@/i18n/config";

export type Dictionary = {
  footer: {
    company: string;
    contact: string;
    cookies: string;
    copyright: string;
    disclaimer: string;
    legal: string;
    privacy: string;
    quality: string;
    returns: string;
    shipping: string;
    shop: string;
    statement: string;
    support: string;
    terms: string;
  };
  header: {
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
  };
  hero: {
    description: string;
    eyebrow: string;
    primaryAction: string;
    secondaryAction: string;
    titleFirst: string;
    titleSecond: string;
    visualNote: string;
  };
  language: {
    label: string;
  };
  productPreview: {
    addToCart: string;
    description: string;
    eyebrow: string;
    previewOnly: string;
    stock: {
      DISABLED: string;
      IN_STOCK: string;
      LOW_STOCK: string;
      OUT_OF_STOCK: string;
    };
    title: string;
  };
  quality: {
    body: string;
    eyebrow: string;
    imageAlt: string;
    methodBody: string;
    methodLabel: string;
    standardBody: string;
    standardLabel: string;
    title: string;
    verificationBody: string;
    verificationLabel: string;
  };
  shop: {
    eyebrow: string;
    title: string;
    emptyTitle: string;
    emptyDescription: string;
  };
};

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("@/i18n/locales/en").then((module) => module.dictionary),
  sr: () => import("@/i18n/locales/sr").then((module) => module.dictionary),
};

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]();
}
