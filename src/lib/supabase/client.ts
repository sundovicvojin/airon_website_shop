"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getPublicEnvironment } from "@/lib/env/public";
import type { Database } from "@/lib/supabase/database.types";

export function createSupabaseBrowserClient(options?: { detectSessionInUrl?: boolean }) {
  const environment = getPublicEnvironment();

  return createBrowserClient<Database>(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    options?.detectSessionInUrl === undefined ? undefined : { auth: { detectSessionInUrl: options.detectSessionInUrl } },
  );
}
