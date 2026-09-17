import Link from "next/link";
import { notFound } from "next/navigation";

import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";

type HomePageProps = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const copy = await getDictionary(locale);

  return (
    <main className="surface-noise min-h-screen overflow-hidden">
      <Container className="relative z-10 flex min-h-screen flex-col">
        <header className="flex h-[var(--header-height)] items-center justify-between border-b border-line">
          <Link
            className="text-sm font-semibold tracking-[0.3em]"
            href={`/${locale}`}
            aria-label={siteConfig.name}
          >
            {siteConfig.name}
          </Link>
          <span className="type-eyebrow text-ink-muted">{copy.foundation.status}</span>
        </header>

        <section className="grid flex-1 items-end gap-10 py-12 md:grid-cols-[minmax(0,1fr)_18rem] md:py-20 lg:gap-20">
          <div className="max-w-5xl">
            <p className="type-eyebrow mb-6 text-accent">{copy.foundation.eyebrow}</p>
            <h1 className="type-display text-balance">{copy.foundation.title}</h1>
          </div>

          <div className="border-l border-line pl-5 md:pb-3">
            <p className="mb-8 text-sm leading-7 text-ink-muted">
              {copy.foundation.description}
            </p>
            <ButtonLink href={`/${locale}/shop`} variant="secondary">
              {copy.foundation.action}
            </ButtonLink>
          </div>
        </section>

        <footer className="flex flex-col gap-3 border-t border-line py-5 text-xs uppercase tracking-[0.16em] text-ink-subtle sm:flex-row sm:items-center sm:justify-between">
          <span>{copy.foundation.footer}</span>
          <nav aria-label={copy.language.label} className="flex gap-4">
            <Link className="transition-colors hover:text-ink" href="/en" lang="en">
              EN
            </Link>
            <Link className="transition-colors hover:text-ink" href="/sr" lang="sr">
              SR
            </Link>
          </nav>
        </footer>
      </Container>
    </main>
  );
}
