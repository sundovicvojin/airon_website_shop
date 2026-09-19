-- AIRON Phase 4: future checkout/order architecture. No checkout functions or business rows are created.

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  email extensions.citext not null,
  first_name text not null check (char_length(btrim(first_name)) between 1 and 100),
  last_name text not null check (char_length(btrim(last_name)) between 1 and 100),
  phone text check (phone is null or char_length(btrim(phone)) between 5 and 40),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  first_name text not null check (char_length(btrim(first_name)) between 1 and 100),
  last_name text not null check (char_length(btrim(last_name)) between 1 and 100),
  company text check (company is null or char_length(btrim(company)) <= 160),
  address_line_1 text not null check (char_length(btrim(address_line_1)) between 1 and 200),
  address_line_2 text check (address_line_2 is null or char_length(btrim(address_line_2)) <= 200),
  city text not null check (char_length(btrim(city)) between 1 and 120),
  postal_code text not null check (char_length(btrim(postal_code)) between 1 and 24),
  region text check (region is null or char_length(btrim(region)) <= 120),
  country_code char(2) not null check (country_code ~ '^[A-Z]{2}$'),
  phone text check (phone is null or char_length(btrim(phone)) between 5 and 40),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique check (char_length(btrim(order_number)) between 1 and 48),
  customer_id uuid references public.customers(id) on delete set null,
  email extensions.citext not null,
  currency char(3) not null default 'EUR' check (currency = 'EUR'),
  subtotal_amount bigint not null check (subtotal_amount >= 0),
  discount_amount bigint not null default 0 check (discount_amount >= 0),
  shipping_amount bigint not null default 0 check (shipping_amount >= 0),
  tax_amount bigint not null default 0 check (tax_amount >= 0),
  total_amount bigint not null check (total_amount >= 0),
  order_status public.order_status not null default 'PENDING',
  payment_status public.payment_status not null default 'PENDING',
  fulfillment_status public.fulfillment_status not null default 'UNFULFILLED',
  shipping_status public.shipping_status not null default 'PENDING',
  billing_address_json jsonb not null check (jsonb_typeof(billing_address_json) = 'object'),
  shipping_address_json jsonb check (shipping_address_json is null or jsonb_typeof(shipping_address_json) = 'object'),
  customer_note text check (customer_note is null or char_length(customer_note) <= 2000),
  internal_note text check (internal_note is null or char_length(internal_note) <= 4000),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint orders_discount_limit check (discount_amount <= subtotal_amount),
  constraint orders_total_math check (total_amount = subtotal_amount - discount_amount + shipping_amount + tax_amount),
  constraint orders_shipping_snapshot check (shipping_status = 'NOT_REQUIRED' or shipping_address_json is not null)
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null check (char_length(btrim(product_name)) between 1 and 180),
  product_sku text,
  product_strength text not null check (char_length(btrim(product_strength)) between 1 and 80),
  product_unit text not null check (char_length(btrim(product_unit)) between 1 and 40),
  unit_price_amount bigint not null check (unit_price_amount >= 0),
  quantity integer not null check (quantity > 0),
  line_total_amount bigint not null check (line_total_amount >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  constraint order_items_total_math check (line_total_amount = unit_price_amount * quantity)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  provider text check (provider is null or char_length(btrim(provider)) between 1 and 60),
  provider_payment_id text,
  status public.payment_status not null default 'PENDING',
  amount bigint not null check (amount >= 0),
  currency char(3) not null default 'EUR' check (currency = 'EUR'),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (provider, provider_payment_id)
);

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code extensions.citext not null unique check (char_length(btrim(code::text)) between 1 and 64),
  type public.coupon_type not null,
  value_amount bigint,
  percentage_value numeric(5,2),
  minimum_order_amount bigint check (minimum_order_amount is null or minimum_order_amount >= 0),
  starts_at timestamptz,
  expires_at timestamptz,
  usage_limit integer check (usage_limit is null or usage_limit > 0),
  usage_count integer not null default 0 check (usage_count >= 0),
  active boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint coupons_value_by_type check (
    (type = 'FIXED' and value_amount is not null and value_amount >= 0 and percentage_value is null)
    or
    (type = 'PERCENTAGE' and value_amount is null and percentage_value is not null and percentage_value > 0 and percentage_value <= 100)
  ),
  constraint coupons_schedule check (starts_at is null or expires_at is null or expires_at > starts_at),
  constraint coupons_usage_limit check (usage_limit is null or usage_count <= usage_limit)
);

create table public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete restrict,
  order_id uuid not null references public.orders(id) on delete restrict,
  customer_id uuid references public.customers(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (coupon_id, order_id)
);

create table public.shipping_zones (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z][A-Z0-9_]{1,39}$'),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  active boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.shipping_methods (
  id uuid primary key default gen_random_uuid(),
  shipping_zone_id uuid not null references public.shipping_zones(id) on delete restrict,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  price_amount bigint not null check (price_amount >= 0),
  currency char(3) not null default 'EUR' check (currency = 'EUR'),
  free_shipping_threshold_amount bigint check (free_shipping_threshold_amount is null or free_shipping_threshold_amount >= 0),
  active boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index customers_email_idx on public.customers(email);
create index addresses_customer_idx on public.addresses(customer_id, created_at desc) where customer_id is not null;
create index orders_customer_idx on public.orders(customer_id, created_at desc) where customer_id is not null;
create index orders_email_created_idx on public.orders(email, created_at desc);
create index orders_created_at_idx on public.orders(created_at desc);
create index orders_status_idx on public.orders(order_status, created_at desc);
create index orders_payment_status_idx on public.orders(payment_status, created_at desc);
create index order_items_order_idx on public.order_items(order_id, created_at);
create index order_items_product_idx on public.order_items(product_id) where product_id is not null;
create index payments_order_idx on public.payments(order_id, created_at desc);
create index coupon_redemptions_customer_idx on public.coupon_redemptions(customer_id, created_at desc) where customer_id is not null;
create index shipping_methods_zone_idx on public.shipping_methods(shipping_zone_id, active, sort_order);

create trigger customers_set_updated_at before update on public.customers for each row execute function private.set_updated_at();
create trigger addresses_set_updated_at before update on public.addresses for each row execute function private.set_updated_at();
create trigger orders_set_updated_at before update on public.orders for each row execute function private.set_updated_at();
create trigger payments_set_updated_at before update on public.payments for each row execute function private.set_updated_at();
create trigger coupons_set_updated_at before update on public.coupons for each row execute function private.set_updated_at();
create trigger shipping_zones_set_updated_at before update on public.shipping_zones for each row execute function private.set_updated_at();
create trigger shipping_methods_set_updated_at before update on public.shipping_methods for each row execute function private.set_updated_at();

comment on column public.orders.billing_address_json is 'Immutable checkout snapshot; never joined back to mutable saved addresses.';
comment on column public.orders.shipping_address_json is 'Immutable checkout snapshot; never joined back to mutable saved addresses.';
comment on table public.order_items is 'Immutable product and price snapshots. product_id is optional for historical retention.';
