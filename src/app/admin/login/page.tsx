import { redirect } from "next/navigation";

import { LoginForm } from "@/features/admin/auth/login-form";
import { getCurrentAdminRoles } from "@/lib/permissions/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminLoginPage() {
  const client = await createSupabaseServerClient();
  const { data } = await client.auth.getUser();
  if (data.user && (await getCurrentAdminRoles()).length > 0) redirect("/admin");
  return <main className="admin-login"><section><p className="admin-kicker">AIRON CONTROL</p><h1>Administration</h1><p>Sign in with an authorised Supabase account.</p><LoginForm /></section></main>;
}
