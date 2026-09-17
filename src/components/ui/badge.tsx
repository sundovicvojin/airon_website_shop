import type { HTMLAttributes } from "react";

type BadgeTone = "neutral" | "success" | "warning" | "danger";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "border-line text-ink-muted",
  success: "border-success/40 text-success",
  warning: "border-warning/40 text-warning",
  danger: "border-danger/40 text-danger",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  const classes = [
    "inline-flex min-h-6 items-center rounded-[var(--radius-xs)] border px-2 text-[0.6875rem] font-semibold uppercase tracking-[0.12em]",
    toneClasses[tone],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <span className={classes} {...props} />;
}
