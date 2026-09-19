import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/features/catalog/components/product-card";
import type { ProductCardModel } from "@/features/catalog/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

type FeaturedProductsSectionProps = Readonly<{ copy: Dictionary; locale: Locale; products: readonly ProductCardModel[] }>;

export function FeaturedProductsSection({ copy, locale, products }: FeaturedProductsSectionProps) {
  if (products.length === 0) return null;
  return <section className="featured-products"><Container><Reveal><p className="type-eyebrow text-accent">{copy.home.featured.eyebrow}</p><div className="home-section-heading"><h2>{copy.home.featured.title}</h2><p>{copy.home.featured.description}</p></div></Reveal><div className="featured-products__grid">{products.map((product, index) => <Reveal delay={index * 80} key={product.id}><ProductCard copy={copy.productPreview} href={`/${locale}/products/${product.slug}`} locale={locale} product={product} /></Reveal>)}</div></Container></section>;
}
