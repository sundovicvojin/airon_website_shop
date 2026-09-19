import { notFound } from "next/navigation";
import { BagIcon } from "@/components/icons/site-icons";
import { ButtonLink } from "@/components/ui/button";
import { EditorialPage } from "@/features/content/components/editorial-page";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
export default async function CartPage({ params }: PageProps<"/[locale]/cart">) { const { locale } = await params; if (!isLocale(locale)) notFound(); const copy = await getDictionary(locale); return <EditorialPage eyebrow={copy.common.itemCount} intro={copy.cart.emptyDescription} title={copy.cart.title}><section className="cart-page-empty"><BagIcon className="size-8 text-accent" /><h2>{copy.cart.emptyTitle}</h2><div><span>{copy.cart.subtotal}</span><strong>€0.00</strong></div><ButtonLink href={`/${locale}/shop`}>{copy.common.browseShop}</ButtonLink></section></EditorialPage>; }
