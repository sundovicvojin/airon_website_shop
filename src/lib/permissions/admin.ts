import "server-only";

import { redirect } from "next/navigation";

import type { Database } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminRole = Database["public"]["Enums"]["admin_role"];

export const adminCapabilities = {
  manageCatalog: ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"],
  manageOrders: ["SUPER_ADMIN", "ADMIN", "ORDERS_MANAGER"],
  managePromotions: ["SUPER_ADMIN", "ADMIN"],
  viewDashboard: ["SUPER_ADMIN", "ADMIN", "ORDERS_MANAGER", "CONTENT_MANAGER"],
  manageRoles: ["SUPER_ADMIN"],
} as const satisfies Record<string, readonly AdminRole[]>;

export type AdminCapability = keyof typeof adminCapabilities;

export async function getCurrentAdminRoles(): Promise<readonly AdminRole[]> {
  const client = await createSupabaseServerClient();
  const { data: authData } = await client.auth.getUser();
  if (!authData.user) return [];

  const { data: roles, error } = await client.rpc("get_my_admin_roles");
  return error ? [] : roles;
}

export async function hasAdminCapability(capability: AdminCapability) {
  const roles = await getCurrentAdminRoles();
  return roles.some((role) => (adminCapabilities[capability] as readonly AdminRole[]).includes(role));
}

export async function requireAdmin(capability: AdminCapability = "viewDashboard") {
  const client = await createSupabaseServerClient();
  const { data } = await client.auth.getUser();
  if (!data.user) redirect("/admin/login");
  const roles = await getCurrentAdminRoles();
  if (!roles.some((role) => (adminCapabilities[capability] as readonly AdminRole[]).includes(role))) {
    redirect("/admin/forbidden");
  }
  return { client, roles, user: data.user };
}
