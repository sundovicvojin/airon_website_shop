import { notFound } from "next/navigation";
import { z } from "zod";

import { ContactForm } from "@/features/contact/components/contact-form";
import { EditorialPage } from "@/features/content/components/editorial-page";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getPublicProductBySlug } from "@/lib/supabase/services/catalog";

const productParamSchema = z.string().max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export default async function ContactPage({ params, searchParams }: PageProps<"/[locale]/contact">) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();
  const { contact } = await getDictionary(locale);
  // The subject is prefilled only from a real published product: the slug is validated and the name comes from the database, never from the URL.
  const slug = productParamSchema.safeParse(Array.isArray(query.product) ? query.product[0] : query.product);
  const product = slug.success ? await getPublicProductBySlug(slug.data, locale) : null;
  const productName = product?.ok && product.value ? product.value.name : null;
  return <EditorialPage eyebrow={contact.eyebrow} intro={contact.intro} title={contact.title}><ContactForm copy={contact} defaultSubject={productName ? `${contact.inquiryPrefix}: ${productName}` : ""} /></EditorialPage>;
}
