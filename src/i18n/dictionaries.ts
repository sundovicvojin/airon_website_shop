import type { Locale } from "@/i18n/config";

export type ContentBlock = Readonly<{ title: string; body: string }>;

export type Dictionary = {
  common: { backHome: string; browseShop: string; close: string; comingSoon: string; draftNotice: string; emptyLabel: string; itemCount: string; learnMore: string };
  footer: { about: string; company: string; contact: string; cookies: string; copyright: string; disclaimer: string; legal: string; privacy: string; quality: string; returns: string; shipping: string; shop: string; statement: string; support: string; terms: string; verification: string };
  header: { about: string; account: string; cart: string; close: string; collections: string; language: string; menu: string; products: string; quality: string; search: string; shop: string; unavailable: string; verification: string };
  hero: { description: string; eyebrow: string; primaryAction: string; secondaryAction: string; titleFirst: string; titleSecond: string; visualNote: string };
  home: {
    featured: { eyebrow: string; title: string; description: string };
    collections: { eyebrow: string; title: string; body: string; empty: string; action: string };
    family: { eyebrow: string; title: string; body: string; note: string };
    why: { eyebrow: string; title: string; items: readonly ContentBlock[] };
    verification: { eyebrow: string; title: string; body: string; action: string };
    cta: { eyebrow: string; title: string; body: string; action: string };
  };
  language: { label: string };
  productPreview: { addToCart: string; description: string; eyebrow: string; previewOnly: string; stock: { DISABLED: string; IN_STOCK: string; LOW_STOCK: string; OUT_OF_STOCK: string }; title: string };
  quality: { body: string; eyebrow: string; imageAlt: string; methodBody: string; methodLabel: string; standardBody: string; standardLabel: string; title: string; verificationBody: string; verificationLabel: string };
  shop: { eyebrow: string; title: string; intro: string; count: string; searchLabel: string; searchPlaceholder: string; sortLabel: string; sortFeatured: string; sortNewest: string; sortLowHigh: string; sortHighLow: string; emptyTitle: string; emptyDescription: string };
  search: { title: string; label: string; placeholder: string; emptyTitle: string; emptyDescription: string; hint: string };
  cart: { title: string; subtotal: string; emptyTitle: string; emptyDescription: string; checkout: string; viewCart: string };
  collections: { eyebrow: string; title: string; intro: string; emptyTitle: string; emptyDescription: string };
  qualityPage: { eyebrow: string; title: string; intro: string; blocks: readonly ContentBlock[]; editable: string };
  verificationPage: { eyebrow: string; title: string; intro: string; blocks: readonly ContentBlock[]; notice: string };
  about: { eyebrow: string; title: string; intro: string; blocks: readonly ContentBlock[] };
  contact: { eyebrow: string; title: string; intro: string; name: string; email: string; subject: string; message: string; submit: string; disabled: string; required: string; invalidEmail: string };
  legal: Record<"terms" | "privacy" | "cookies" | "shipping" | "returns" | "disclaimer", { eyebrow: string; title: string; intro: string; blocks: readonly ContentBlock[] }>;
  notFound: { eyebrow: string; title: string; description: string };
  error: { eyebrow: string; title: string; description: string; retry: string };
  product: { unavailableTitle: string; unavailableDescription: string; quantity: string; addToCart: string; buyNow: string; description: string; specifications: string; storage: string; batch: string; coa: string; shipping: string; disclaimer: string; related: string; developmentOnly: string };
};

const dictionaries: Record<Locale, () => Promise<{ dictionary: Dictionary }>> = {
  en: () => import("@/i18n/locales/en"),
  sr: () => import("@/i18n/locales/sr"),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return (await dictionaries[locale]()).dictionary;
}
