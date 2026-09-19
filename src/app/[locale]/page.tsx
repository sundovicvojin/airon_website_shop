import { notFound } from "next/navigation";

import { getDevelopmentProductFixture } from "@/fixtures/product-preview";
import { Hero } from "@/features/home/components/hero";
import { FeaturedProductsSection } from "@/features/home/components/featured-products-section";
import { ProductPreviewSection } from "@/features/home/components/product-preview-section";
import { QualitySection } from "@/features/home/components/quality-section";
import { ClosingSections, StorefrontSections } from "@/features/home/components/storefront-sections";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { getPublicCategories } from "@/lib/supabase/services/categories";
import { getFeaturedProducts } from "@/lib/supabase/services/catalog";

type HomePageProps = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const [copy, featuredResult, categoriesResult] = await Promise.all([
    getDictionary(locale),
    getFeaturedProducts(locale),
    getPublicCategories(locale),
  ]);
  if (!featuredResult.ok) throw featuredResult.error;
  if (!categoriesResult.ok) throw categoriesResult.error;
  const productFixture = featuredResult.value.products.length === 0 ? getDevelopmentProductFixture() : null;

  return (
    <main className="overflow-hidden">
      <Hero copy={copy.hero} locale={locale} />
      <FeaturedProductsSection copy={copy} locale={locale} products={featuredResult.value.products} />
      <ProductPreviewSection copy={copy.productPreview} locale={locale} product={productFixture} />
      <StorefrontSections categories={categoriesResult.value} copy={copy.home} locale={locale} />
      <QualitySection copy={copy.quality} />
      <ClosingSections copy={copy.home} locale={locale} />
    </main>
  );
}
