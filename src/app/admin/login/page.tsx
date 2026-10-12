import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/features/admin/auth/login-form";
import { getCurrentAdminRoles } from "@/lib/permissions/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { notice } = await searchParams;
  const client = await createSupabaseServerClient();
  const { data } = await client.auth.getUser();
  if (data.user && (await getCurrentAdminRoles()).length > 0) redirect("/admin");
  return <main className="admin-login"><section><p className="admin-kicker">AIRON CONTROL</p><h1>Administration</h1><p>Sign in with an authorised Supabase account.</p>{notice === "password-changed" ? <p className="admin-notice" role="status">Šifra je promenjena, prijavite se.</p> : null}<LoginForm /><p><Link href="/admin/forgot-password">Zaboravljena šifra?</Link></p></section></main>;
}
