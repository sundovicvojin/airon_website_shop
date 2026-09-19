import { notFound } from "next/navigation";
import { EditorialPage } from "@/features/content/components/editorial-page";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
export default async function AboutPage({ params }: PageProps<"/[locale]/about">) { const { locale } = await params; if (!isLocale(locale)) notFound(); const { about } = await getDictionary(locale); return <EditorialPage blocks={about.blocks} eyebrow={about.eyebrow} intro={about.intro} title={about.title} />; }
