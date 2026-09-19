import { notFound } from "next/navigation";

import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductCard } from "@/features/catalog/components/product-card";
import { ShopControls } from "@/features/catalog/components/shop-controls";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { catalogSortValues, getPublicProducts, type CatalogSort } from "@/lib/supabase/services/catalog";

type ShopPageProps = Readonly<{
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string | string[]; sort?: string | string[] }>;
}>;

export default async function ShopPage({ params, searchParams }: ShopPageProps) {
  const [{ locale }, queryParameters] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();
  const query = typeof queryParameters.q === "string" ? queryParameters.q : "";
  const sortValue = typeof queryParameters.sort === "string" ? queryParameters.sort : "featured";
  const sort: CatalogSort = catalogSortValues.includes(sortValue as CatalogSort) ? sortValue as CatalogSort : "featured";
  const [copy, catalog] = await Promise.all([getDictionary(locale), getPublicProducts({ locale, query, sort })]);
  if (!catalog.ok) throw catalog.error;

  return <main className="shop-page"><Container><header className="shop-heading"><p className="type-eyebrow text-accent">{copy.shop.eyebrow}</p><h1>{copy.shop.title}</h1><p>{copy.shop.intro}</p></header><div className="shop-meta"><span>{copy.shop.count.replace(/^0/, String(catalog.value.total))}</span></div><ShopControls copy={copy.shop} query={query} sort={sort} /><div aria-live="polite" className="shop-grid">{catalog.value.products.length ? <div className="catalog-grid">{catalog.value.products.map((product) => <ProductCard copy={copy.productPreview} href={`/${locale}/products/${product.slug}`} key={product.id} locale={locale} product={product} />)}</div> : <EmptyState description={copy.shop.emptyDescription} eyebrow={copy.common.emptyLabel} title={copy.shop.emptyTitle} />}</div></Container></main>;
}
