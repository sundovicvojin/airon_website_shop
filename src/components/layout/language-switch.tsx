"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Locale } from "@/i18n/config";

type LanguageSwitchProps = Readonly<{ className?: string; label: string; locale: Locale }>;

export function LanguageSwitch({ className, label, locale }: LanguageSwitchProps) {
  const pathname = usePathname();
  const alternateLocale: Locale = locale === "en" ? "sr" : "en";
  const href = pathname.replace(/^\/(en|sr)(?=\/|$)/, `/${alternateLocale}`);

  return <Link aria-label={`${label}: ${alternateLocale.toUpperCase()}`} className={className} href={href || `/${alternateLocale}`} hrefLang={alternateLocale} lang={alternateLocale}>{locale.toUpperCase()}</Link>;
}
