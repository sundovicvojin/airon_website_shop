import type { ReactNode } from "react";

type EmptyStateProps = Readonly<{
  action?: ReactNode;
  description: string;
  eyebrow?: string;
  title: string;
}>;

export function EmptyState({ action, description, eyebrow = "No entries", title }: EmptyStateProps) {
  return (
    <section className="border border-line bg-surface/60 px-6 py-14 sm:px-10 sm:py-20">
      <div className="max-w-2xl">
        <p className="type-eyebrow mb-5 text-ink-subtle">{eyebrow}</p>
        <h2 className="font-serif text-3xl tracking-tight sm:text-5xl">{title}</h2>
        <p className="mt-5 max-w-xl text-sm leading-7 text-ink-muted">{description}</p>
        {action ? <div className="mt-8">{action}</div> : null}
      </div>
    </section>
  );
}
