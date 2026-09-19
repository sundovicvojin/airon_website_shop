import { notFound } from "next/navigation";

import { ProductDetail } from "@/features/catalog/components/product-detail";
import { getDevelopmentProductDetailFixture } from "@/fixtures/product-preview";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getPublicProductBySlug } from "@/lib/supabase/services/catalog";

export default async function ProductPage({ params }: PageProps<"/[locale]/products/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const [copy, productResult] = await Promise.all([getDictionary(locale), getPublicProductBySlug(slug, locale)]);
  if (!productResult.ok) throw productResult.error;
  const developmentFixture = productResult.value ? null : getDevelopmentProductDetailFixture(slug);
  const product = productResult.value ?? developmentFixture;
  if (!product) notFound();
  return <ProductDetail copy={copy.product} developmentOnly={Boolean(developmentFixture)} locale={locale} product={product} />;
}
