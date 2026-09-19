import "server-only";

import type { Database } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminRole = Database["public"]["Enums"]["admin_role"];

export const adminCapabilities = {
  manageCatalog: ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"],
  manageOrders: ["SUPER_ADMIN", "ADMIN", "ORDERS_MANAGER"],
  manageRoles: ["SUPER_ADMIN"],
} as const satisfies Record<string, readonly AdminRole[]>;

export async function getCurrentAdminRoles(): Promise<readonly AdminRole[]> {
  const client = await createSupabaseServerClient();
  const { data: authData } = await client.auth.getUser();
  if (!authData.user) return [];

  const { data: assignments, error } = await client.from("user_roles").select("role_id").eq("user_id", authData.user.id);
  if (error || assignments.length === 0) return [];
  const { data: roles, error: roleError } = await client.from("roles").select("code").in("id", assignments.map((item) => item.role_id));
  return roleError ? [] : roles.map((role) => role.code);
}

export async function hasAdminCapability(capability: keyof typeof adminCapabilities) {
  const roles = await getCurrentAdminRoles();
  return roles.some((role) => (adminCapabilities[capability] as readonly AdminRole[]).includes(role));
}
