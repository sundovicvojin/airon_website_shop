import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "quiet";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "border-accent bg-accent text-canvas hover:border-accent-strong hover:bg-accent-strong",
  secondary: "border-line-strong bg-transparent text-ink hover:border-ink-muted hover:bg-surface-raised",
  quiet: "border-transparent bg-transparent text-ink-muted hover:text-ink",
};

function buttonClasses(variant: ButtonVariant, className?: string) {
  return [
    "inline-flex min-h-11 items-center justify-center border px-5 text-xs font-semibold uppercase tracking-[0.16em]",
    "transition-[background-color,border-color,color,transform] duration-[var(--duration-base)] ease-[var(--ease-premium)]",
    "disabled:cursor-not-allowed disabled:opacity-40 active:translate-y-px",
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return <button className={buttonClasses(variant, className)} {...props} />;
}

type ButtonLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  children: ReactNode;
  href: string;
  variant?: ButtonVariant;
};

export function ButtonLink({ children, className, href, variant = "primary", ...props }: ButtonLinkProps) {
  return (
    <Link className={buttonClasses(variant, className)} href={href} {...props}>
      {children}
    </Link>
  );
}
