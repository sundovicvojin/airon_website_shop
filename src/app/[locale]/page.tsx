import { notFound } from "next/navigation";

import { getDevelopmentProductFixture } from "@/fixtures/product-preview";
import { Hero } from "@/features/home/components/hero";
import { ProductPreviewSection } from "@/features/home/components/product-preview-section";
import { QualitySection } from "@/features/home/components/quality-section";
import { ClosingSections, StorefrontSections } from "@/features/home/components/storefront-sections";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";

type HomePageProps = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const copy = await getDictionary(locale);
  const productFixture = getDevelopmentProductFixture();

  return (
    <main className="overflow-hidden">
      <Hero copy={copy.hero} locale={locale} />
      <ProductPreviewSection copy={copy.productPreview} locale={locale} product={productFixture} />
      <StorefrontSections copy={copy.home} locale={locale} />
      <QualitySection copy={copy.quality} />
      <ClosingSections copy={copy.home} locale={locale} />
    </main>
  );
}
