import Link from "next/link";
import type { ReactNode } from "react";

import { logoutAdmin } from "@/features/admin/auth/actions";
import { rolesHaveCapability, type AdminRole } from "@/lib/permissions/admin";

const navigation = [
  ["Overview", "/admin"], ["Products", "/admin/products"], ["Categories", "/admin/categories"],
  ["Batches", "/admin/batches"], ["COA", "/admin/coa"], ["Banners", "/admin/banners"],
  ["Coupons", "/admin/coupons"], ["Inquiries", "/admin/inquiries"], ["Orders", "/admin/orders"], ["Customers", "/admin/customers"],
] as const;

export function AdminShell({ children, email, newInquiries = 0, roles }: { children: ReactNode; email: string; newInquiries?: number; roles: readonly AdminRole[] }) {
  const items = navigation.filter(([, href]) => href !== "/admin/inquiries" || rolesHaveCapability(roles, "inquiries.manage"));
  return <div className="admin-shell"><aside className="admin-sidebar"><Link className="admin-brand" href="/admin">AIRON <span>CONTROL</span></Link><nav>{items.map(([label, href]) => <Link href={href} key={href}>{label}{href === "/admin/inquiries" && newInquiries > 0 ? <span aria-label={`${newInquiries} new`} className="admin-badge">{newInquiries > 99 ? "99+" : newInquiries}</span> : null}</Link>)}</nav><div className="admin-sidebar__account"><p>{email}</p><small>{roles.join(" · ")}</small><form action={logoutAdmin}><button type="submit">Sign out</button></form></div></aside><main className="admin-main">{children}</main></div>;
}
