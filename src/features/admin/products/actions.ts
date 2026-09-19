"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { revalidateCatalog } from "@/features/admin/revalidation";
import type { AdminActionState } from "@/features/admin/types";
import { validateImage } from "@/features/admin/uploads";
import { parseMoneyInput } from "@/lib/money";
import { requireAdmin } from "@/lib/permissions/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const optionalText = z.string().trim().transform(value => value || null);
const productSchema = z.object({
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
  sku: optionalText.pipe(z.string().max(80).nullable()), strength: z.string().trim().min(1).max(80), unit: z.string().trim().min(1).max(40),
  price: z.string().refine(value => parseMoneyInput(value) !== null, "Enter a valid EUR amount."),
  comparePrice: z.string().trim(), stockQuantity: z.coerce.number().int().min(0),
  stockStatus: z.enum(["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "DISABLED"]),
  visibility: z.enum(["PUBLIC", "HIDDEN", "DRAFT"]), sortOrder: z.coerce.number().int(),
  active: z.boolean(), featured: z.boolean(),
  enName: z.string().trim().min(1).max(180), enShortName: optionalText, enShortDescription: optionalText, enDescription: optionalText,
  srName: optionalText, srShortName: optionalText, srShortDescription: optionalText, srDescription: optionalText,
}).superRefine((value, context) => {
  const price = parseMoneyInput(value.price) ?? 0;
  const compare = value.comparePrice ? parseMoneyInput(value.comparePrice) : null;
  if (value.comparePrice && compare === null) context.addIssue({ code: "custom", path: ["comparePrice"], message: "Enter a valid EUR amount." });
  if (compare !== null && compare <= price) context.addIssue({ code: "custom", path: ["comparePrice"], message: "Compare price must exceed price." });
  if (value.stockStatus === "OUT_OF_STOCK" && value.stockQuantity !== 0) context.addIssue({ code: "custom", path: ["stockQuantity"], message: "Out-of-stock quantity must be zero." });
  if (["IN_STOCK", "LOW_STOCK"].includes(value.stockStatus) && value.stockQuantity < 1) context.addIssue({ code: "custom", path: ["stockQuantity"], message: "Available products need positive stock." });
});

function values(formData: FormData) {
  return {
    slug: formData.get("slug"), sku: formData.get("sku"), strength: formData.get("strength"), unit: formData.get("unit"),
    price: formData.get("price"), comparePrice: formData.get("comparePrice"), stockQuantity: formData.get("stockQuantity"),
    stockStatus: formData.get("stockStatus"), visibility: formData.get("visibility"), sortOrder: formData.get("sortOrder"),
    active: formData.get("active") === "on", featured: formData.get("featured") === "on",
    enName: formData.get("enName"), enShortName: formData.get("enShortName"), enShortDescription: formData.get("enShortDescription"), enDescription: formData.get("enDescription"),
    srName: formData.get("srName"), srShortName: formData.get("srShortName"), srShortDescription: formData.get("srShortDescription"), srDescription: formData.get("srDescription"),
  };
}

async function saveProduct(productId: string | null, _state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const parsed = productSchema.safeParse(values(formData));
  if (!parsed.success) return { success: false, message: "Check the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  const { client } = await requireAdmin("manageCatalog");
  const input = parsed.data;
  const core = { slug: input.slug, sku: input.sku, strength: input.strength, unit: input.unit, price_amount: parseMoneyInput(input.price)!, compare_at_price_amount: input.comparePrice ? parseMoneyInput(input.comparePrice) : null, stock_quantity: input.stockQuantity, stock_status: input.stockStatus, visibility: input.visibility, active: input.active, featured: input.featured, sort_order: input.sortOrder };
  let id = productId;
  if (id) {
    const { error } = await client.from("products").update(core).eq("id", id);
    if (error) return { success: false, message: error.message };
  } else {
    const { data, error } = await client.from("products").insert(core).select("id").single();
    if (error) return { success: false, message: error.message };
    id = data.id;
  }
  const translations = [{ product_id: id, locale: "en" as const, name: input.enName, short_name: input.enShortName, short_description: input.enShortDescription, description: input.enDescription }, ...(input.srName ? [{ product_id: id, locale: "sr" as const, name: input.srName, short_name: input.srShortName, short_description: input.srShortDescription, description: input.srDescription }] : [])];
  const { error: translationError } = await client.from("product_translations").upsert(translations, { onConflict: "product_id,locale" });
  if (translationError) return { success: false, message: translationError.message };
  if (!input.srName) await client.from("product_translations").delete().eq("product_id", id).eq("locale", "sr");
  const categoryIds = formData.getAll("categoryIds").filter((value): value is string => typeof value === "string");
  await client.from("product_categories").delete().eq("product_id", id);
  if (categoryIds.length) {
    const { error } = await client.from("product_categories").insert(categoryIds.map((category_id, sort_order) => ({ product_id: id!, category_id, sort_order })));
    if (error) return { success: false, message: error.message };
  }
  const image = formData.get("mainImage");
  if (image instanceof File && image.size > 0) {
    try {
      const { extension, mime } = await validateImage(image);
      const path = `products/${id}/gallery/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await client.storage.from("product-images").upload(path, image, { contentType: mime, upsert: false });
      if (uploadError) return { success: false, message: uploadError.message };
      const { data: oldImages } = await client.from("product_images").select("id,storage_path").eq("product_id", id).eq("is_primary", true);
      if (oldImages?.length) await client.from("product_images").delete().in("id", oldImages.map(item => item.id));
      const { error: imageError } = await client.from("product_images").insert({ product_id: id, storage_path: path, alt_text: `${input.enName} — AIRON`, is_primary: true, sort_order: 0 });
      if (imageError) { await client.storage.from("product-images").remove([path]); return { success: false, message: imageError.message }; }
      if (oldImages?.length) await client.storage.from("product-images").remove(oldImages.map(item => item.storage_path));
    } catch (cause) { return { success: false, message: cause instanceof Error ? cause.message : "Image upload failed." }; }
  }
  const galleryFiles = formData.getAll("galleryImages").filter((value): value is File => value instanceof File && value.size > 0);
  if (galleryFiles.length > 8) return { success: false, message: "Upload at most 8 gallery images at once." };
  for (const [index, galleryFile] of galleryFiles.entries()) {
    try {
      const { extension, mime } = await validateImage(galleryFile);
      const path = `products/${id}/gallery/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await client.storage.from("product-images").upload(path, galleryFile, { contentType: mime });
      if (uploadError) return { success: false, message: uploadError.message };
      const { error: imageError } = await client.from("product_images").insert({ product_id: id, storage_path: path, alt_text: `${input.enName} — gallery ${index + 1}`, is_primary: false, sort_order: index + 1 });
      if (imageError) { await client.storage.from("product-images").remove([path]); return { success: false, message: imageError.message }; }
    } catch (cause) { return { success: false, message: cause instanceof Error ? cause.message : "Gallery upload failed." }; }
  }
  revalidateCatalog(input.slug);
  redirect(`/admin/products/${id}?saved=1`);
}

export async function createProduct(state: AdminActionState, formData: FormData) { return saveProduct(null, state, formData); }
export async function updateProduct(id: string, state: AdminActionState, formData: FormData) { return saveProduct(id, state, formData); }

export async function setProductState(id: string, operation: "archive" | "disable") {
  const { client } = await requireAdmin("manageCatalog");
  const values = operation === "archive" ? { active: false, visibility: "HIDDEN" as const, archived_at: new Date().toISOString() } : { active: false, stock_status: "DISABLED" as const };
  const { data, error } = await client.from("products").update(values).eq("id", id).select("slug").single();
  if (error) throw error;
  revalidateCatalog(data.slug);
}

export async function deleteProduct(id: string) {
  const { client } = await requireAdmin("manageCatalog");
  const privileged = createSupabaseAdminClient();
  const [{ count, error: countError }, { data: product, error: productError }, { data: images }] = await Promise.all([
    privileged.from("order_items").select("id", { count: "exact", head: true }).eq("product_id", id),
    client.from("products").select("slug").eq("id", id).single(),
    client.from("product_images").select("storage_path").eq("product_id", id),
  ]);
  if (countError) throw countError;
  if (productError) throw productError;
  if ((count ?? 0) > 0) throw new Error("Referenced products can only be archived.");
  const { error } = await client.from("products").delete().eq("id", id);
  if (error) throw error;
  if (images?.length) await client.storage.from("product-images").remove(images.map(image => image.storage_path));
  revalidatePath("/admin/products");
  revalidateCatalog(product.slug);
}

export async function removeProductImage(imageId: string) {
  const { client } = await requireAdmin("manageCatalog");
  const { data, error } = await client.from("product_images").select("storage_path,products(slug)").eq("id", imageId).single();
  if (error) throw error;
  const { error: deleteError } = await client.from("product_images").delete().eq("id", imageId);
  if (deleteError) throw deleteError;
  await client.storage.from("product-images").remove([data.storage_path]);
  revalidateCatalog(data.products.slug);
}
