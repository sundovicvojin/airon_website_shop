import { notFound } from "next/navigation";
import { EditorialPage } from "@/features/content/components/editorial-page";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
export default async function VerificationPage({ params }: PageProps<"/[locale]/verification">) { const { locale } = await params; if (!isLocale(locale)) notFound(); const { verificationPage } = await getDictionary(locale); return <EditorialPage aside={<p className="type-eyebrow text-warning">{verificationPage.notice}</p>} blocks={verificationPage.blocks} eyebrow={verificationPage.eyebrow} intro={verificationPage.intro} title={verificationPage.title} />; }
