import Link from "next/link";
import type { ReactNode } from "react";

export function AdminPageHeader({ actionHref, actionLabel, description, title }: { actionHref?: string; actionLabel?: string; description?: string; title: string }) {
  return <header className="admin-page-header"><div><p className="admin-kicker">AIRON CONTROL</p><h1>{title}</h1>{description ? <p>{description}</p> : null}</div>{actionHref && actionLabel ? <Link className="admin-button" href={actionHref}>{actionLabel}</Link> : null}</header>;
}

export function AdminEmpty({ children }: { children: ReactNode }) { return <div className="admin-empty">{children}</div>; }

export function StatusPill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "good" | "warning" }) {
  return <span className="admin-status" data-tone={tone}>{children}</span>;
}
