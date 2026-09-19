import { notFound } from "next/navigation";
import { ProductDetail } from "@/features/catalog/components/product-detail";
import { getDevelopmentProductDetailFixture } from "@/fixtures/product-preview";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export default async function ProductPage({ params }: PageProps<"/[locale]/products/[slug]">) { const { locale, slug } = await params; if (!isLocale(locale)) notFound(); const product = getDevelopmentProductDetailFixture(slug); if (!product) notFound(); const copy = await getDictionary(locale); return <ProductDetail copy={copy.product} locale={locale} product={product} />; }
