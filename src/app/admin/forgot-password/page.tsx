import type { Metadata } from "next";
import Link from "next/link";

import { ForgotPasswordForm } from "@/features/admin/auth/forgot-password-form";

export const metadata: Metadata = { robots: { follow: false, index: false }, title: "Zaboravljena šifra" };

export default function ForgotPasswordPage() {
  return <main className="admin-login"><section><p className="admin-kicker">AIRON CONTROL</p><h1>Zaboravljena šifra</h1><p>Unesite mejl admin naloga. Ako nalog postoji, poslaćemo uputstvo za novu šifru.</p><ForgotPasswordForm /><p><Link href="/admin/login">Nazad na prijavu</Link></p></section></main>;
}
