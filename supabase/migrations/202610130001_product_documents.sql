-- One optional public PDF (catalogue / specification) per product.
-- Reads are public only for active + PUBLIC products; writes are admin-only. The bucket is private; reads go through object RLS.

create table public.product_documents (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null unique references public.products(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 180),
  storage_path text not null unique check (storage_path ~ '^products/[0-9a-f-]{36}/docs/[0-9a-f-]{36}\.pdf$'),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger product_documents_set_updated_at before update on public.product_documents for each row execute function private.set_updated_at();

alter table public.product_documents enable row level security;

grant select on public.product_documents to anon, authenticated;
grant insert, update, delete on public.product_documents to authenticated;

create policy product_documents_public_read on public.product_documents
for select to anon, authenticated
using (exists (
  select 1 from public.products p
  where p.id = product_id and p.active and p.visibility = 'PUBLIC' and p.archived_at is null
));

create policy product_documents_content_admin_all on public.product_documents
for all to authenticated
using (private.has_admin_role(array['SUPER_ADMIN','ADMIN','CONTENT_MANAGER']::public.admin_role[]))
with check (private.has_admin_role(array['SUPER_ADMIN','ADMIN','CONTENT_MANAGER']::public.admin_role[]));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-documents', 'product-documents', false, 15728640, array['application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy product_documents_object_read on storage.objects
for select to anon, authenticated
using (
  bucket_id = 'product-documents'
  and exists (
    select 1
    from public.product_documents d
    join public.products p on p.id = d.product_id
    where d.storage_path = name
      and p.active and p.visibility = 'PUBLIC' and p.archived_at is null
  )
);

create policy product_documents_admin_objects_all on storage.objects
for all to authenticated
using (
  bucket_id = 'product-documents'
  and private.has_admin_role(array['SUPER_ADMIN','ADMIN','CONTENT_MANAGER']::public.admin_role[])
)
with check (
  bucket_id = 'product-documents'
  and private.has_admin_role(array['SUPER_ADMIN','ADMIN','CONTENT_MANAGER']::public.admin_role[])
);
