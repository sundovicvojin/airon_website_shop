import { z } from "zod";

export const inquiryFields = ["name", "email", "phone", "message"] as const;
export type InquiryField = (typeof inquiryFields)[number];

/** Machine-readable validation codes; the UI maps them to localized copy. */
export type InquiryFieldError = "required" | "short" | "long" | "invalid";
export type InquiryFieldErrors = Partial<Record<InquiryField, InquiryFieldError>>;

const productSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const phonePattern = /^\+?[0-9 ()\-./]{5,30}$/;

export const inquirySchema = z.object({
  name: z.string().trim().min(1, "required").min(2, "short").max(100, "long"),
  email: z.string().trim().min(1, "required").max(254, "long").pipe(z.email("invalid")),
  phone: z.string().trim().max(40, "long").optional().transform((value) => value || undefined)
    .refine((value) => value === undefined || (phonePattern.test(value) && value.replaceAll(/\D/g, "").length >= 5), "invalid"),
  message: z.string().trim().min(1, "required").min(10, "short").max(3000, "long"),
  locale: z.enum(["en", "sr"]),
  // An unknown or malformed slug is ignored, never an error.
  product: z.string().trim().max(120).optional().transform((value) => (value && productSlugPattern.test(value) ? value : undefined)),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

export type SubmitInquiryResult =
  | { status: "ok" }
  | { status: "invalid"; fieldErrors: InquiryFieldErrors }
  | { status: "rate_limited" }
  | { status: "error"; code: "captcha" | "unavailable" };

export function toFieldErrors(error: z.ZodError): InquiryFieldErrors {
  const errors: InquiryFieldErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field !== "string" || !(inquiryFields as readonly string[]).includes(field)) continue;
    const key = field as InquiryField;
    const code = issue.message;
    errors[key] ??= code === "required" || code === "short" || code === "long" ? code : "invalid";
  }
  return errors;
}
