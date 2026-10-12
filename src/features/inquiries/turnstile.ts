import "server-only";

import { z } from "zod";

import type { HumanCheck } from "@/features/inquiries/service";
import { getInquiryEnvironment } from "@/lib/env/server";

const verifyUrl = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const responseSchema = z.object({ success: z.boolean() });

/**
 * Verifies a Turnstile token server-side.
 * Without a secret key the check is skipped outside production and fails closed in production.
 */
export async function verifyTurnstile(token: string | null, ip: string | null): Promise<HumanCheck> {
  const { TURNSTILE_SECRET_KEY: secret } = getInquiryEnvironment();
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("[inquiry] TURNSTILE_SECRET_KEY is not configured; rejecting submissions in production.");
      return "failed";
    }
    return "unconfigured";
  }
  if (!token || token.length > 2048) return "failed";
  try {
    const body = new URLSearchParams({ response: token, secret });
    if (ip) body.set("remoteip", ip);
    const response = await fetch(verifyUrl, { body, method: "POST", signal: AbortSignal.timeout(8000) });
    if (!response.ok) return "failed";
    const parsed = responseSchema.safeParse(await response.json());
    return parsed.success && parsed.data.success ? "passed" : "failed";
  } catch {
    console.error("[inquiry] Turnstile verification request failed.");
    return "failed";
  }
}
