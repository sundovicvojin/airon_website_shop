import Image from "next/image";

import heroImage from "../../../../public/images/art-direction/airon-hero-art-direction.png";

import { ArrowIcon } from "@/components/icons/site-icons";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import type { Locale } from "@/i18n/config";

export type HeroCopy = Readonly<{
  description: string;
  eyebrow: string;
  primaryAction: string;
  secondaryAction: string;
  titleFirst: string;
  titleSecond: string;
  visualNote: string;
}>;

type HeroProps = Readonly<{
  copy: HeroCopy;
  locale: Locale;
}>;

export function Hero({ copy, locale }: HeroProps) {
  return (
    <section className="hero" id="about">
      <div className="hero__media" aria-hidden="true">
        <Image
          alt=""
          className="hero__image"
          fill
          placeholder="blur"
          priority
          sizes="100vw"
          src={heroImage}
        />
        <div className="hero__veil" />
      </div>

      <div className="hero__technical" aria-hidden="true">
        <span>A / 001</span>
        <span>44.8176° N</span>
      </div>

      <Container className="hero__content">
        <div className="hero__copy">
          <p className="hero__eyebrow">{copy.eyebrow}</p>
          <h1 className="hero__title">
            <span>{copy.titleFirst}</span>
            <span className="hero__title-offset">{copy.titleSecond}</span>
          </h1>
          <div className="hero__lower">
            <p>{copy.description}</p>
            <div className="hero__actions">
              <ButtonLink href={`/${locale}/shop`}>
                {copy.primaryAction}
                <ArrowIcon className="size-4" />
              </ButtonLink>
              <ButtonLink href={`/${locale}/shop`} variant="quiet">
                {copy.secondaryAction}
                <ArrowIcon className="size-4" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>

      <div className="hero__footer">
        <span>{copy.visualNote}</span>
        <span>SCROLL TO DISCOVER</span>
      </div>
    </section>
  );
}
