import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { CartPageContent } from "@/features/cart/components/cart-page-content";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
export default async function CartPage({ params }: PageProps<"/[locale]/cart">) { const { locale } = await params; if (!isLocale(locale)) notFound(); const copy = await getDictionary(locale); return <main className="editorial-page"><Container><CartPageContent copy={copy} locale={locale} /></Container></main>; }
