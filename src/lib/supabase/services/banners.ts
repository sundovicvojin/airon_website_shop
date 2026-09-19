import "server-only";

import type { Locale } from "@/i18n/config";
import { AppError } from "@/lib/errors/app-error";
import { failure, success, type Result } from "@/lib/errors/result";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signStoragePaths } from "@/lib/supabase/services/storage";

export type PublicBanner = Readonly<{ id: string; key: string; eyebrow: string; title: string; body: string; ctaLabel: string; ctaHref: string | null; imageUrl: string | null; imageAlt: string }>;

export async function getPublicBanners(locale: Locale): Promise<Result<readonly PublicBanner[], AppError>> {
  try {
    const client = await createSupabaseServerClient();
    const now = new Date().toISOString();
    const { data: banners, error } = await client.from("banners").select("id, key, image_path, cta_href, sort_order").eq("active", true).or(`starts_at.is.null,starts_at.lte.${now}`).or(`ends_at.is.null,ends_at.gt.${now}`).order("sort_order");
    if (error) return failure(new AppError("INTERNAL_ERROR", "Unable to load public banners.", { cause: error }));
    if (banners.length === 0) return success([]);
    const locales = locale === "en" ? ["en"] : ["sr", "en"];
    const { data: translations, error: translationError } = await client.from("banner_translations").select("banner_id, locale, eyebrow, title, body, cta_label, image_alt").in("banner_id", banners.map((banner) => banner.id)).in("locale", locales);
    if (translationError) return failure(new AppError("INTERNAL_ERROR", "Unable to load banner translations.", { cause: translationError }));
    const signed = await signStoragePaths(client, "banners", banners.flatMap((banner) => banner.image_path ? [banner.image_path] : []));
    return success(banners.flatMap((banner) => {
      const text = translations.find((row) => row.banner_id === banner.id && row.locale === locale) ?? translations.find((row) => row.banner_id === banner.id && row.locale === "en");
      if (!text) return [];
      return [{ id: banner.id, key: banner.key, eyebrow: text.eyebrow ?? "", title: text.title, body: text.body ?? "", ctaLabel: text.cta_label ?? "", ctaHref: banner.cta_href, imageUrl: banner.image_path ? signed.get(banner.image_path) ?? null : null, imageAlt: text.image_alt ?? "" }];
    }));
  } catch (cause) {
    return failure(cause instanceof AppError ? cause : new AppError("INTERNAL_ERROR", "Banner request failed.", { cause }));
  }
}
