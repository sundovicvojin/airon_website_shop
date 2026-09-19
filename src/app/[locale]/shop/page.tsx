import { notFound } from "next/navigation";

import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { ShopControls } from "@/features/catalog/components/shop-controls";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";

export default async function ShopPage({ params }: PageProps<"/[locale]/shop">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = await getDictionary(locale);
  return <main className="shop-page"><Container><header className="shop-heading"><p className="type-eyebrow text-accent">{copy.shop.eyebrow}</p><h1>{copy.shop.title}</h1><p>{copy.shop.intro}</p></header><div className="shop-meta"><span>{copy.shop.count}</span></div><ShopControls copy={copy.shop} /><div className="shop-grid" aria-live="polite"><EmptyState description={copy.shop.emptyDescription} eyebrow={copy.common.emptyLabel} title={copy.shop.emptyTitle} /></div></Container></main>;
}
