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
    <main className="min-h-[75vh] pb-24 pt-40 sm:pb-32 sm:pt-48">
      <Container>
        <div className="border-b border-line pb-10 sm:pb-14">
          <p className="type-eyebrow mb-5 text-accent">{copy.shop.eyebrow}</p>
          <h1 className="font-serif text-6xl font-light tracking-[-0.045em] sm:text-8xl">{copy.shop.title}</h1>
        </div>
        <div className="mt-10 sm:mt-14">
          <EmptyState title={copy.shop.emptyTitle} description={copy.shop.emptyDescription} />
        </div>
      </Container>
    </main>
  );
}
