import "server-only";

import { z } from "zod";

const serverEnvironmentSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

export function getServerEnvironment(): ServerEnvironment {
  return serverEnvironmentSchema.parse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
}

const optionalString = z.string().trim().optional().transform((value) => value || undefined);

const inquiryEnvironmentSchema = z.object({
  INQUIRY_FROM_EMAIL: optionalString,
  INQUIRY_NOTIFY_EMAIL: optionalString,
  IP_HASH_SALT: optionalString,
  RESEND_API_KEY: optionalString,
  TURNSTILE_SECRET_KEY: optionalString,
});

export type InquiryEnvironment = z.infer<typeof inquiryEnvironmentSchema>;

/** Every inquiry variable is optional here; each consumer decides what a missing value means per environment. */
export function getInquiryEnvironment(): InquiryEnvironment {
  return inquiryEnvironmentSchema.parse({
    INQUIRY_FROM_EMAIL: process.env.INQUIRY_FROM_EMAIL,
    INQUIRY_NOTIFY_EMAIL: process.env.INQUIRY_NOTIFY_EMAIL,
    IP_HASH_SALT: process.env.IP_HASH_SALT,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
  });
}
