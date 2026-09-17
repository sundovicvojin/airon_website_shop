"use client";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

type ErrorPageProps = Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>;

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="grid min-h-screen place-items-center py-20">
      <Container size="copy">
        <p className="type-eyebrow mb-5 text-danger">System notice</p>
        <h1 className="font-serif text-5xl tracking-tight">Something interrupted the request.</h1>
        <p className="mt-6 max-w-xl text-ink-muted">
          No data was changed. Try the request again, or contact support if the issue persists.
        </p>
        {error.digest ? <p className="mt-3 font-mono text-xs text-ink-subtle">Ref: {error.digest}</p> : null}
        <Button className="mt-9" onClick={reset} type="button">
          Try again
        </Button>
      </Container>
    </main>
  );
}
