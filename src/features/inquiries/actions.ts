"use server";

import { createHash } from "node:crypto";

import { headers } from "next/headers";

import { sendInquiryNotification } from "@/features/inquiries/mailer";
import { processInquiry, type InquiryDeps } from "@/features/inquiries/service";
import type { SubmitInquiryResult } from "@/features/inquiries/schema";
import { verifyTurnstile } from "@/features/inquiries/turnstile";
import { getInquiryEnvironment } from "@/lib/env/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

async function clientIp() {
  const store = await headers();
  return store.get("x-forwarded-for")?.split(",")[0]?.trim() || store.get("x-real-ip")?.trim() || null;
}

/** Public contact-form entry point. Never trusts the client: validation, bot checks, rate limit and persistence all run here. */
export async function submitInquiry(formData: FormData): Promise<SubmitInquiryResult> {
  try {
    const ip = await clientIp();
    const { IP_HASH_SALT: salt } = getInquiryEnvironment();
    const production = process.env.NODE_ENV === "production";
    if (production && !salt) {
      console.error("[inquiry] IP_HASH_SALT is not configured; rejecting submissions in production.");
      return { status: "error", code: "unavailable" };
    }
    const client = createSupabaseAdminClient();

    const deps: InquiryDeps = {
      countRecentFromIp: async (ipHash, sinceIso) => {
        const { count, error } = await client.from("inquiries").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", sinceIso);
        if (error) throw new Error(`Rate-limit lookup failed (${error.code}).`);
        return count ?? 0;
      },
      // Requests without an address share one bucket instead of bypassing the limit.
      hashIp: () => createHash("sha256").update(`${salt ?? "development-only-salt"}:${ip ?? "unknown"}`).digest("hex"),
      insert: async (record) => {
        const { data, error } = await client.from("inquiries").insert(record).select("id").single();
        if (error) {
          console.error(`[inquiry] Insert failed (${error.code}).`);
          return null;
        }
        return data;
      },
      notify: async (inquiry) => {
        try {
          await sendInquiryNotification(inquiry);
        } catch (cause) {
          console.error(`[inquiry] Notification failed: ${cause instanceof Error ? cause.name : "unknown error"}.`);
        }
      },
      now: () => new Date(),
      resolveProduct: async (slug, locale) => {
        const { data: product } = await client.from("products").select("id").eq("slug", slug).eq("active", true).eq("visibility", "PUBLIC").is("archived_at", null).maybeSingle();
        if (!product) return null;
        const { data: translations } = await client.from("product_translations").select("locale, name").eq("product_id", product.id).in("locale", locale === "en" ? ["en"] : [locale, "en"]);
        const translation = translations?.find((item) => item.locale === locale) ?? translations?.find((item) => item.locale === "en");
        return translation ? { id: product.id, name: translation.name } : null;
      },
      verifyHuman: (token) => verifyTurnstile(token, ip),
    };

    return await processInquiry({
      honeypot: text(formData, "website"),
      turnstileToken: text(formData, "cf-turnstile-response") || null,
      values: {
        email: text(formData, "email"), locale: text(formData, "locale"), message: text(formData, "message"),
        name: text(formData, "name"), phone: text(formData, "phone"), product: text(formData, "product"),
      },
    }, deps);
  } catch (cause) {
    console.error(`[inquiry] Submission failed: ${cause instanceof Error ? cause.name : "unknown error"}.`);
    return { status: "error", code: "unavailable" };
  }
}
