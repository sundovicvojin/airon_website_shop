import { notFound } from "next/navigation";

import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";

type ShopPageProps = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export default async function ShopPage({ params }: ShopPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const copy = await getDictionary(locale);

  return (
    <main className="min-h-screen py-20">
      <Container>
        <p className="type-eyebrow mb-5 text-accent">{copy.shop.eyebrow}</p>
        <h1 className="font-serif text-5xl tracking-[-0.03em] sm:text-7xl">{copy.shop.title}</h1>
        <div className="mt-16">
          <EmptyState title={copy.shop.emptyTitle} description={copy.shop.emptyDescription} />
        </div>
      </Container>
    </main>
  );
}
