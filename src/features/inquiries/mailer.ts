import "server-only";

import { z } from "zod";

import type { InquiryRecord } from "@/features/inquiries/service";
import { getInquiryEnvironment } from "@/lib/env/server";
import { getPublicEnvironment } from "@/lib/env/public";

const resendUrl = "https://api.resend.com/emails";
const recipientSchema = z.array(z.email()).min(1).max(10);

export function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function singleLine(value: string) {
  return value.replaceAll(/[\r\n\u0000-\u001f\u007f]+/g, " ").trim().slice(0, 150);
}

/**
 * Sends the admin notification through the Resend REST API.
 * Failures throw (without message content) so the caller can log and continue; a missing configuration only warns.
 */
export async function sendInquiryNotification(inquiry: InquiryRecord & { id: string }) {
  const environment = getInquiryEnvironment();
  const recipients = recipientSchema.safeParse((environment.INQUIRY_NOTIFY_EMAIL ?? "").split(",").map((item) => item.trim()).filter(Boolean));
  if (!environment.RESEND_API_KEY || !environment.INQUIRY_FROM_EMAIL || !recipients.success) {
    console.warn("[inquiry] Email notification skipped: RESEND_API_KEY, INQUIRY_FROM_EMAIL or INQUIRY_NOTIFY_EMAIL is not configured.");
    return;
  }

  const link = `${getPublicEnvironment().NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/admin/inquiries/${inquiry.id}`;
  const rows: readonly (readonly [string, string])[] = [
    ["Name", inquiry.name], ["Email", inquiry.email], ["Phone", inquiry.phone ?? "—"],
    ["Product", inquiry.product_name ?? "—"], ["Language", inquiry.locale.toUpperCase()],
  ];
  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#17191c">`
    + `<h2 style="margin:0 0 16px">New AIRON inquiry</h2>`
    + `<table cellpadding="6" style="border-collapse:collapse">${rows.map(([label, value]) => `<tr><td style="color:#737983">${label}</td><td>${escapeHtml(value)}</td></tr>`).join("")}</table>`
    + `<p style="margin:16px 0 4px;color:#737983">Message</p><p style="margin:0;white-space:pre-wrap">${escapeHtml(inquiry.message)}</p>`
    + `<p style="margin-top:24px"><a href="${escapeHtml(link)}">Open in admin</a></p></div>`;
  const text = [...rows.map(([label, value]) => `${label}: ${value}`), "", inquiry.message, "", link].join("\n");

  const response = await fetch(resendUrl, {
    body: JSON.stringify({
      from: environment.INQUIRY_FROM_EMAIL,
      html,
      reply_to: inquiry.email,
      subject: singleLine(`New inquiry${inquiry.product_name ? `: ${inquiry.product_name}` : ""}`),
      text,
      to: recipients.data,
    }),
    headers: { Authorization: `Bearer ${environment.RESEND_API_KEY}`, "Content-Type": "application/json" },
    method: "POST",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Resend responded with status ${response.status}.`);
}
