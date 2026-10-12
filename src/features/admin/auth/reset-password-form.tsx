"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { newPasswordSchema } from "@/features/admin/auth/schemas";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Status = "checking" | "ready" | "invalid";
type Errors = Partial<Record<"password" | "confirmation", string>>;

const resetPath = "/admin/reset-password";
let recovery: Promise<Status> | null = null;

/**
 * Turns whatever the email link carried into a session, once per page load (React Strict Mode runs effects twice).
 * Supported: implicit hash (#access_token&refresh_token&type=recovery), PKCE (?code=) and a session already
 * established by /auth/confirm (?verified=1). The URL is cleaned before any network call and tokens are never logged.
 */
function establishRecoverySession(): Promise<Status> {
  recovery ??= (async () => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const query = new URLSearchParams(window.location.search);
    window.history.replaceState(null, "", resetPath);

    if (hash.get("error") || hash.get("error_code") || query.get("error")) return "invalid";
    const client = createSupabaseBrowserClient({ detectSessionInUrl: false });
    try {
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      if (accessToken && refreshToken && hash.get("type") === "recovery") {
        const { error } = await client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        return error ? "invalid" : "ready";
      }
      const code = query.get("code");
      if (code) {
        const { error } = await client.auth.exchangeCodeForSession(code);
        return error ? "invalid" : "ready";
      }
      if (query.get("verified") === "1") {
        const { data } = await client.auth.getSession();
        return data.session ? "ready" : "invalid";
      }
    } catch {
      return "invalid";
    }
    return "invalid";
  })();
  return recovery;
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;
    void establishRecoverySession().then((next) => { if (active) setStatus(next); });
    return () => { active = false; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const parsed = newPasswordSchema.safeParse({ confirmation: data.get("confirmation"), password: data.get("password") });
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({ confirmation: fieldErrors.confirmation?.[0], password: fieldErrors.password?.[0] });
      setMessage("");
      return;
    }
    setErrors({});
    setMessage("");
    setPending(true);
    const client = createSupabaseBrowserClient({ detectSessionInUrl: false });
    const { error } = await client.auth.updateUser({ password: parsed.data.password });
    if (error) {
      setPending(false);
      setMessage(error.code === "same_password" ? "Nova šifra mora da se razlikuje od stare." : error.code === "weak_password" ? "Šifra je previše slaba. Izaberite drugu." : "Šifra nije promenjena. Pokušajte ponovo ili zatražite novi link.");
      return;
    }
    // Revoke every session of this account (including the recovery one) before sending the admin back to login.
    await client.auth.signOut({ scope: "global" });
    router.replace("/admin/login?notice=password-changed");
  }

  if (status === "checking") return <p aria-live="polite">Provera linka…</p>;
  if (status === "invalid") {
    return <div className="admin-form"><p className="admin-form-message" role="alert">Link je istekao ili nije važeći.</p><Link className="admin-button" href="/admin/forgot-password">Zatraži novi link</Link></div>;
  }
  return (
    <form className="admin-form admin-login__form" noValidate onSubmit={submit}>
      <label>Nova šifra<input autoComplete="new-password" minLength={12} name="password" required type={visible ? "text" : "password"} /></label>
      {errors.password ? <p className="admin-field-error">{errors.password}</p> : null}
      <label>Potvrda šifre<input autoComplete="new-password" name="confirmation" required type={visible ? "text" : "password"} /></label>
      {errors.confirmation ? <p className="admin-field-error">{errors.confirmation}</p> : null}
      <button aria-pressed={visible} className="admin-button admin-button--secondary" onClick={() => setVisible((value) => !value)} type="button">{visible ? "Sakrij šifru" : "Prikaži šifru"}</button>
      {message ? <p aria-live="polite" className="admin-form-message" role="alert">{message}</p> : null}
      <button className="admin-button" disabled={pending} type="submit">{pending ? "Čuvanje…" : "Sačuvaj novu šifru"}</button>
    </form>
  );
}
