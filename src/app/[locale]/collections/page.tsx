import { notFound } from "next/navigation";
import { EmptyState } from "@/components/ui/empty-state";
import { EditorialPage } from "@/features/content/components/editorial-page";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";

export default async function CollectionsPage({ params }: PageProps<"/[locale]/collections">) { const { locale } = await params; if (!isLocale(locale)) notFound(); const copy = await getDictionary(locale); return <EditorialPage eyebrow={copy.collections.eyebrow} intro={copy.collections.intro} title={copy.collections.title}><div className="mt-16"><EmptyState description={copy.collections.emptyDescription} eyebrow={copy.common.emptyLabel} title={copy.collections.emptyTitle} /></div></EditorialPage>; }
