import { notFound } from "next/navigation";

import { AdminPageHeader, StatusPill } from "@/features/admin/components/admin-ui";
import { getAdminInquiry } from "@/features/inquiries/admin-data";
import { InquiryUpdateForm } from "@/features/inquiries/inquiry-update-form";

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inquiry = await getAdminInquiry(id);
  if (!inquiry) notFound();
  const subject = `Re: ${inquiry.product_name ?? "your inquiry"}`;
  const rows: readonly (readonly [string, string])[] = [
    ["Name", inquiry.name], ["Email", inquiry.email], ["Phone", inquiry.phone ?? "—"],
    ["Product", inquiry.product_name ?? "—"], ["Language", inquiry.locale.toUpperCase()], ["Received", new Date(inquiry.created_at).toLocaleString()],
  ];
  return <>
    <AdminPageHeader actionHref="/admin/inquiries" actionLabel="All inquiries" description={`${inquiry.name} · ${inquiry.email}`} title="Inquiry" />
    <section className="admin-form-section">
      <h2>Details <StatusPill tone={inquiry.status === "NEW" ? "warning" : "neutral"}>{inquiry.status}</StatusPill></h2>
      <dl>{rows.map(([label, value]) => <div key={label}><dt className="admin-help">{label}</dt><dd>{value}</dd></div>)}</dl>
      <h3 className="admin-help">Message</h3>
      <p style={{ whiteSpace: "pre-wrap" }}>{inquiry.message}</p>
      <div className="admin-actions"><a className="admin-button" href={`mailto:${encodeURIComponent(inquiry.email)}?subject=${encodeURIComponent(subject)}`}>Odgovori mejlom</a></div>
    </section>
    <InquiryUpdateForm id={inquiry.id} internalNote={inquiry.internal_note} status={inquiry.status} />
  </>;
}
