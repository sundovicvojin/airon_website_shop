import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";

export default async function CollectionDetailPage({ params }: PageProps<"/[locale]/collections/[slug]">) { const { locale } = await params; if (!isLocale(locale)) notFound(); notFound(); }
