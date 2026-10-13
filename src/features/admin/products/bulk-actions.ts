"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { revalidateCatalog } from "@/features/admin/revalidation";
import { bulkActions, bulkChanges, maxBulkProducts, planBulkAction, type BulkProduct, type BulkResult } from "@/features/admin/products/bulk-plan";
import { requireAdmin } from "@/lib/permissions/admin";

const bulkSchema = z.object({
  action: z.enum(bulkActions),
  mode: z.enum(["complete", "all"]),
  ids: z.array(z.uuid()).min(1).max(maxBulkProducts),
});

export async function runBulkProductAction(input: { action: string; mode: string; ids: string[] }): Promise<BulkResult> {
  const parsed = bulkSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: `Select between 1 and ${maxBulkProducts} products.`, changed: 0, skipped: [] };
  const { client } = await requireAdmin("manageCatalog");
  const ids = [...new Set(parsed.data.ids)];

  // Never trust the client: load the products (and what completeness depends on) from the database.
  const { data, error } = await client
    .from("products")
    .select("id,slug,visibility,active,stock_status,stock_quantity,archived_at,product_translations(locale,name,description),product_images(id)")
    .in("id", ids);
  if (error) return { success: false, message: error.message, changed: 0, skipped: [] };

  const products: BulkProduct[] = data.map(row => {
    const en = row.product_translations.find(item => item.locale === "en");
    return {
      id: row.id, slug: row.slug, name: en?.name ?? row.slug, archived: row.archived_at !== null,
      visibility: row.visibility, active: row.active, stockStatus: row.stock_status, stockQuantity: row.stock_quantity,
      imageCount: row.product_images.length, hasEnDescription: Boolean(en?.description?.trim()),
    };
  });
  const missing = ids.length - products.length;
  const plan = planBulkAction(products, parsed.data.action, parsed.data.mode);
  const skipped = [
    ...plan.skipped.map(item => ({ name: item.name, reason: item.reason })),
    ...(missing > 0 ? [{ name: `${missing} unknown product(s)`, reason: "not found" }] : []),
  ];
  if (!plan.eligible.length) return { success: true, message: "Nothing to change.", changed: 0, skipped };

  // One statement for every selected product; status columns only, so prices, images, COA and copy are untouched.
  const { data: updated, error: updateError } = await client
    .from("products")
    .update(bulkChanges[parsed.data.action])
    .in("id", plan.eligible.map(item => item.id))
    .is("archived_at", null)
    .select("id");
  if (updateError) return { success: false, message: updateError.message, changed: 0, skipped };

  for (const product of plan.eligible) revalidateCatalog(product.slug);
  revalidatePath("/admin/products");
  return { success: true, message: `Updated ${updated.length} product(s).`, changed: updated.length, skipped };
}
