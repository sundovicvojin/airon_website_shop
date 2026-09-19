"use client";

import { useActionState } from "react";

import { loginAdmin } from "@/features/admin/auth/actions";
import { initialAdminActionState } from "@/features/admin/types";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAdmin, initialAdminActionState);
  return (
    <form action={action} className="admin-form admin-login__form">
      <label>Email<input autoComplete="email" name="email" required type="email" /></label>
      {state.fieldErrors?.email?.[0] ? <p className="admin-field-error">{state.fieldErrors.email[0]}</p> : null}
      <label>Password<input autoComplete="current-password" minLength={8} name="password" required type="password" /></label>
      {state.fieldErrors?.password?.[0] ? <p className="admin-field-error">{state.fieldErrors.password[0]}</p> : null}
      {state.message ? <p aria-live="polite" className="admin-form-message" data-success={state.success}>{state.message}</p> : null}
      <button className="admin-button" disabled={pending} type="submit">{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
