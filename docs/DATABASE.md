# Database proposal

This is a reviewed design proposal for Phase 4, not an applied migration. Initial production row counts for commerce/content tables remain zero.

## General conventions

- UUID primary keys generated in PostgreSQL.
- `timestamptz` timestamps in UTC with `created_at` and `updated_at`.
- Money stored as `bigint` minor units (`price_amount`) plus `char(3)` currency.
- Case-insensitive unique values use `citext` where appropriate (email, coupon code).
- Soft archival is preferred for referenced business records; hard deletion is allowed only when no history depends on the row.
- Enums are used for stable state machines; check constraints are used for bounded numeric values.
- Every foreign key has an intentional `ON DELETE` rule and matching index where queried.

## Identity and roles

### `profiles`

`id` references `auth.users`, plus display name and timestamps. It does not duplicate password or auth secrets.

### `roles`

Stable codes: `SUPER_ADMIN`, `ADMIN`, `ORDERS_MANAGER`, `CONTENT_MANAGER`.

### `user_roles`

Unique `(user_id, role_id)` assignments with `assigned_by` and `created_at`. Bootstrap is performed through a controlled server/SQL process, never an email comparison.

## Catalogue

### `products`

Core fields: `id`, unique `slug`, `name`, `short_name`, `short_description`, `description`, `strength`, `unit`, `price_amount`, optional `compare_at_price_amount`, `currency`, unique `sku`, `stock_quantity`, `stock_status`, `featured`, `active`, `visibility`, `sort_order`, `main_image_path`, timestamps, and optional `archived_at`.

Constraints include non-negative amounts/stock, compare price validity, ISO currency format, and consistency between stock quantity/status. Index public catalogue queries on `(active, visibility, sort_order)`, `featured`, `created_at`, and searchable text. Strength variants remain separate product rows in V1.

### `product_translations`

Unique `(product_id, locale)` with localised name, short name, descriptions, optional localised slug, SEO title, and SEO description. Price, SKU, stock, and status stay on `products`.

### `product_images`

`product_id`, storage path, alt text, width/height, sort order, main flag, timestamps. Enforce only one primary image per product with a partial unique index.

### `categories` and `category_translations`

Category identity, visibility, order, archive state, and localised name/slug/description/SEO content.

### `product_categories`

Unique `(product_id, category_id)` join with optional per-category sort order.

## Quality records

### `product_batches`

`product_id`, batch number, manufactured/test dates, optional purity decimal, active flag, timestamps. Batch number uniqueness is scoped deliberately after operations confirm whether a number can repeat across products.

### `coa_documents`

Optional `product_id` and `batch_id`, private storage path, original filename, MIME type, byte size, checksum, public visibility, status (`ACTIVE`, `ARCHIVED`), version/replacement reference, uploader, timestamps. Public access should use an authorised endpoint or signed URL rather than an open bucket.

## Customers and addresses

### `customers`

Optional `auth_user_id`, normalised email, names, phone only if operationally required, locale, marketing-consent fields only if consent is actually implemented, and timestamps. Guest checkout creates/links records according to a documented deduplication policy.

### `addresses`

Customer reference when saved, address purpose, recipient, lines, city, region, postal code, ISO country code, phone if required, and timestamps. Orders copy immutable address snapshots; historical orders never depend on a mutable saved address.

## Orders and payments

### `orders`

Unique order number, optional customer/auth references, email, locale, currency, subtotal/discount/shipping/tax/total minor units, coupon snapshot, payment/fulfilment/shipping/order statuses, billing/shipping JSON snapshots or dedicated snapshot tables, notes with visibility separation, idempotency key, timestamps.

### `order_items`

Order/product references, immutable SKU/name/strength/unit snapshots, unit price, quantity, line discount/tax/total amounts. Quantity and amounts are constrained non-negative/positive as appropriate.

### `payments`

Order, internal status, provider code, provider transaction reference, amount/currency, idempotency key, safely redacted provider metadata, paid/refunded timestamps. Unique provider event identifiers prevent replay.

### `payment_events`

Optional but recommended for webhook audit/idempotency: provider, unique event ID, event type, verification/processing status, payload hash or redacted payload, timestamps, error. Retention policy must be documented.

## Shipping

### `shipping_zones`

Codes initially support `SERBIA`, `EU`, `INTERNATIONAL`, with active flag and priority. No rates are seeded.

### `shipping_zone_countries`

Maps ISO country codes to zones and prevents ambiguous active assignments.

### `shipping_methods`

Zone reference, code/name, flat rate amount/currency, optional free threshold, active flag, delivery estimate fields, priority, timestamps. Frontend never hardcodes these values.

## Promotions

### `coupons`

Case-insensitive unique code, type (`PERCENTAGE`, `FIXED`), value, currency when fixed, minimum order, starts/expires, usage limit, per-customer limit if adopted, active flag, timestamps. Percentage is bounded; fixed amount is non-negative.

### `coupon_redemptions`

Coupon/order/customer references and redeemed timestamp, supporting transactional usage-limit enforcement.

## Content

### `banners`

Stable placement key, active/scheduling fields, optional asset path/link, priority, timestamps.

### `banner_translations`

Localised eyebrow/title/body/CTA label and accessible image alt text. Keep this narrow; AIRON does not need a full CMS in V1.

## RLS outline

- Enable RLS on every exposed table.
- Anonymous/authenticated public roles may select only active, visible catalogue/content rows and only safe columns/views.
- Customers may access only records explicitly linked to their auth identity; guest order lookup requires a separate secure flow and must not rely on guessable order numbers.
- Admin policies derive permissions from `user_roles`; UI visibility is never the security boundary.
- Service-role use is limited to server-side operational tasks and does not replace normal user-context policies without justification.
- Storage policies separate public marketing/product images from private COA documents.

RLS tests must cover positive and negative cases for anonymous, customer, each admin role, and revoked users.

## Deletion policy

Products referenced by orders are archived, not deleted. Orders, payment records, and item snapshots follow statutory retention rules once known. Unreferenced draft catalogue/content records may be hard-deleted by authorised roles. Customer erasure must distinguish removable profile data from legally required order records.
