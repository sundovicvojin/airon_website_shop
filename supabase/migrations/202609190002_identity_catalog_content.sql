-- AIRON Phase 4: identity foundation, catalogue, translations, quality records, and banners.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (display_name is null or char_length(btrim(display_name)) between 1 and 120),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  code public.admin_role not null unique,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete restrict,
  assigned_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, role_id)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  strength text not null check (char_length(btrim(strength)) between 1 and 80),
  unit text not null check (char_length(btrim(unit)) between 1 and 40),
  sku extensions.citext unique check (sku is null or char_length(btrim(sku::text)) between 1 and 80),
  price_amount bigint not null check (price_amount >= 0),
  compare_at_price_amount bigint check (compare_at_price_amount is null or compare_at_price_amount > price_amount),
  currency char(3) not null default 'EUR' check (currency = 'EUR'),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  stock_status public.product_stock_status not null default 'DISABLED',
  visibility public.product_visibility not null default 'DRAFT',
  featured boolean not null default false,
  active boolean not null default false,
  sort_order integer not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint products_stock_consistency check (
    stock_status = 'DISABLED'
    or (stock_status = 'OUT_OF_STOCK' and stock_quantity = 0)
    or (stock_status in ('IN_STOCK', 'LOW_STOCK') and stock_quantity > 0)
  ),
  constraint products_archive_consistency check (archived_at is null or (active = false and visibility <> 'PUBLIC'))
);

create table public.product_translations (
  product_id uuid not null references public.products(id) on delete cascade,
  locale text not null check (locale in ('en', 'sr')),
  name text not null check (char_length(btrim(name)) between 1 and 180),
  short_name text check (short_name is null or char_length(btrim(short_name)) between 1 and 100),
  short_description text check (short_description is null or char_length(btrim(short_description)) <= 500),
  description text,
  storage_information text,
  shipping_information text,
  disclaimer text,
  seo_title text check (seo_title is null or char_length(seo_title) <= 70),
  seo_description text check (seo_description is null or char_length(seo_description) <= 180),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (product_id, locale)
);

create table public.product_specifications (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  code text not null check (code ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'),
  value text not null check (char_length(btrim(value)) between 1 and 240),
  unit text check (unit is null or char_length(btrim(unit)) <= 40),
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (product_id, code)
);

create table public.product_specification_translations (
  specification_id uuid not null references public.product_specifications(id) on delete cascade,
  locale text not null check (locale in ('en', 'sr')),
  label text not null check (char_length(btrim(label)) between 1 and 120),
  value_override text check (value_override is null or char_length(btrim(value_override)) <= 240),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (specification_id, locale)
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null unique check (storage_path ~ '^products/[0-9a-f-]{36}/(main|gallery/[0-9a-f-]{36})\.(avif|webp|png|jpe?g)$'),
  alt_text text not null check (char_length(btrim(alt_text)) between 1 and 240),
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  active boolean not null default false,
  sort_order integer not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint categories_archive_consistency check (archived_at is null or active = false)
);

create table public.category_translations (
  category_id uuid not null references public.categories(id) on delete cascade,
  locale text not null check (locale in ('en', 'sr')),
  name text not null check (char_length(btrim(name)) between 1 and 140),
  description text,
  seo_title text check (seo_title is null or char_length(seo_title) <= 70),
  seo_description text check (seo_description is null or char_length(seo_description) <= 180),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (category_id, locale)
);

create table public.product_categories (
  product_id uuid not null references public.products(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (product_id, category_id)
);

create table public.product_batches (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  batch_number text not null check (char_length(btrim(batch_number)) between 1 and 100),
  manufactured_at date,
  test_date date,
  purity numeric(6,3) check (purity is null or (purity >= 0 and purity <= 100)),
  active boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (product_id, batch_number),
  unique (id, product_id),
  constraint product_batches_date_order check (manufactured_at is null or test_date is null or test_date >= manufactured_at)
);

create table public.coa_documents (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  batch_id uuid,
  title text not null check (char_length(btrim(title)) between 1 and 180),
  storage_path text not null unique check (storage_path ~ '^coa/[0-9a-f-]{36}/([0-9a-f-]{36}|unassigned)/[0-9a-f-]{36}\.pdf$'),
  public_visible boolean not null default false,
  active boolean not null default false,
  uploaded_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  foreign key (batch_id, product_id) references public.product_batches(id, product_id) on delete restrict
);

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  image_path text unique check (image_path is null or image_path ~ '^banners/[0-9a-f-]{36}/[0-9a-f-]{36}\.(avif|webp|png|jpe?g)$'),
  cta_href text check (cta_href is null or cta_href ~ '^/'),
  active boolean not null default false,
  sort_order integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint banners_schedule check (starts_at is null or ends_at is null or ends_at > starts_at)
);

create table public.banner_translations (
  banner_id uuid not null references public.banners(id) on delete cascade,
  locale text not null check (locale in ('en', 'sr')),
  eyebrow text,
  title text not null check (char_length(btrim(title)) between 1 and 180),
  body text,
  cta_label text,
  image_alt text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (banner_id, locale)
);

create unique index product_images_one_primary_per_product on public.product_images(product_id) where is_primary;
create index products_public_listing_idx on public.products(sort_order, created_at desc) where active and visibility = 'PUBLIC' and archived_at is null;
create index products_featured_public_idx on public.products(sort_order, created_at desc) where active and visibility = 'PUBLIC' and featured and archived_at is null;
create index products_created_at_idx on public.products(created_at desc);
create index product_translations_locale_name_idx on public.product_translations(locale, name);
create index product_specifications_product_idx on public.product_specifications(product_id, sort_order);
create index product_images_product_sort_idx on public.product_images(product_id, is_primary desc, sort_order);
create index categories_public_idx on public.categories(sort_order, created_at) where active and archived_at is null;
create index product_categories_category_idx on public.product_categories(category_id, sort_order, product_id);
create index product_batches_product_idx on public.product_batches(product_id, active, created_at desc);
create index coa_documents_product_idx on public.coa_documents(product_id, public_visible, active);
create index coa_documents_batch_idx on public.coa_documents(batch_id) where batch_id is not null;
create index banners_public_schedule_idx on public.banners(sort_order, starts_at, ends_at) where active;
create index user_roles_role_idx on public.user_roles(role_id, user_id);

create trigger profiles_set_updated_at before update on public.profiles for each row execute function private.set_updated_at();
create trigger roles_set_updated_at before update on public.roles for each row execute function private.set_updated_at();
create trigger products_set_updated_at before update on public.products for each row execute function private.set_updated_at();
create trigger product_translations_set_updated_at before update on public.product_translations for each row execute function private.set_updated_at();
create trigger product_specifications_set_updated_at before update on public.product_specifications for each row execute function private.set_updated_at();
create trigger product_specification_translations_set_updated_at before update on public.product_specification_translations for each row execute function private.set_updated_at();
create trigger product_images_set_updated_at before update on public.product_images for each row execute function private.set_updated_at();
create trigger categories_set_updated_at before update on public.categories for each row execute function private.set_updated_at();
create trigger category_translations_set_updated_at before update on public.category_translations for each row execute function private.set_updated_at();
create trigger product_batches_set_updated_at before update on public.product_batches for each row execute function private.set_updated_at();
create trigger coa_documents_set_updated_at before update on public.coa_documents for each row execute function private.set_updated_at();
create trigger banners_set_updated_at before update on public.banners for each row execute function private.set_updated_at();
create trigger banner_translations_set_updated_at before update on public.banner_translations for each row execute function private.set_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

create or replace function private.has_admin_role(required_roles public.admin_role[] default null)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and (required_roles is null or r.code = any(required_roles))
  );
$$;

revoke all on function private.has_admin_role(public.admin_role[]) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.has_admin_role(public.admin_role[]) to authenticated;

comment on function private.has_admin_role(public.admin_role[]) is
  'Minimal SECURITY DEFINER role lookup. Fixed empty search_path and fully-qualified objects prevent search-path injection.';

create or replace function public.search_public_products(
  search_term text,
  requested_locale text default 'en',
  result_limit integer default 12
)
returns table (
  id uuid,
  slug text,
  name text,
  short_name text,
  strength text,
  unit text,
  sku text,
  price_amount bigint,
  compare_at_price_amount bigint,
  currency char(3),
  stock_status public.product_stock_status,
  featured boolean,
  image_path text,
  image_alt text
)
language sql
stable
set search_path = ''
as $$
  select
    p.id,
    p.slug,
    t.name,
    t.short_name,
    p.strength,
    p.unit,
    p.sku::text,
    p.price_amount,
    p.compare_at_price_amount,
    p.currency,
    p.stock_status,
    p.featured,
    image.storage_path,
    image.alt_text
  from public.products p
  join lateral (
    select pt.name, pt.short_name
    from public.product_translations pt
    where pt.product_id = p.id and pt.locale in (requested_locale, 'en')
    order by case when pt.locale = requested_locale then 0 else 1 end
    limit 1
  ) t on true
  left join lateral (
    select pi.storage_path, pi.alt_text
    from public.product_images pi
    where pi.product_id = p.id
    order by pi.is_primary desc, pi.sort_order, pi.created_at
    limit 1
  ) image on true
  where p.active and p.visibility = 'PUBLIC' and p.archived_at is null
    and char_length(btrim(search_term)) >= 2
    and (
      t.name ilike '%' || btrim(search_term) || '%'
      or coalesce(t.short_name, '') ilike '%' || btrim(search_term) || '%'
      or coalesce(p.sku::text, '') ilike '%' || btrim(search_term) || '%'
      or p.strength ilike '%' || btrim(search_term) || '%'
    )
  order by p.featured desc, p.sort_order, p.created_at desc
  limit least(greatest(result_limit, 1), 24);
$$;

revoke all on function public.search_public_products(text, text, integer) from public;
