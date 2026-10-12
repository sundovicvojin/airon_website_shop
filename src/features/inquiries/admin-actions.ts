"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { inquiryStatuses } from "@/features/inquiries/admin-data";
import type { AdminActionState } from "@/features/admin/types";
import { requireAdmin } from "@/lib/permissions/admin";

const updateSchema = z.object({
  id: z.uuid(),
  internalNote: z.string().trim().max(4000, "Note is too long.").transform((value) => value || null),
  status: z.enum(inquiryStatuses),
});

export async function updateInquiry(id: string, _state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const { client } = await requireAdmin("inquiries.manage");
  const parsed = updateSchema.safeParse({ id, internalNote: formData.get("internalNote") ?? "", status: formData.get("status") });
  if (!parsed.success) return { success: false, message: "Check the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  const { error } = await client.from("inquiries").update({ internal_note: parsed.data.internalNote, status: parsed.data.status }).eq("id", parsed.data.id);
  if (error) return { success: false, message: "The inquiry could not be updated." };
  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${parsed.data.id}`);
  revalidatePath("/admin", "layout");
  return { success: true, message: "Inquiry saved." };
}
