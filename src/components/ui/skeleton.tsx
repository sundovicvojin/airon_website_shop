import type { HTMLAttributes } from "react";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const classes = [
    "animate-pulse rounded-[var(--radius-sm)] bg-surface-raised motion-reduce:animate-none",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div aria-hidden="true" className={classes} {...props} />;
}
