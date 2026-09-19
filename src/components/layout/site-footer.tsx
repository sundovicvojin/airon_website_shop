import Link from "next/link";

import { Wordmark } from "@/components/brand/wordmark";
import { ArrowIcon } from "@/components/icons/site-icons";
import type { Locale } from "@/i18n/config";

export type FooterCopy = Readonly<{
  about: string;
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
  verification: string;
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
        { href: `/${locale}/quality`, label: copy.quality },
      ],
    },
    {
      label: copy.company,
      links: [
        { href: `/${locale}/about`, label: copy.about },
        { href: `/${locale}/quality`, label: copy.quality },
        { href: `/${locale}/verification`, label: copy.verification },
      ],
    },
    {
      label: copy.support,
      links: [
        { href: `/${locale}/contact`, label: copy.contact },
        { href: `/${locale}/shipping`, label: copy.shipping },
        { href: `/${locale}/returns`, label: copy.returns },
      ],
    },
    {
      label: copy.legal,
      links: [
        { href: `/${locale}/privacy`, label: copy.privacy },
        { href: `/${locale}/terms`, label: copy.terms },
        { href: `/${locale}/cookies`, label: copy.cookies },
        { href: `/${locale}/disclaimer`, label: copy.disclaimer },
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
