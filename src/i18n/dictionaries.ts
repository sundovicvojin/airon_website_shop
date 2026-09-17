import type { Locale } from "@/i18n/config";

export type Dictionary = {
  foundation: {
    status: string;
    eyebrow: string;
    title: string;
    description: string;
    action: string;
    footer: string;
  };
  language: {
    label: string;
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
