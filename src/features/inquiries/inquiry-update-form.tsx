"use client";

import { useActionState } from "react";

import { initialAdminActionState } from "@/features/admin/types";
import { updateInquiry } from "@/features/inquiries/admin-actions";

const statuses = ["NEW", "IN_PROGRESS", "ANSWERED", "CLOSED", "SPAM"] as const;

export function InquiryUpdateForm({ id, internalNote, status }: Readonly<{ id: string; internalNote: string | null; status: (typeof statuses)[number] }>) {
  const [state, action, pending] = useActionState(updateInquiry.bind(null, id), initialAdminActionState);
  return <form action={action} className="admin-form admin-form-section">
    <h2>Triage</h2>
    <label>Status<select defaultValue={status} name="status">{statuses.map((value) => <option key={value}>{value}</option>)}</select></label>
    <label>Internal note<textarea defaultValue={internalNote ?? ""} maxLength={4000} name="internalNote" rows={5} /></label>
    {state.fieldErrors?.internalNote?.[0] ? <p className="admin-field-error">{state.fieldErrors.internalNote[0]}</p> : null}
    {state.message ? <p aria-live="polite" className="admin-form-message" data-success={state.success}>{state.message}</p> : null}
    <div className="admin-form-submit"><button className="admin-button" disabled={pending} type="submit">{pending ? "Saving…" : "Save"}</button></div>
  </form>;
}
