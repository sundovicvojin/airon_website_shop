import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { AppError } from "@/lib/errors/app-error";
import type { Database } from "@/lib/supabase/database.types";

export async function signStoragePaths(
  client: SupabaseClient<Database>,
  bucket: "product-images" | "banners" | "coa",
  paths: readonly string[],
): Promise<ReadonlyMap<string, string>> {
  const uniquePaths = [...new Set(paths.filter(Boolean))];
  if (uniquePaths.length === 0) return new Map();

  const { data, error } = await client.storage.from(bucket).createSignedUrls(uniquePaths, 3600);
  if (error) throw new AppError("INTERNAL_ERROR", `Unable to sign ${bucket} assets.`, { cause: error });

  return new Map(data.flatMap((item) => item.path && item.signedUrl ? [[item.path, item.signedUrl] as const] : []));
}
