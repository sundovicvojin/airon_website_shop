import Image from "next/image";

import familyImage from "../../../../public/images/art-direction/airon-product-fixture.png";
import qualityImage from "../../../../public/images/art-direction/airon-quality-art-direction.png";

import { ArrowIcon } from "@/components/icons/site-icons";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { PublicCategoryModel } from "@/features/catalog/types";

type StorefrontSectionsProps = Readonly<{ categories?: readonly PublicCategoryModel[]; copy: Dictionary["home"]; locale: Locale }>;

export function StorefrontSections({ categories = [], copy, locale }: StorefrontSectionsProps) {
  return <>
    <section className="home-collections"><Container><Reveal><p className="type-eyebrow text-accent">{copy.collections.eyebrow}</p><div className="home-section-heading"><h2>{copy.collections.title}</h2><p>{copy.collections.body}</p></div>{categories.length ? <div className="home-collection-list">{categories.slice(0, 4).map((category, index) => <ButtonLink href={`/${locale}/collections/${category.slug}`} key={category.id} variant="quiet"><span>{String(index + 1).padStart(2, "0")}</span>{category.name}<small>{category.productCount}</small></ButtonLink>)}</div> : <div className="home-empty-row"><span>000</span><p>{copy.collections.empty}</p><ButtonLink href={`/${locale}/collections`} variant="quiet">{copy.collections.action}<ArrowIcon className="size-4" /></ButtonLink></div>}</Reveal></Container></section>
    <section className="home-family"><div className="home-family__media"><Image alt="AIRON development-only product-family art direction" fill placeholder="blur" sizes="(max-width: 767px) 100vw, 50vw" src={familyImage} /></div><div className="home-family__copy"><p className="type-eyebrow text-accent">{copy.family.eyebrow}</p><h2>{copy.family.title}</h2><p>{copy.family.body}</p><small>{copy.family.note}</small></div></section>
    <section className="home-why"><Container><p className="type-eyebrow text-accent">{copy.why.eyebrow}</p><h2>{copy.why.title}</h2><div className="home-why__grid">{copy.why.items.map((item, index) => <Reveal delay={index * 80} key={item.title}><article><span>{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.body}</p></article></Reveal>)}</div></Container></section>
  </>;
}

export function ClosingSections({ copy, locale }: StorefrontSectionsProps) {
  return <>
    <section className="home-verification"><div className="home-verification__media"><Image alt="Precision laboratory art direction" fill placeholder="blur" sizes="100vw" src={qualityImage} /></div><Container className="home-verification__content"><Reveal><p className="type-eyebrow text-accent">{copy.verification.eyebrow}</p><h2>{copy.verification.title}</h2><p>{copy.verification.body}</p><ButtonLink href={`/${locale}/verification`} variant="secondary">{copy.verification.action}<ArrowIcon className="size-4" /></ButtonLink></Reveal></Container></section>
    <section className="home-cta"><Container><Reveal><p className="type-eyebrow text-accent">{copy.cta.eyebrow}</p><h2>{copy.cta.title}</h2><p>{copy.cta.body}</p><ButtonLink href={`/${locale}/shop`}>{copy.cta.action}<ArrowIcon className="size-4" /></ButtonLink></Reveal></Container></section>
  </>;
}
