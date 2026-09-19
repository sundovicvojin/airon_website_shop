import { notFound } from "next/navigation";

import { EmptyState } from "@/components/ui/empty-state";
import { ProductCard } from "@/features/catalog/components/product-card";
import { EditorialPage } from "@/features/content/components/editorial-page";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getPublicCollectionBySlug } from "@/lib/supabase/services/categories";

export default async function CollectionDetailPage({ params }: PageProps<"/[locale]/collections/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const [copy, collection] = await Promise.all([getDictionary(locale), getPublicCollectionBySlug(slug, locale)]);
  if (!collection.ok) throw collection.error;
  if (!collection.value) notFound();
  const { category, catalog } = collection.value;
  return <EditorialPage eyebrow={copy.collections.eyebrow} intro={category.description} title={category.name}>{catalog.products.length ? <div className="catalog-grid mt-16">{catalog.products.map((product) => <ProductCard copy={copy.productPreview} href={`/${locale}/products/${product.slug}`} key={product.id} locale={locale} product={product} />)}</div> : <div className="mt-16"><EmptyState description={copy.shop.emptyDescription} eyebrow={copy.common.emptyLabel} title={copy.shop.emptyTitle} /></div>}</EditorialPage>;
}
