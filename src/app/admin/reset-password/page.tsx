import type { Metadata } from "next";

import { ResetPasswordForm } from "@/features/admin/auth/reset-password-form";

export const metadata: Metadata = { referrer: "no-referrer", robots: { follow: false, index: false }, title: "Nova šifra" };

export default function ResetPasswordPage() {
  return <main className="admin-login"><section><p className="admin-kicker">AIRON CONTROL</p><h1>Nova šifra</h1><ResetPasswordForm /></section></main>;
}
