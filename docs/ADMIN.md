# Admin operations

## Routes

The protected admin area uses one functional layout:

- `/admin` dashboard
- `/admin/products`, `/admin/products/new`, `/admin/products/[id]`
- `/admin/categories`, `/admin/batches`, `/admin/coa`
- `/admin/coupons`, `/admin/banners`
- `/admin/orders`, `/admin/customers`
- `/admin/login` and `/admin/forbidden`

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

## Product publishing

Create or edit a product in the shared form. Non-translatable price, stock, SKU, strength, unit, visibility, and flags are stored once; EN/SR copy uses translation rows. Money input is converted to integer EUR cents server-side.

A storefront product requires `active = true`, `visibility = PUBLIC`, no archive timestamp, and an English translation. Saving revalidates only EN/SR homepage, shop, collections, and the affected product route. No redeploy is required.

Products referenced by an order cannot be hard-deleted through the safe-delete action. Disable/archive them instead.

## Upload rules

Admin image uploads accept AVIF, WebP, PNG, and JPEG up to 8 MB. COA accepts PDF up to 15 MB. Server actions verify size, declared MIME, file signature, permission, and generated storage path before inserting metadata. Paths use generated UUIDs; original filenames are not trusted. Replaced primary/banner images are removed after the replacement is recorded. COA remains private unless both `active` and `public_visible` are explicitly enabled.

## Empty state

A clean database shows zero products, orders, customers, revenue, and low-stock items. All management tables remain usable without seeded content. Checkout, payments, customer accounts, and transactional email are outside Phase 5.
