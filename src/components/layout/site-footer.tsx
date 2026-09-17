import Link from "next/link";

import { Wordmark } from "@/components/brand/wordmark";
import { ArrowIcon } from "@/components/icons/site-icons";
import type { Locale } from "@/i18n/config";

export type FooterCopy = Readonly<{
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
}>;

type SiteFooterProps = Readonly<{
  copy: FooterCopy;
  locale: Locale;
}>;

export function SiteFooter({ copy, locale }: SiteFooterProps) {
  const groups = [
    {
      label: copy.shop,
      links: [
        { href: `/${locale}/shop`, label: copy.shop },
        { href: "#quality", label: copy.quality },
      ],
    },
    {
      label: copy.company,
      links: [
        { href: "#about", label: copy.company },
        { href: "#verification", label: copy.quality },
      ],
    },
    {
      label: copy.support,
      links: [
        { href: "#footer", label: copy.contact },
        { href: "#footer", label: copy.shipping },
        { href: "#footer", label: copy.returns },
      ],
    },
    {
      label: copy.legal,
      links: [
        { href: "#footer", label: copy.privacy },
        { href: "#footer", label: copy.terms },
        { href: "#footer", label: copy.cookies },
        { href: "#footer", label: copy.disclaimer },
      ],
    },
  ];

  return (
    <footer className="site-footer" id="footer">
      <div className="site-footer__top">
        <div className="site-footer__statement">
          <Wordmark href={`/${locale}`} />
          <p>{copy.statement}</p>
          <Link className="site-footer__locale" href={`/${locale === "en" ? "sr" : "en"}`}>
            {locale === "en" ? "SR" : "EN"}
            <ArrowIcon className="size-4" />
          </Link>
        </div>

        <div className="site-footer__groups">
          {groups.map((group) => (
            <nav aria-label={group.label} className="site-footer__group" key={group.label}>
              <p>{group.label}</p>
              {group.links.map((link) => (
                <Link href={link.href} key={`${group.label}-${link.label}`}>
                  {link.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>
      </div>

      <div className="site-footer__wordmark" aria-hidden="true">
        AIRON
      </div>

      <div className="site-footer__bottom">
        <span>{copy.copyright}</span>
        <span>SCIENCE · PRECISION · DISCIPLINE</span>
      </div>
    </footer>
  );
}
