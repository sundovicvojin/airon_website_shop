import { inquirySchema, toFieldErrors, type InquiryInput, type SubmitInquiryResult } from "./schema";

export const inquiryRateLimit = { max: 5, windowMinutes: 60 } as const;

export type InquiryRecord = Readonly<{
  email: string;
  ip_hash: string | null;
  locale: "en" | "sr";
  message: string;
  name: string;
  phone: string | null;
  product_id: string | null;
  product_name: string | null;
}>;

export type HumanCheck = "passed" | "failed" | "unconfigured";

/** Everything with side effects is injected so the pipeline can be exercised without network or database. */
export type InquiryDeps = Readonly<{
  countRecentFromIp: (ipHash: string, sinceIso: string) => Promise<number>;
  hashIp: () => string | null;
  insert: (record: InquiryRecord) => Promise<{ id: string } | null>;
  notify: (inquiry: InquiryRecord & { id: string }) => Promise<void>;
  now: () => Date;
  resolveProduct: (slug: string, locale: "en" | "sr") => Promise<{ id: string; name: string } | null>;
  verifyHuman: (token: string | null) => Promise<HumanCheck>;
}>;

export type InquiryRaw = Readonly<{ honeypot: string; turnstileToken: string | null; values: Record<string, unknown> }>;

export async function processInquiry(raw: InquiryRaw, deps: InquiryDeps): Promise<SubmitInquiryResult> {
  // a) validation
  const parsed = inquirySchema.safeParse(raw.values);
  if (!parsed.success) {
    const fieldErrors = toFieldErrors(parsed.error);
    // Errors outside the visible fields (e.g. a tampered locale) are not user-fixable.
    return Object.keys(fieldErrors).length ? { status: "invalid", fieldErrors } : { status: "error", code: "unavailable" };
  }
  const input: InquiryInput = parsed.data;

  // b) honeypot: pretend success, write nothing
  if (raw.honeypot.trim() !== "") return { status: "ok" };

  // c) Turnstile
  if ((await deps.verifyHuman(raw.turnstileToken)) === "failed") return { status: "error", code: "captcha" };

  // d) rate limit by hashed IP
  const ipHash = deps.hashIp();
  if (ipHash) {
    const since = new Date(deps.now().getTime() - inquiryRateLimit.windowMinutes * 60_000).toISOString();
    if ((await deps.countRecentFromIp(ipHash, since)) >= inquiryRateLimit.max) return { status: "rate_limited" };
  }

  // e) resolve the product on the server; an unknown slug is silently ignored
  const product = input.product ? await deps.resolveProduct(input.product, input.locale) : null;

  // f) persist (source of truth)
  const record: InquiryRecord = {
    email: input.email, ip_hash: ipHash, locale: input.locale, message: input.message, name: input.name,
    phone: input.phone ?? null, product_id: product?.id ?? null, product_name: product?.name ?? null,
  };
  const saved = await deps.insert(record);
  if (!saved) return { status: "error", code: "unavailable" };

  // g) notification: best effort, never affects the outcome
  try {
    await deps.notify({ ...record, id: saved.id });
  } catch {
    console.error("[inquiry] notification failed");
  }
  return { status: "ok" };
}
