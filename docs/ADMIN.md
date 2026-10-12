# Admin operations

## Routes

The protected admin area uses one functional layout:

- `/admin` dashboard
- `/admin/products`, `/admin/products/new`, `/admin/products/[id]`
- `/admin/categories`, `/admin/batches`, `/admin/coa`
- `/admin/coupons`, `/admin/banners`
- `/admin/orders`, `/admin/customers`
- `/admin/inquiries`, `/admin/inquiries/[id]` (capability `inquiries.manage`: SUPER_ADMIN, ADMIN, ORDERS_MANAGER)
- `/admin/login` and `/admin/forbidden`
- `/admin/forgot-password`, `/admin/reset-password` and `/auth/confirm` (public password-reset flow, see below)

Every protected page and every mutation repeats server-side authentication and capability authorization.

## Roles and permissions

- `SUPER_ADMIN`: all capabilities and future role assignment.
- `ADMIN`: catalogue/content, promotions, orders, and customers.
- `CONTENT_MANAGER`: products, categories, batches, COA, and banners.
- `ORDERS_MANAGER`: orders and customers.

Database RLS remains authoritative. UI visibility is not a security boundary. `public.get_my_admin_roles()` is a minimal security-definer function that returns role codes only for `auth.uid()`.

## First SUPER_ADMIN bootstrap

No credentials or email addresses are seeded. Create the first user through Supabase Auth, copy that user's UUID, then run this once in the target project's SQL editor using an authenticated operational session:

```sql
begin;

insert into public.roles (code, name, description)
values
  ('SUPER_ADMIN', 'Super administrator', 'Full AIRON administration'),
  ('ADMIN', 'Administrator', 'Catalogue, promotions and commerce administration'),
  ('ORDERS_MANAGER', 'Orders manager', 'Orders and customer operations'),
  ('CONTENT_MANAGER', 'Content manager', 'Catalogue and storefront content')
on conflict (code) do update
set name = excluded.name, description = excluded.description;

insert into public.user_roles (user_id, role_id, assigned_by)
select 'REPLACE_WITH_AUTH_USER_UUID'::uuid, id, null
from public.roles
where code = 'SUPER_ADMIN'
on conflict do nothing;

commit;
```

Verify access, then record the operator and time in the deployment log. Never commit a password, UUID, or email-based authorization rule.

## Reset šifre

Flow: `/admin/login` → "Zaboravljena šifra?" → `/admin/forgot-password` → email → link → `/admin/reset-password` → `/admin/login?notice=password-changed`.

### Routes

- `/admin/forgot-password`: server action `requestPasswordReset` calls `resetPasswordForEmail` with `redirectTo = NEXT_PUBLIC_SITE_URL + /admin/reset-password`. The answer is always "Ako nalog postoji, poslali smo uputstvo na mejl." so accounts cannot be discovered.
- `/auth/confirm`: server route for the `token_hash` link. Verifies the OTP (`type=recovery` only), sets the session cookies and redirects to `/admin/reset-password?verified=1`. The `next` parameter is ignored; the destination is fixed.
- `/admin/reset-password`: client form (min 12 characters, confirmation, show/hide). It accepts all three link types, cleans the URL (`history.replaceState`) before any request, then calls `updateUser({ password })` and `signOut({ scope: "global" })`, which revokes every session of the account.

All three are public: they live outside the `(panel)` layout, so `requireAdmin` does not run, and `src/proxy.ts` only refreshes the session cookie. Resetting a password grants no roles; roles stay in `user_roles`.

### Supported link types

1. `token_hash` via `/auth/confirm` (recommended; works when the email is opened on another device).
2. `?code=` (PKCE). The request and the click must happen in the same browser.
3. `#access_token=…&type=recovery` (implicit, e.g. the dashboard's "Send password recovery"). Parsed manually, since `@supabase/ssr` uses PKCE.

### Supabase configuration

Authentication → URL Configuration:

- Site URL: the production `NEXT_PUBLIC_SITE_URL` (for example `https://airon-tau.vercel.app`).
- Redirect URLs: `https://<production-domain>/admin/reset-password`, `https://<production-domain>/auth/confirm`, and for local development `http://localhost:3000/admin/reset-password` and `http://localhost:3000/auth/confirm`. Add preview domains only if you test resets there.

Authentication → Emails → "Reset Password" template (enables the `token_hash` flow; `supabase/templates/recovery.html` contains the same):

```html
<h2>Reset lozinke</h2>
<p>Pratite link da biste postavili novu šifru:</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/admin/reset-password">Postavi novu šifru</a></p>
<p>Ako niste tražili reset, ignorišite ovaj mejl.</p>
```

Some mail scanners open links automatically and consume a one-time token; if admins report "Link je istekao" immediately, ask for a new link and open it from the mail client directly.

`NEXT_PUBLIC_SITE_URL` must be set in every environment; redeploy after changing it because it is inlined at build time.

## Product publishing

Create or edit a product in the shared form. Non-translatable price, stock, SKU, strength, unit, visibility, and flags are stored once; EN/SR copy uses translation rows. Money input is converted to integer EUR cents server-side.

A storefront product requires `active = true`, `visibility = PUBLIC`, no archive timestamp, and an English translation. Saving revalidates only EN/SR homepage, shop, collections, and the affected product route. No redeploy is required.

Products referenced by an order cannot be hard-deleted through the safe-delete action. Disable/archive them instead.

## Upload rules

Admin image uploads accept AVIF, WebP, PNG, and JPEG up to 8 MB. COA accepts PDF up to 15 MB. Server actions verify size, declared MIME, file signature, permission, and generated storage path before inserting metadata. Paths use generated UUIDs; original filenames are not trusted. Replaced primary/banner images are removed after the replacement is recorded. COA remains private unless both `active` and `public_visible` are explicitly enabled.

## Empty state

A clean database shows zero products, orders, customers, revenue, and low-stock items. All management tables remain usable without seeded content. Checkout, payments, customer accounts, and transactional email are outside Phase 5.
