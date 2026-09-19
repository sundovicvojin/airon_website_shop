-- AIRON Phase 4: extensions, stable enums, and shared database functions.
create extension if not exists pgcrypto with schema extensions;
create extension if not exists citext with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.product_stock_status as enum ('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'DISABLED');
create type public.product_visibility as enum ('PUBLIC', 'HIDDEN', 'DRAFT');
create type public.order_status as enum ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
create type public.payment_status as enum ('PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'CANCELLED');
create type public.fulfillment_status as enum ('UNFULFILLED', 'PROCESSING', 'FULFILLED', 'CANCELLED');
create type public.shipping_status as enum ('NOT_REQUIRED', 'PENDING', 'READY', 'SHIPPED', 'DELIVERED', 'RETURNED', 'CANCELLED');
create type public.coupon_type as enum ('PERCENTAGE', 'FIXED');
create type public.admin_role as enum ('SUPER_ADMIN', 'ADMIN', 'ORDERS_MANAGER', 'CONTENT_MANAGER');

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

comment on function private.set_updated_at() is
  'Shared trigger function for consistent UTC updated_at values.';
