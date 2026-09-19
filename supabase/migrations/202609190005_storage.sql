-- AIRON Phase 4: deterministic Storage buckets and object policies.
-- Product and banner buckets use controlled public reads through object RLS; write access remains admin-only.
-- COA is private and readable only when a matching active/public document row exists.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', false, 8388608, array['image/avif','image/webp','image/png','image/jpeg']),
  ('banners', 'banners', false, 8388608, array['image/avif','image/webp','image/png','image/jpeg']),
  ('coa', 'coa', false, 15728640, array['application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy product_images_object_read on storage.objects
for select to anon, authenticated
using (
  bucket_id = 'product-images'
  and exists (
    select 1
    from public.product_images pi
    join public.products p on p.id = pi.product_id
    where pi.storage_path = name
      and p.active and p.visibility = 'PUBLIC' and p.archived_at is null
  )
);

create policy banners_object_read on storage.objects
for select to anon, authenticated
using (
  bucket_id = 'banners'
  and exists (
    select 1 from public.banners b
    where b.image_path = name and b.active
      and (b.starts_at is null or b.starts_at <= timezone('utc', now()))
      and (b.ends_at is null or b.ends_at > timezone('utc', now()))
  )
);

create policy coa_object_public_read on storage.objects
for select to anon, authenticated
using (
  bucket_id = 'coa'
  and exists (
    select 1
    from public.coa_documents d
    join public.products p on p.id = d.product_id
    where d.storage_path = name
      and d.active and d.public_visible
      and p.active and p.visibility = 'PUBLIC' and p.archived_at is null
  )
);

create policy airon_content_admin_objects_all on storage.objects
for all to authenticated
using (
  bucket_id in ('product-images', 'banners', 'coa')
  and private.has_admin_role(array['SUPER_ADMIN','ADMIN','CONTENT_MANAGER']::public.admin_role[])
)
with check (
  bucket_id in ('product-images', 'banners', 'coa')
  and private.has_admin_role(array['SUPER_ADMIN','ADMIN','CONTENT_MANAGER']::public.admin_role[])
);
