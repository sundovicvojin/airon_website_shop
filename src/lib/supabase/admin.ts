import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getPublicEnvironment } from "@/lib/env/public";
import { getServerEnvironment } from "@/lib/env/server";

export function createSupabaseAdminClient() {
  const publicEnvironment = getPublicEnvironment();
  const serverEnvironment = getServerEnvironment();

  return createClient(
    publicEnvironment.NEXT_PUBLIC_SUPABASE_URL,
    serverEnvironment.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
