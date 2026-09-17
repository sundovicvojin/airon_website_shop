import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center py-20">
      <Container size="copy">
        <p className="type-eyebrow mb-5 text-accent">404 — Not found</p>
        <h1 className="font-serif text-5xl tracking-tight sm:text-7xl">This page is outside the collection.</h1>
        <p className="mt-6 text-ink-muted">The address may have changed or the page may no longer exist.</p>
        <ButtonLink className="mt-9" href="/en">
          Return to AIRON
        </ButtonLink>
        <p className="mt-6 text-xs text-ink-subtle">
          <Link className="underline underline-offset-4" href="/sr">
            Nastavi na srpskom
          </Link>
        </p>
      </Container>
    </main>
  );
}
