import Link from "next/link";
import { notFound } from "next/navigation";

import { EmptyState } from "@/components/ui/empty-state";
import { EditorialPage } from "@/features/content/components/editorial-page";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { getPublicCategories } from "@/lib/supabase/services/categories";

export default async function CollectionsPage({ params }: PageProps<"/[locale]/collections">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [copy, categories] = await Promise.all([getDictionary(locale), getPublicCategories(locale)]);
  if (!categories.ok) throw categories.error;
  return <EditorialPage eyebrow={copy.collections.eyebrow} intro={copy.collections.intro} title={copy.collections.title}>{categories.value.length ? <div className="collection-grid">{categories.value.map((category, index) => <Link href={`/${locale}/collections/${category.slug}`} key={category.id}><span>{String(index + 1).padStart(2, "0")}</span><h2>{category.name}</h2><p>{category.description}</p><small>{category.productCount}</small></Link>)}</div> : <div className="mt-16"><EmptyState description={copy.collections.emptyDescription} eyebrow={copy.common.emptyLabel} title={copy.collections.emptyTitle} /></div>}</EditorialPage>;
}
