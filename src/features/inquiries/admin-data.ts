import "server-only";

import { z } from "zod";

import { requireAdmin } from "@/lib/permissions/admin";
import type { Database } from "@/lib/supabase/database.types";

export type InquiryStatus = Database["public"]["Enums"]["inquiry_status"];
export const inquiryStatuses = ["NEW", "IN_PROGRESS", "ANSWERED", "CLOSED", "SPAM"] as const satisfies readonly InquiryStatus[];
export const inquiryPageSize = 25;

const listSchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
  q: z.string().trim().max(100).catch(""),
  status: z.enum(inquiryStatuses).optional().catch(undefined),
});

export function parseInquiryFilters(input: Record<string, string | string[] | undefined>) {
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
  return listSchema.parse({ page: first(input.page), q: first(input.q) ?? "", status: first(input.status) || undefined });
}

export async function getAdminInquiries(filters: ReturnType<typeof parseInquiryFilters>) {
  const { client } = await requireAdmin("inquiries.manage");
  let request = client.from("inquiries").select("id,created_at,name,email,product_name,status", { count: "exact" })
    // The enum is declared NEW first, so ascending status puts open work on top.
    .order("status", { ascending: true }).order("created_at", { ascending: false })
    .range((filters.page - 1) * inquiryPageSize, filters.page * inquiryPageSize - 1);
  if (filters.status) request = request.eq("status", filters.status);
  if (filters.q) {
    const term = filters.q.replaceAll(/[%,()*\\]/g, "");
    if (term) request = request.or(`name.ilike.%${term}%,email.ilike.%${term}%`);
  }
  const { data, count, error } = await request;
  if (error) throw error;
  return { inquiries: data, total: count ?? data.length };
}

export async function getAdminInquiry(id: string) {
  const { client } = await requireAdmin("inquiries.manage");
  if (!z.uuid().safeParse(id).success) return null;
  const { data, error } = await client.from("inquiries").select("id,created_at,name,email,phone,message,product_id,product_name,locale,status,internal_note").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}
