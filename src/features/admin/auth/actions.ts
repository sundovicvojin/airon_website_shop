"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import type { AdminActionState } from "@/features/admin/types";
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
