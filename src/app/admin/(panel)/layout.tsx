import type { ReactNode } from "react";

import { AdminShell } from "@/features/admin/components/admin-shell";
import { requireAdmin, rolesHaveCapability } from "@/lib/permissions/admin";

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const { client, roles, user } = await requireAdmin();
  // The badge is cosmetic: a failed count must never break the admin layout.
  const { count } = rolesHaveCapability(roles, "inquiries.manage")
    ? await client.from("inquiries").select("id", { count: "exact", head: true }).eq("status", "NEW")
    : { count: 0 };
  return <AdminShell email={user.email ?? "Authenticated user"} newInquiries={count ?? 0} roles={roles}>{children}</AdminShell>;
}
