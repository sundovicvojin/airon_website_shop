# Database implementation

The versioned Supabase schema is implemented by five ordered migrations. A clean reset creates infrastructure only; all commerce/content row counts remain zero.

## Migrations

1. `202609190001_foundation.sql` — extensions, private schema, enums, shared timestamp trigger.
2. `202609190002_identity_catalog_content.sql` — identity, catalogue, translations, batches, COA, banners, indexes, auth/profile trigger, role helper, and public search.
3. `202609190003_commerce_architecture.sql` — customers, addresses, orders, snapshots, payments, coupons, and shipping.
4. `202609190004_rls.sql` — grants and deny-by-default RLS policies for every application table.
5. `202609190005_storage.sql` — controlled buckets, limits, MIME restrictions, and object policies.

## Enums

- `product_stock_status`: `IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`, `DISABLED`
- `product_visibility`: `PUBLIC`, `HIDDEN`, `DRAFT`
- `order_status`: `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`
- `payment_status`: `PENDING`, `AUTHORIZED`, `PAID`, `FAILED`, `REFUNDED`, `PARTIALLY_REFUNDED`, `CANCELLED`
- `fulfillment_status`: `UNFULFILLED`, `PROCESSING`, `FULFILLED`, `CANCELLED`
- `shipping_status`: `NOT_REQUIRED`, `PENDING`, `READY`, `SHIPPED`, `DELIVERED`, `RETURNED`, `CANCELLED`
- `coupon_type`: `PERCENTAGE`, `FIXED`
- `admin_role`: `SUPER_ADMIN`, `ADMIN`, `ORDERS_MANAGER`, `CONTENT_MANAGER`

## Tables and relationships

Identity uses `profiles` (1:1 with `auth.users`), `roles`, and `user_roles`. Role records are intentionally not seeded; Phase 5 needs a controlled bootstrap.

Catalogue/content uses `products`, `product_translations`, `product_specifications`, `product_specification_translations`, `product_images`, `categories`, `category_translations`, `product_categories`, `product_batches`, `coa_documents`, `banners`, and `banner_translations`. Strength variants are independent products. A composite COA foreign key ensures a selected batch belongs to the same product.

Commerce preparation uses `customers`, `addresses`, `orders`, `order_items`, `payments`, `coupons`, `coupon_redemptions`, `shipping_zones`, and `shipping_methods`. Guest customers are supported through nullable auth references. Orders retain address JSON snapshots; order items retain product name/SKU/strength/unit/price snapshots even if the product reference later becomes null.

## Constraints

- UUID primary keys and UTC `timestamptz` are consistent throughout.
- Product slug is language-neutral and unique; optional SKU is case-insensitively unique.
- Prices, stock, quantities, file sizes, sort values, percentages, and totals are range checked.
- Compare price must exceed price; stock status and quantity cannot contradict one another.
- Orders enforce `subtotal - discount + shipping + tax = total`.
- Coupon checks make percentage and fixed configurations mutually valid.
- Translation locales are constrained to `en` and `sr` and unique per parent.
- A partial unique index allows at most one primary image per product.
- Batch number is unique per product.
- One reusable trigger maintains `updated_at`.

## Money and translations

Money is `bigint` minor units plus uppercase ISO currency: `6900` means EUR 69.00. Catalogue, coupons, shipping, orders, items, and payments never use floating point. V1 requires EUR.

Localized copy is normalized into translation tables. Price, SKU, stock, visibility, and other business facts exist once on parent rows. Public services select the requested locale and fall back from Serbian to English. Slugs remain language-neutral.

## Indexes

Partial indexes match active/public and featured catalogue reads. Supporting indexes cover translations, ordered images/specifications, category joins, batches, public COA, scheduled banners, role membership, customer/order history, order/payment statuses, coupon redemption, and shipping methods. Unique constraints already index slugs, SKU, order number, email, coupon code, and provider identifiers.

## Deletion and archival

Referenced products/categories/content should be hidden or archived rather than casually deleted. Product/customer references from historical orders are nullable while snapshots preserve history. Order children cascade only with deliberate order deletion; operational retention rules must be approved before a production deletion workflow. Translation, image, and join rows cascade with their catalogue parent. COA replacement is versioned by an optional self-reference.

## RLS and public/private access

RLS is enabled on all 24 application tables. Public reads see only active, public, non-archived catalogue rows and related safe records. Public COA additionally requires `public_visible` and `active`, plus a public parent product. Public roles have no write grant to products or protected commerce tables.

Authenticated customers may read only records linked to their auth identity. Content roles manage catalogue/content; order roles manage commerce tables; admin roles cover profiles and assignments. `private.has_admin_role()` is a minimal `SECURITY DEFINER` helper with locked empty `search_path`, schema-qualified objects, and no broad public grant.

`search_public_products` is parameterized, bounded to 20 results, executes with caller permissions, and repeats active/public/archive predicates.

## Phase 5 integration

Phase 5 can add admin CRUD without redesigning storefront routes. It must add a controlled first-role bootstrap, validate uploads server-side, write translations and relationships transactionally, and invalidate future catalogue cache tags. UI visibility is convenience only; RLS and server permission helpers remain authoritative.
