"use client";

import { useActionState } from "react";

import { requestPasswordReset } from "@/features/admin/auth/actions";
import { initialAdminActionState } from "@/features/admin/types";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, initialAdminActionState);
  return (
    <form action={action} className="admin-form admin-login__form">
      <label>Mejl<input autoComplete="email" name="email" required type="email" /></label>
      {state.fieldErrors?.email?.[0] ? <p className="admin-field-error">{state.fieldErrors.email[0]}</p> : null}
      {state.message ? <p aria-live="polite" className="admin-form-message" data-success={state.success}>{state.message}</p> : null}
      <button className="admin-button" disabled={pending} type="submit">{pending ? "Slanje…" : "Pošalji uputstvo"}</button>
    </form>
  );
}
