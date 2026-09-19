import Link from "next/link";
import type { ReactNode } from "react";

import { logoutAdmin } from "@/features/admin/auth/actions";
import type { AdminRole } from "@/lib/permissions/admin";

const navigation = [
  ["Overview", "/admin"], ["Products", "/admin/products"], ["Categories", "/admin/categories"],
  ["Batches", "/admin/batches"], ["COA", "/admin/coa"], ["Banners", "/admin/banners"],
  ["Coupons", "/admin/coupons"], ["Orders", "/admin/orders"], ["Customers", "/admin/customers"],
] as const;

export function AdminShell({ children, email, roles }: { children: ReactNode; email: string; roles: readonly AdminRole[] }) {
  return <div className="admin-shell"><aside className="admin-sidebar"><Link className="admin-brand" href="/admin">AIRON <span>CONTROL</span></Link><nav>{navigation.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}</nav><div className="admin-sidebar__account"><p>{email}</p><small>{roles.join(" · ")}</small><form action={logoutAdmin}><button type="submit">Sign out</button></form></div></aside><main className="admin-main">{children}</main></div>;
}
