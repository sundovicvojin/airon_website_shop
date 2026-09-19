import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/features/catalog/components/product-card";
import type { ProductCardModel, ProductStockState } from "@/features/catalog/types";
import type { Locale } from "@/i18n/config";

export type ProductPreviewCopy = Readonly<{
  addToCart: string;
  description: string;
  eyebrow: string;
  previewOnly: string;
  stock: Record<ProductStockState, string>;
  title: string;
}>;

type ProductPreviewSectionProps = Readonly<{
  copy: ProductPreviewCopy;
  locale: Locale;
  product: ProductCardModel | null;
}>;

export function ProductPreviewSection({ copy, locale, product }: ProductPreviewSectionProps) {
  if (!product) {
    return null;
  }

  return (
    <section className="product-preview-section" id="product-preview">
      <Container>
        <div className="product-preview-section__grid">
          <Reveal className="product-preview-section__intro">
            <p className="section-index">02 / PRODUCT LANGUAGE</p>
            <p className="type-eyebrow text-accent">{copy.eyebrow}</p>
            <h2>{copy.title}</h2>
            <p className="product-preview-section__description">{copy.description}</p>
          </Reveal>

          <Reveal className="product-preview-section__card" delay={120}>
            <ProductCard copy={copy} developmentPreview href={`/${locale}/products/${product.slug}`} locale={locale} product={product} />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
