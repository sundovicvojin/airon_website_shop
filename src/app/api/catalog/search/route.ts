import { NextResponse } from "next/server";
import { z } from "zod";

import { getPublicProducts } from "@/lib/supabase/services/catalog";

const searchSchema = z.object({
  locale: z.enum(["en", "sr"]).default("en"),
  q: z.string().trim().min(2).max(100),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = searchSchema.safeParse({ locale: url.searchParams.get("locale") ?? "en", q: url.searchParams.get("q") ?? "" });
  if (!parsed.success) return NextResponse.json({ products: [] }, { headers: { "Cache-Control": "no-store" } });
  const result = await getPublicProducts({ locale: parsed.data.locale, query: parsed.data.q, limit: 12 });
  if (!result.ok) return NextResponse.json({ error: "SEARCH_UNAVAILABLE" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  return NextResponse.json({ products: result.value.products }, { headers: { "Cache-Control": "no-store" } });
}
