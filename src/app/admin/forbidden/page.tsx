import Link from "next/link";

import { logoutAdmin } from "@/features/admin/auth/actions";

export default function ForbiddenPage() {
  return <main className="admin-login"><section><p className="admin-kicker">ACCESS DENIED</p><h1>Admin role required</h1><p>Your account is authenticated but has no AIRON admin permission.</p><div className="admin-actions"><Link className="admin-button admin-button--secondary" href="/">Storefront</Link><form action={logoutAdmin}><button className="admin-button" type="submit">Sign out</button></form></div></section></main>;
}
