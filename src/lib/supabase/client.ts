"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getPublicEnvironment } from "@/lib/env/public";

export function createSupabaseBrowserClient() {
  const environment = getPublicEnvironment();

  return createBrowserClient(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
