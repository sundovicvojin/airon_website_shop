import "server-only";

import { z } from "zod";
import { AppError } from "@/lib/errors/app-error";
import { failure, success, type Result } from "@/lib/errors/result";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signStoragePaths } from "@/lib/supabase/services/storage";

export type PublicCoaDocument = Readonly<{ id: string; title: string; batchId: string | null; url: string }>;

export async function getPublicCoaDocuments(productId: string): Promise<Result<readonly PublicCoaDocument[], AppError>> {
  if (!z.uuid().safeParse(productId).success) return failure(new AppError("VALIDATION_FAILED", "Invalid product identifier."));
  try {
    const client = await createSupabaseServerClient();
    const { data, error } = await client.from("coa_documents").select("id, title, batch_id, storage_path").eq("product_id", productId).eq("active", true).eq("public_visible", true).order("uploaded_at", { ascending: false });
    if (error) return failure(new AppError("INTERNAL_ERROR", "Unable to load public COA documents.", { cause: error }));
    const signed = await signStoragePaths(client, "coa", data.map((document) => document.storage_path));
    return success(data.flatMap((document) => {
      const url = signed.get(document.storage_path);
      return url ? [{ id: document.id, title: document.title, batchId: document.batch_id, url }] : [];
    }));
  } catch (cause) {
    return failure(cause instanceof AppError ? cause : new AppError("INTERNAL_ERROR", "COA request failed.", { cause }));
  }
}
