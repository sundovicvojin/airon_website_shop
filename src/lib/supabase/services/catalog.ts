import "server-only";

import { z } from "zod";

import type { ProductCardModel, ProductDetailModel } from "@/features/catalog/types";
import type { Locale } from "@/i18n/config";
import { AppError } from "@/lib/errors/app-error";
import { failure, success, type Result } from "@/lib/errors/result";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signStoragePaths } from "@/lib/supabase/services/storage";

export const catalogSortValues = ["featured", "newest", "price-asc", "price-desc"] as const;
export type CatalogSort = (typeof catalogSortValues)[number];

const catalogQuerySchema = z.object({
  locale: z.enum(["en", "sr"]),
  limit: z.number().int().min(1).max(48).default(48),
  query: z.string().trim().max(100).default(""),
  sort: z.enum(catalogSortValues).default("featured"),
  featuredOnly: z.boolean().default(false),
  categoryId: z.uuid().optional(),
});

export type PublicCatalogResult = Readonly<{ products: readonly ProductCardModel[]; total: number }>;

type ProductRow = Readonly<{
  id: string; slug: string; strength: string; unit: string; price_amount: number;
  compare_at_price_amount: number | null; stock_status: ProductCardModel["stockState"];
  featured: boolean; created_at: string;
}>;

type TranslationRow = Readonly<{
  product_id: string; locale: string; name: string; short_name: string | null;
  short_description: string | null; description: string | null; storage_information: string | null;
  shipping_information: string | null; disclaimer: string | null;
}>;

type ImageRow = Readonly<{ product_id: string; storage_path: string; alt_text: string; is_primary: boolean; sort_order: number }>;

function chooseTranslation(rows: readonly TranslationRow[], productId: string, locale: Locale) {
  return rows.find((row) => row.product_id === productId && row.locale === locale)
    ?? rows.find((row) => row.product_id === productId && row.locale === "en")
    ?? null;
}

function sortProducts(products: ProductCardModel[], sort: CatalogSort) {
  if (sort === "price-asc") products.sort((a, b) => a.priceAmount - b.priceAmount);
  if (sort === "price-desc") products.sort((a, b) => b.priceAmount - a.priceAmount);
  return products;
}

export async function getPublicProducts(input: {
  locale: Locale; limit?: number; query?: string; sort?: CatalogSort; featuredOnly?: boolean; categoryId?: string;
}): Promise<Result<PublicCatalogResult, AppError>> {
  const parsed = catalogQuerySchema.safeParse(input);
  if (!parsed.success) return failure(new AppError("VALIDATION_FAILED", "Invalid catalogue query.", { cause: parsed.error }));

  try {
    const { locale, limit, query, sort, featuredOnly, categoryId } = parsed.data;
    const client = await createSupabaseServerClient();

    if (query.length >= 2) {
      const { data, error } = await client.rpc("search_public_products", { search_term: query, requested_locale: locale, result_limit: limit });
      if (error) return failure(new AppError("INTERNAL_ERROR", "Unable to search the public catalogue.", { cause: error }));
      const imagePaths = data.flatMap((row) => row.image_path ? [row.image_path] : []);
      const signed = await signStoragePaths(client, "product-images", imagePaths);
      const products = data.map<ProductCardModel>((row) => ({
        comparePriceAmount: row.compare_at_price_amount ?? undefined,
        currency: "EUR",
        featured: row.featured,
        id: row.id,
        image: row.image_path ? signed.get(row.image_path) ?? null : null,
        imageAlt: row.image_alt ?? `${row.name} — AIRON`,
        name: row.name,
        priceAmount: row.price_amount,
        shortName: row.short_name ?? undefined,
        slug: row.slug,
        stockState: row.stock_status,
        strength: row.strength,
        unit: row.unit,
      }));
      return success({ products: sortProducts(products, sort), total: products.length });
    }

    let productQuery = client.from("products").select(
      "id, slug, strength, unit, price_amount, compare_at_price_amount, stock_status, featured, created_at",
      { count: "exact" },
    ).eq("active", true).eq("visibility", "PUBLIC").is("archived_at", null);

    if (categoryId) {
      const { data: relations, error: relationError } = await client.from("product_categories").select("product_id").eq("category_id", categoryId).order("sort_order");
      if (relationError) return failure(new AppError("INTERNAL_ERROR", "Unable to load the collection products.", { cause: relationError }));
      if (relations.length === 0) return success({ products: [], total: 0 });
      productQuery = productQuery.in("id", relations.map((relation) => relation.product_id));
    }

    if (featuredOnly) productQuery = productQuery.eq("featured", true);
    if (sort === "newest") productQuery = productQuery.order("created_at", { ascending: false });
    else if (sort === "price-asc") productQuery = productQuery.order("price_amount", { ascending: true });
    else if (sort === "price-desc") productQuery = productQuery.order("price_amount", { ascending: false });
    else productQuery = productQuery.order("featured", { ascending: false }).order("sort_order").order("created_at", { ascending: false });

    const { data: productData, error: productError, count } = await productQuery.limit(limit);
    if (productError) return failure(new AppError("INTERNAL_ERROR", "Unable to load the public catalogue.", { cause: productError }));
    const products = productData as ProductRow[];
    if (products.length === 0) return success({ products: [], total: count ?? 0 });

    const ids = products.map((product) => product.id);
    const localeCandidates = locale === "en" ? ["en"] : ["sr", "en"];
    const [{ data: translations, error: translationError }, { data: images, error: imageError }] = await Promise.all([
      client.from("product_translations").select("product_id, locale, name, short_name, short_description, description, storage_information, shipping_information, disclaimer").in("product_id", ids).in("locale", localeCandidates),
      client.from("product_images").select("product_id, storage_path, alt_text, is_primary, sort_order").in("product_id", ids).order("is_primary", { ascending: false }).order("sort_order"),
    ]);
    if (translationError || imageError) return failure(new AppError("INTERNAL_ERROR", "Unable to load public product details.", { cause: translationError ?? imageError }));

    const imageRows = images as ImageRow[];
    const signed = await signStoragePaths(client, "product-images", imageRows.map((image) => image.storage_path));
    const mapped = products.flatMap<ProductCardModel>((product) => {
      const translation = chooseTranslation(translations as TranslationRow[], product.id, locale);
      if (!translation) return [];
      const image = imageRows.find((item) => item.product_id === product.id) ?? null;
      return [{
        comparePriceAmount: product.compare_at_price_amount ?? undefined,
        currency: "EUR", featured: product.featured, id: product.id,
        image: image ? signed.get(image.storage_path) ?? null : null,
        imageAlt: image?.alt_text ?? `${translation.name} — AIRON`, name: translation.name,
        priceAmount: product.price_amount, shortName: translation.short_name ?? undefined,
        slug: product.slug, stockState: product.stock_status, strength: product.strength, unit: product.unit,
      }];
    });
    return success({ products: mapped, total: count ?? mapped.length });
  } catch (cause) {
    return failure(cause instanceof AppError ? cause : new AppError("INTERNAL_ERROR", "Catalogue request failed.", { cause }));
  }
}

export async function getFeaturedProducts(locale: Locale, limit = 3) {
  return getPublicProducts({ locale, limit, featuredOnly: true, sort: "featured" });
}

export async function getPublicProductBySlug(slug: string, locale: Locale): Promise<Result<ProductDetailModel | null, AppError>> {
  const slugResult = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).safeParse(slug);
  if (!slugResult.success) return success(null);

  try {
    const client = await createSupabaseServerClient();
    const { data: product, error } = await client.from("products").select("id, slug, strength, unit, price_amount, compare_at_price_amount, stock_status, featured, created_at").eq("slug", slug).eq("active", true).eq("visibility", "PUBLIC").is("archived_at", null).maybeSingle();
    if (error) return failure(new AppError("INTERNAL_ERROR", "Unable to load the product.", { cause: error }));
    if (!product) return success(null);

    const localeCandidates = locale === "en" ? ["en"] : ["sr", "en"];
    const [translationsResult, imagesResult, specsResult, batchesResult, coaResult] = await Promise.all([
      client.from("product_translations").select("product_id, locale, name, short_name, short_description, description, storage_information, shipping_information, disclaimer").eq("product_id", product.id).in("locale", localeCandidates),
      client.from("product_images").select("product_id, storage_path, alt_text, is_primary, sort_order").eq("product_id", product.id).order("is_primary", { ascending: false }).order("sort_order"),
      client.from("product_specifications").select("id, value, unit, sort_order").eq("product_id", product.id).order("sort_order"),
      client.from("product_batches").select("batch_number").eq("product_id", product.id).eq("active", true).order("created_at", { ascending: false }).limit(5),
      client.from("coa_documents").select("id").eq("product_id", product.id).eq("active", true).eq("public_visible", true).limit(1),
    ]);
    const firstError = translationsResult.error ?? imagesResult.error ?? specsResult.error ?? batchesResult.error ?? coaResult.error;
    if (firstError) return failure(new AppError("INTERNAL_ERROR", "Unable to load product detail data.", { cause: firstError }));

    const translation = chooseTranslation(translationsResult.data as TranslationRow[], product.id, locale);
    if (!translation) return success(null);
    const imageRows = (imagesResult.data ?? []) as ImageRow[];
    const signed = await signStoragePaths(client, "product-images", imageRows.map((image) => image.storage_path));
    const gallery = imageRows.flatMap((image) => signed.get(image.storage_path) ?? []);

    const specificationRows = specsResult.data ?? [];
    const batchRows = batchesResult.data ?? [];
    const coaRows = coaResult.data ?? [];
    const specificationIds = specificationRows.map((spec) => spec.id);
    const { data: specTranslations, error: specTranslationError } = specificationIds.length
      ? await client.from("product_specification_translations").select("specification_id, locale, label, value_override").in("specification_id", specificationIds).in("locale", localeCandidates)
      : { data: [], error: null };
    if (specTranslationError) return failure(new AppError("INTERNAL_ERROR", "Unable to load product specifications.", { cause: specTranslationError }));

    const specifications = specificationRows.flatMap((spec) => {
      const text = specTranslations.find((row) => row.specification_id === spec.id && row.locale === locale)
        ?? specTranslations.find((row) => row.specification_id === spec.id && row.locale === "en");
      if (!text) return [];
      return [{ label: text.label, value: text.value_override ?? `${spec.value}${spec.unit ? ` ${spec.unit}` : ""}` }];
    });

    const primaryImage = imageRows[0];
    return success({
      batchInformation: batchRows.map((batch) => batch.batch_number).join(", "),
      coaAvailable: coaRows.length > 0,
      comparePriceAmount: product.compare_at_price_amount ?? undefined,
      currency: "EUR", description: translation.description ?? "", disclaimer: translation.disclaimer ?? "",
      featured: product.featured, gallery, id: product.id,
      image: primaryImage ? signed.get(primaryImage.storage_path) ?? null : null,
      imageAlt: primaryImage?.alt_text ?? `${translation.name} — AIRON`, name: translation.name,
      priceAmount: product.price_amount, shippingInformation: translation.shipping_information ?? "",
      shortDescription: translation.short_description ?? "", shortName: translation.short_name ?? undefined,
      slug: product.slug, specifications, stockState: product.stock_status,
      storageInformation: translation.storage_information ?? "", strength: product.strength, unit: product.unit,
    });
  } catch (cause) {
    return failure(cause instanceof AppError ? cause : new AppError("INTERNAL_ERROR", "Product request failed.", { cause }));
  }
}
