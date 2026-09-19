import { notFound } from "next/navigation";
import { EditorialPage } from "@/features/content/components/editorial-page";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
export default async function QualityPage({ params }: PageProps<"/[locale]/quality">) { const { locale } = await params; if (!isLocale(locale)) notFound(); const { qualityPage } = await getDictionary(locale); return <EditorialPage aside={<p className="type-eyebrow text-ink-subtle">{qualityPage.editable}</p>} blocks={qualityPage.blocks} eyebrow={qualityPage.eyebrow} intro={qualityPage.intro} title={qualityPage.title} />; }
