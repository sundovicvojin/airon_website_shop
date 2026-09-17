# Admin architecture

The admin panel begins in Phase 5 and uses its own functional layout under `/admin`. It is not a cinematic storefront reskin.

## Access model

- Supabase Auth identifies the user.
- `roles` and `user_roles` provide central role assignments.
- Every admin route checks authentication server-side.
- Every mutation checks a named permission server-side; hiding a control is only a usability measure.
- Role mapping: `SUPER_ADMIN`, `ADMIN`, `ORDERS_MANAGER`, `CONTENT_MANAGER`.
- The first super admin is bootstrapped through a controlled operational step, not hardcoded email logic.

## V1 areas

- Dashboard with truthful zero states and no demo charts.
- Products: create, publish, edit, archive, disable, constrained delete, stock, images, categories.
- Orders: searchable table, detail, timeline, approved state transitions, internal notes.
- Customers: minimum operational fields and aggregated order metrics.
- Coupons: validated schedule, type/value, minimum, limits, activation.
- Content: narrow banner/announcement/hero message controls only.
- Batches and COA: upload, link, visibility, replacement/version, archive.

## Product publishing flow

Draft input is validated server-side. Slug and SKU uniqueness, price/compare price, stock/status consistency, image metadata, and category references are checked in one workflow. Publishing invalidates catalogue cache tags so the storefront reflects the change without a code deployment.

## File uploads

Use private/direct upload policies appropriate to the asset type, validate file signature and MIME type, enforce size limits, generate safe names, store metadata/checksums, and never trust a filename extension. COA documents remain private by default.

## Auditability

High-impact actions should record actor, target, action, timestamp, and safe before/after metadata. Never store secrets or full sensitive payloads in audit logs. A dedicated audit table is added only when the exact event and retention requirements are agreed.
