import "server-only";

import { z } from "zod";

import type { PublicCategoryModel } from "@/features/catalog/types";
import type { Locale } from "@/i18n/config";
import { AppError } from "@/lib/errors/app-error";
import { failure, success, type Result } from "@/lib/errors/result";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicProducts, type PublicCatalogResult } from "@/lib/supabase/services/catalog";

type PublicCollection = Readonly<{ category: PublicCategoryModel; catalog: PublicCatalogResult }>;

export async function getPublicCategories(locale: Locale): Promise<Result<readonly PublicCategoryModel[], AppError>> {
  try {
    const client = await createSupabaseServerClient();
    const { data: categories, error } = await client.from("categories").select("id, slug, sort_order").eq("active", true).is("archived_at", null).order("sort_order").order("created_at");
    if (error) return failure(new AppError("INTERNAL_ERROR", "Unable to load public collections.", { cause: error }));
    if (categories.length === 0) return success([]);

    const ids = categories.map((category) => category.id);
    const locales = locale === "en" ? ["en"] : ["sr", "en"];
    const [{ data: translations, error: translationError }, { data: relations, error: relationError }] = await Promise.all([
      client.from("category_translations").select("category_id, locale, name, description").in("category_id", ids).in("locale", locales),
      client.from("product_categories").select("category_id, product_id").in("category_id", ids),
    ]);
    if (translationError || relationError) return failure(new AppError("INTERNAL_ERROR", "Unable to load collection details.", { cause: translationError ?? relationError }));

    return success(categories.flatMap((category) => {
      const translation = translations.find((row) => row.category_id === category.id && row.locale === locale)
        ?? translations.find((row) => row.category_id === category.id && row.locale === "en");
      if (!translation) return [];
      return [{ id: category.id, slug: category.slug, name: translation.name, description: translation.description ?? "", productCount: relations.filter((row) => row.category_id === category.id).length }];
    }));
  } catch (cause) {
    return failure(cause instanceof AppError ? cause : new AppError("INTERNAL_ERROR", "Collections request failed.", { cause }));
  }
}

export async function getPublicCollectionBySlug(slug: string, locale: Locale): Promise<Result<PublicCollection | null, AppError>> {
  if (!z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).safeParse(slug).success) return success(null);
  const categories = await getPublicCategories(locale);
  if (!categories.ok) return categories;
  const category = categories.value.find((item) => item.slug === slug) ?? null;
  if (!category) return success(null);
  const catalog = await getPublicProducts({ locale, categoryId: category.id, sort: "featured" });
  if (!catalog.ok) return catalog;
  return success({ category, catalog: catalog.value });
}
