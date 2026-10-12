import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const confirmSchema = z.object({
  token_hash: z.string().min(8).max(512),
  type: z.literal("recovery"),
});

/** Server-side verification of the email-template link (`token_hash` flow). Only password recovery is accepted. */
export async function GET(request: NextRequest) {
  // A relative Location keeps the browser on the host it came from, so the session cookie set here stays valid on the destination.
  const destination = (query: string) => new NextResponse(null, { headers: { "Cache-Control": "no-store", Location: `/admin/reset-password${query}` }, status: 303 });
  const parsed = confirmSchema.safeParse({ token_hash: request.nextUrl.searchParams.get("token_hash"), type: request.nextUrl.searchParams.get("type") });
  if (!parsed.success) return destination("?error=invalid");
  try {
    const client = await createSupabaseServerClient();
    const { error } = await client.auth.verifyOtp({ token_hash: parsed.data.token_hash, type: "recovery" });
    if (error) {
      console.error(`[auth] Recovery verification failed (${error.code ?? error.status ?? "unknown"}).`);
      return destination("?error=invalid");
    }
  } catch {
    console.error("[auth] Recovery verification threw.");
    return destination("?error=invalid");
  }
  // The `next` parameter from the email template is intentionally ignored: the only valid destination is fixed.
  return destination("?verified=1");
}
