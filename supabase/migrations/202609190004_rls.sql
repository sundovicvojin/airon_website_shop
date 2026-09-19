-- AIRON Phase 4: deny-by-default table access and explicit public/admin policies.

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.products enable row level security;
alter table public.product_translations enable row level security;
alter table public.product_specifications enable row level security;
alter table public.product_specification_translations enable row level security;
alter table public.product_images enable row level security;
alter table public.categories enable row level security;
alter table public.category_translations enable row level security;
alter table public.product_categories enable row level security;
alter table public.product_batches enable row level security;
alter table public.coa_documents enable row level security;
alter table public.banners enable row level security;
alter table public.banner_translations enable row level security;
alter table public.customers enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;
alter table public.shipping_zones enable row level security;
alter table public.shipping_methods enable row level security;

revoke all on all tables in schema public from anon, authenticated;
grant execute on function public.search_public_products(text, text, integer) to anon, authenticated;

grant select on public.products, public.product_translations, public.product_images,
  public.product_specifications, public.product_specification_translations,
  public.categories, public.category_translations, public.product_categories,
  public.product_batches, public.coa_documents, public.banners, public.banner_translations
to anon, authenticated;

grant select, insert, update, delete on public.products, public.product_translations,
  public.product_images, public.product_specifications, public.product_specification_translations,
  public.categories, public.category_translations,
  public.product_categories, public.product_batches, public.coa_documents,
  public.banners, public.banner_translations
to authenticated;

grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;
grant select, insert, update, delete on public.profiles, public.roles, public.user_roles,
  public.customers, public.addresses, public.orders, public.order_items, public.payments,
  public.coupons, public.coupon_redemptions, public.shipping_zones, public.shipping_methods
to authenticated;

create policy products_public_read on public.products
for select to anon, authenticated
using (active and visibility = 'PUBLIC' and archived_at is null);

create policy product_translations_public_read on public.product_translations
for select to anon, authenticated
using (exists (
  select 1 from public.products p
  where p.id = product_id and p.active and p.visibility = 'PUBLIC' and p.archived_at is null
));

create policy product_images_public_read on public.product_images
for select to anon, authenticated
using (exists (
  select 1 from public.products p
  where p.id = product_id and p.active and p.visibility = 'PUBLIC' and p.archived_at is null
));

create policy product_specifications_public_read on public.product_specifications
for select to anon, authenticated
using (exists (
  select 1 from public.products p
  where p.id = product_id and p.active and p.visibility = 'PUBLIC' and p.archived_at is null
));

create policy product_specification_translations_public_read on public.product_specification_translations
for select to anon, authenticated
using (exists (
  select 1 from public.product_specifications ps
  join public.products p on p.id = ps.product_id
  where ps.id = specification_id and p.active and p.visibility = 'PUBLIC' and p.archived_at is null
));

create policy categories_public_read on public.categories
for select to anon, authenticated
using (active and archived_at is null);

create policy category_translations_public_read on public.category_translations
for select to anon, authenticated
using (exists (
  select 1 from public.categories c
  where c.id = category_id and c.active and c.archived_at is null
));

create policy product_categories_public_read on public.product_categories
for select to anon, authenticated
using (
  exists (select 1 from public.products p where p.id = product_id and p.active and p.visibility = 'PUBLIC' and p.archived_at is null)
  and exists (select 1 from public.categories c where c.id = category_id and c.active and c.archived_at is null)
);

create policy product_batches_public_read on public.product_batches
for select to anon, authenticated
using (active and exists (
  select 1 from public.products p
  where p.id = product_id and p.active and p.visibility = 'PUBLIC' and p.archived_at is null
));

create policy coa_documents_public_read on public.coa_documents
for select to anon, authenticated
using (active and public_visible and exists (
  select 1 from public.products p
  where p.id = product_id and p.active and p.visibility = 'PUBLIC' and p.archived_at is null
));

create policy banners_public_read on public.banners
for select to anon, authenticated
using (
  active
  and (starts_at is null or starts_at <= timezone('utc', now()))
  and (ends_at is null or ends_at > timezone('utc', now()))
);

create policy banner_translations_public_read on public.banner_translations
for select to anon, authenticated
using (exists (
  select 1 from public.banners b
  where b.id = banner_id and b.active
    and (b.starts_at is null or b.starts_at <= timezone('utc', now()))
    and (b.ends_at is null or b.ends_at > timezone('utc', now()))
));

create policy profiles_self_read on public.profiles
for select to authenticated using (id = auth.uid());
create policy profiles_self_update on public.profiles
for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy customers_owner_read on public.customers
for select to authenticated using (auth_user_id = auth.uid());
create policy addresses_owner_read on public.addresses
for select to authenticated using (exists (
  select 1 from public.customers c where c.id = customer_id and c.auth_user_id = auth.uid()
));
create policy orders_owner_read on public.orders
for select to authenticated using (exists (
  select 1 from public.customers c where c.id = customer_id and c.auth_user_id = auth.uid()
));
create policy order_items_owner_read on public.order_items
for select to authenticated using (exists (
  select 1 from public.orders o
  join public.customers c on c.id = o.customer_id
  where o.id = order_id and c.auth_user_id = auth.uid()
));
create policy payments_owner_read on public.payments
for select to authenticated using (exists (
  select 1 from public.orders o
  join public.customers c on c.id = o.customer_id
  where o.id = order_id and c.auth_user_id = auth.uid()
));

create policy profiles_admin_all on public.profiles
for all to authenticated
using (private.has_admin_role()) with check (private.has_admin_role());
create policy roles_admin_all on public.roles
for all to authenticated
using (private.has_admin_role(array['SUPER_ADMIN']::public.admin_role[]))
with check (private.has_admin_role(array['SUPER_ADMIN']::public.admin_role[]));
create policy user_roles_admin_all on public.user_roles
for all to authenticated
using (private.has_admin_role(array['SUPER_ADMIN']::public.admin_role[]))
with check (private.has_admin_role(array['SUPER_ADMIN']::public.admin_role[]));

create policy products_content_admin_all on public.products
for all to authenticated
using (private.has_admin_role(array['SUPER_ADMIN','ADMIN','CONTENT_MANAGER']::public.admin_role[]))
with check (private.has_admin_role(array['SUPER_ADMIN','ADMIN','CONTENT_MANAGER']::public.admin_role[]));
create policy product_translations_content_admin_all on public.product_translations
for all to authenticated
using (private.has_admin_role(array['SUPER_ADMIN','ADMIN','CONTENT_MANAGER']::public.admin_role[]))
with check (private.has_admin_role(array['SUPER_ADMIN','ADMIN','CONTENT_MANAGER']::public.admin_role[]));
create policy product_images_content_admin_all on public.product_images
for all to authenticated
using (private.has_admin_role(array['SUPER_ADMIN','ADMIN','CONTENT_MANAGER']::public.admin_role[]))
with check (private.has_admin_role(array['SUPER_ADMIN','ADMIN','CONTENT_MANAGER']::public.admin_role[]));
create policy product_specifications_content_admin_all on public.product_specifications
for all to authenticated
using (private.has_admin_role(array['SUPER_ADMIN','ADMIN','CONTENT_MANAGER']::public.admin_role[]))
with check (private.has_admin_role(array['SUPER_ADMIN','ADMIN','CONTENT_MANAGER']::public.admin_role[]));
create policy product_specification_translations_content_admin_all on public.product_specification_translations
for all to authenticated
using (private.has_admin_role(array['SUPER_ADMIN','ADMIN','CONTENT_MANAGER']::public.admin_role[]))
with check (private.has_admin_role(array['SUPER_ADMIN','ADMIN','CONTENT_MANAGER']::public.admin_role[]));
create policy categories_content_admin_all on public.categories
for all to authenticated
using (private.has_admin_role(array['SUPER_ADMIN','ADMIN','CONTENT_MANAGER']::public.admin_role[]))
with check (private.has_admin_role(array['SUPER_ADMIN','ADMIN','CONTENT_MANAGER']::public.admin_role[]));
create policy category_translations_content_admin_all on public.category_translations
for all to authenticated
using (private.has_admin_role(array['SUPER_ADMIN','ADMIN','CONTENT_MANAGER']::public.admin_role[]))
with check (private.has_admin_role(array['SUPER_ADMIN','ADMIN','CONTENT_MANAGER']::public.admin_role[]));
create policy product_categories_content_admin_all on public.product_categories
for all to authenticated
using (private.has_admin_role(array['SUPER_ADMIN','ADMIN','CONTENT_MANAGER']::public.admin_role[]))
with check (private.has_admin_role(array['SUPER_ADMIN','ADMIN','CONTENT_MANAGER']::public.admin_role[]));
create policy product_batches_content_admin_all on public.product_batches
for all to authenticated
using (private.has_admin_role(array['SUPER_ADMIN','ADMIN','CONTENT_MANAGER']::public.admin_role[]))
with check (private.has_admin_role(array['SUPER_ADMIN','ADMIN','CONTENT_MANAGER']::public.admin_role[]));
create policy coa_documents_content_admin_all on public.coa_documents
for all to authenticated
using (private.has_admin_role(array['SUPER_ADMIN','ADMIN','CONTENT_MANAGER']::public.admin_role[]))
with check (private.has_admin_role(array['SUPER_ADMIN','ADMIN','CONTENT_MANAGER']::public.admin_role[]));
create policy banners_content_admin_all on public.banners
for all to authenticated
using (private.has_admin_role(array['SUPER_ADMIN','ADMIN','CONTENT_MANAGER']::public.admin_role[]))
with check (private.has_admin_role(array['SUPER_ADMIN','ADMIN','CONTENT_MANAGER']::public.admin_role[]));
create policy banner_translations_content_admin_all on public.banner_translations
for all to authenticated
using (private.has_admin_role(array['SUPER_ADMIN','ADMIN','CONTENT_MANAGER']::public.admin_role[]))
with check (private.has_admin_role(array['SUPER_ADMIN','ADMIN','CONTENT_MANAGER']::public.admin_role[]));

create policy customers_orders_admin_all on public.customers for all to authenticated
using (private.has_admin_role(array['SUPER_ADMIN','ADMIN','ORDERS_MANAGER']::public.admin_role[]))
with check (private.has_admin_role(array['SUPER_ADMIN','ADMIN','ORDERS_MANAGER']::public.admin_role[]));
create policy addresses_orders_admin_all on public.addresses for all to authenticated
using (private.has_admin_role(array['SUPER_ADMIN','ADMIN','ORDERS_MANAGER']::public.admin_role[]))
with check (private.has_admin_role(array['SUPER_ADMIN','ADMIN','ORDERS_MANAGER']::public.admin_role[]));
create policy orders_orders_admin_all on public.orders for all to authenticated
using (private.has_admin_role(array['SUPER_ADMIN','ADMIN','ORDERS_MANAGER']::public.admin_role[]))
with check (private.has_admin_role(array['SUPER_ADMIN','ADMIN','ORDERS_MANAGER']::public.admin_role[]));
create policy order_items_orders_admin_all on public.order_items for all to authenticated
using (private.has_admin_role(array['SUPER_ADMIN','ADMIN','ORDERS_MANAGER']::public.admin_role[]))
with check (private.has_admin_role(array['SUPER_ADMIN','ADMIN','ORDERS_MANAGER']::public.admin_role[]));
create policy payments_orders_admin_all on public.payments for all to authenticated
using (private.has_admin_role(array['SUPER_ADMIN','ADMIN','ORDERS_MANAGER']::public.admin_role[]))
with check (private.has_admin_role(array['SUPER_ADMIN','ADMIN','ORDERS_MANAGER']::public.admin_role[]));
create policy coupons_orders_admin_all on public.coupons for all to authenticated
using (private.has_admin_role(array['SUPER_ADMIN','ADMIN','ORDERS_MANAGER']::public.admin_role[]))
with check (private.has_admin_role(array['SUPER_ADMIN','ADMIN','ORDERS_MANAGER']::public.admin_role[]));
create policy coupon_redemptions_orders_admin_all on public.coupon_redemptions for all to authenticated
using (private.has_admin_role(array['SUPER_ADMIN','ADMIN','ORDERS_MANAGER']::public.admin_role[]))
with check (private.has_admin_role(array['SUPER_ADMIN','ADMIN','ORDERS_MANAGER']::public.admin_role[]));
create policy shipping_zones_orders_admin_all on public.shipping_zones for all to authenticated
using (private.has_admin_role(array['SUPER_ADMIN','ADMIN','ORDERS_MANAGER']::public.admin_role[]))
with check (private.has_admin_role(array['SUPER_ADMIN','ADMIN','ORDERS_MANAGER']::public.admin_role[]));
create policy shipping_methods_orders_admin_all on public.shipping_methods for all to authenticated
using (private.has_admin_role(array['SUPER_ADMIN','ADMIN','ORDERS_MANAGER']::public.admin_role[]))
with check (private.has_admin_role(array['SUPER_ADMIN','ADMIN','ORDERS_MANAGER']::public.admin_role[]));

comment on policy orders_owner_read on public.orders is
  'Authenticated customers may read only orders linked through their auth-bound customer row. Guest lookup remains deferred.';
