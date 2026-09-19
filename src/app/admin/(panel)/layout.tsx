import type { ReactNode } from "react";

import { AdminShell } from "@/features/admin/components/admin-shell";
import { requireAdmin } from "@/lib/permissions/admin";

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const { roles, user } = await requireAdmin();
  return <AdminShell email={user.email ?? "Authenticated user"} roles={roles}>{children}</AdminShell>;
}
