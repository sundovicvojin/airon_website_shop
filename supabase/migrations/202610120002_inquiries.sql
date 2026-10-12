-- Contact / quote inquiries. The database is the source of truth; email is only a notification.
-- Writes happen exclusively through a server action using the service role (which bypasses RLS).
-- Admins (SUPER_ADMIN, ADMIN, ORDERS_MANAGER) may read and triage; anon has no access at all.

create type public.inquiry_status as enum ('NEW', 'IN_PROGRESS', 'ANSWERED', 'CLOSED', 'SPAM');

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  name text not null check (char_length(btrim(name)) between 2 and 100),
  email text not null check (char_length(email) between 3 and 254),
  phone text check (phone is null or char_length(phone) between 5 and 40),
  message text not null check (char_length(btrim(message)) between 10 and 3000),
  product_id uuid references public.products(id) on delete set null,
  product_name text check (product_name is null or char_length(product_name) <= 180),
  locale text not null check (locale in ('en', 'sr')),
  status public.inquiry_status not null default 'NEW',
  internal_note text check (internal_note is null or char_length(internal_note) <= 4000),
  ip_hash text check (ip_hash is null or ip_hash ~ '^[0-9a-f]{64}$')
);

comment on table public.inquiries is 'Customer inquiries from the contact form. Contains personal data; never log message bodies.';
comment on column public.inquiries.ip_hash is 'SHA-256(salt + ip). The raw IP address is never stored.';
comment on column public.inquiries.product_name is 'Snapshot of the product name at submission time; survives product deletion.';

create index inquiries_status_created_idx on public.inquiries(status, created_at desc);
create index inquiries_ip_hash_created_idx on public.inquiries(ip_hash, created_at);
create index inquiries_product_idx on public.inquiries(product_id) where product_id is not null;

alter table public.inquiries enable row level security;

revoke all on public.inquiries from anon, authenticated;
-- Admins read everything but may only change triage fields.
grant select on public.inquiries to authenticated;
grant update (status, internal_note) on public.inquiries to authenticated;

create policy inquiries_admin_read on public.inquiries
for select to authenticated
using (private.has_admin_role(array['SUPER_ADMIN','ADMIN','ORDERS_MANAGER']::public.admin_role[]));

create policy inquiries_admin_update on public.inquiries
for update to authenticated
using (private.has_admin_role(array['SUPER_ADMIN','ADMIN','ORDERS_MANAGER']::public.admin_role[]))
with check (private.has_admin_role(array['SUPER_ADMIN','ADMIN','ORDERS_MANAGER']::public.admin_role[]));

-- No insert or delete policy exists for authenticated users: inserts come only from the service role.
