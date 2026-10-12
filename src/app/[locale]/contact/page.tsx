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
  // Only a real published product is shown: the slug is validated and the name comes from the database, never from the URL.
  const slug = productParamSchema.safeParse(Array.isArray(query.product) ? query.product[0] : query.product);
  const result = slug.success ? await getPublicProductBySlug(slug.data, locale) : null;
  const product = result?.ok ? result.value : null;
  return <EditorialPage eyebrow={contact.eyebrow} intro={contact.intro} title={contact.title}>
    <ContactForm copy={contact} locale={locale} productName={product?.name} productSlug={product?.slug} turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || undefined} />
  </EditorialPage>;
}
