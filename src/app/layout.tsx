import type { Metadata } from "next";
import { headers } from "next/headers";
import type { ReactNode } from "react";

import { siteConfig } from "@/config/site";
import { defaultLocale, isLocale } from "@/i18n/config";

import "@fontsource-variable/manrope/wght.css";
import "@fontsource-variable/newsreader/wght.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.fallbackUrl),
  title: {
    default: siteConfig.name,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  robots: {
    index: false,
    follow: false,
  },
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function RootLayout({ children }: RootLayoutProps) {
  const requestHeaders = await headers();
  const requestedLocale = requestHeaders.get("x-airon-locale") ?? defaultLocale;
  const locale = isLocale(requestedLocale) ? requestedLocale : defaultLocale;

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
