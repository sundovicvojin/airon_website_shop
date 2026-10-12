import Link from "next/link";

import { AdminEmpty, AdminPageHeader, StatusPill } from "@/features/admin/components/admin-ui";
import { getAdminInquiries, inquiryPageSize, inquiryStatuses, parseInquiryFilters } from "@/features/inquiries/admin-data";

export default async function InquiriesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filters = parseInquiryFilters(await searchParams);
  const { inquiries, total } = await getAdminInquiries(filters);
  const pages = Math.max(1, Math.ceil(total / inquiryPageSize));
  const link = (page: number) => {
    const query = new URLSearchParams();
    if (filters.status) query.set("status", filters.status);
    if (filters.q) query.set("q", filters.q);
    if (page > 1) query.set("page", String(page));
    return `/admin/inquiries${query.size ? `?${query}` : ""}`;
  };
  return <>
    <AdminPageHeader description="Messages from the public contact form. New inquiries are listed first." title="Inquiries" />
    <form className="admin-filter">
      <input defaultValue={filters.q} name="q" placeholder="Search name or email" />
      <select aria-label="Status" defaultValue={filters.status ?? ""} name="status"><option value="">All statuses</option>{inquiryStatuses.map((status) => <option key={status}>{status}</option>)}</select>
      <button className="admin-button admin-button--secondary" type="submit">Filter</button>
    </form>
    {inquiries.length ? <div className="admin-table-wrap"><table className="admin-table">
      <thead><tr><th>Name</th><th>Product</th><th>Status</th><th>Received</th></tr></thead>
      <tbody>{inquiries.map((inquiry) => <tr key={inquiry.id}>
        <td><Link href={`/admin/inquiries/${inquiry.id}`}>{inquiry.name}</Link><br /><small>{inquiry.email}</small></td>
        <td>{inquiry.product_name ?? "—"}</td>
        <td><StatusPill tone={inquiry.status === "NEW" ? "warning" : inquiry.status === "ANSWERED" ? "good" : "neutral"}>{inquiry.status}</StatusPill></td>
        <td>{new Date(inquiry.created_at).toLocaleString()}</td>
      </tr>)}</tbody></table></div> : <AdminEmpty>No inquiries match this view.</AdminEmpty>}
    {pages > 1 ? <nav aria-label="Pagination" className="admin-actions" style={{ marginTop: "1rem" }}>
      {filters.page > 1 ? <Link className="admin-button admin-button--secondary" href={link(filters.page - 1)}>Previous</Link> : null}
      <span className="admin-help">Page {filters.page} of {pages}</span>
      {filters.page < pages ? <Link className="admin-button admin-button--secondary" href={link(filters.page + 1)}>Next</Link> : null}
    </nav> : null}
  </>;
}
