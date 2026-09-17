import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  label: string;
};

export function Input({ className, error, id, label, ...props }: InputProps) {
  const inputId = id ?? props.name;
  const errorId = error && inputId ? `${inputId}-error` : undefined;

  return (
    <div className={className}>
      <label className="type-eyebrow mb-2 block text-ink-muted" htmlFor={inputId}>
        {label}
      </label>
      <input
        aria-describedby={errorId}
        aria-invalid={Boolean(error)}
        className="min-h-12 w-full rounded-[var(--radius-sm)] border border-line bg-surface px-4 text-ink placeholder:text-ink-subtle transition-colors hover:border-line-strong focus:border-ink-muted focus:outline-none"
        id={inputId}
        {...props}
      />
      {error ? (
        <p className="mt-2 text-xs text-danger" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
