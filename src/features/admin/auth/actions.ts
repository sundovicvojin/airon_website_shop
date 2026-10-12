"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { forgotPasswordSchema } from "@/features/admin/auth/schemas";
import type { AdminActionState } from "@/features/admin/types";
import { getPublicEnvironment } from "@/lib/env/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must contain at least 8 characters."),
});

export async function loginAdmin(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { success: false, message: "Check the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  const client = await createSupabaseServerClient();
  const { error } = await client.auth.signInWithPassword(parsed.data);
  if (error) return { success: false, message: "Invalid credentials or account unavailable." };
  redirect("/admin");
}

export async function logoutAdmin() {
  const client = await createSupabaseServerClient();
  await client.auth.signOut();
  redirect("/admin/login");
}

const passwordResetNotice = "Ako nalog postoji, poslali smo uputstvo na mejl.";

/** Always answers the same way so the form cannot be used to discover which emails have accounts. */
export async function requestPasswordReset(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { success: false, message: "Proverite unos.", fieldErrors: parsed.error.flatten().fieldErrors };
  try {
    const client = await createSupabaseServerClient();
    const siteUrl = getPublicEnvironment().NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
    const { error } = await client.auth.resetPasswordForEmail(parsed.data.email, { redirectTo: `${siteUrl}/admin/reset-password` });
    if (error) console.error(`[auth] Password reset request failed (${error.code ?? error.status ?? "unknown"}).`);
  } catch {
    console.error("[auth] Password reset request threw.");
  }
  return { success: true, message: passwordResetNotice };
}
