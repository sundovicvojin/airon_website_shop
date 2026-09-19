import { notFound } from "next/navigation";
import { ContactForm } from "@/features/contact/components/contact-form";
import { EditorialPage } from "@/features/content/components/editorial-page";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
export default async function ContactPage({ params }: PageProps<"/[locale]/contact">) { const { locale } = await params; if (!isLocale(locale)) notFound(); const { contact } = await getDictionary(locale); return <EditorialPage eyebrow={contact.eyebrow} intro={contact.intro} title={contact.title}><ContactForm copy={contact} /></EditorialPage>; }
