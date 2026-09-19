# Security and storage

## Access model

RLS is the primary database boundary. Public clients receive only the anon key. The service-role client is in a `server-only` module and is reserved for narrowly scoped privileged operations; it bypasses RLS and must never be used for public catalogue reads.

Admin authorization derives from `user_roles` and enum role codes. Capability helpers centralize intended mappings while RLS independently enforces access. No email address grants authority.

## Buckets

All buckets are private and use controlled delivery:

- `product-images`: AVIF, WebP, PNG, or JPEG; maximum 8 MB.
- `banners`: AVIF, WebP, PNG, or JPEG; maximum 8 MB.
- `coa`: PDF only; maximum 15 MB.

Object policies require a matching active database row. Product/banner images are readable only while parent content is public and active. A COA additionally requires `active`, explicit `public_visible`, and a public parent product. Services return short-lived signed URLs instead of exposing buckets broadly.

## Path conventions

- `products/{product_id}/main-{uuid}.webp`
- `products/{product_id}/gallery/{uuid}.webp`
- `banners/{banner_id}/{uuid}.webp`
- `coa/{product_id}/{batch_id-or-general}/{uuid}.pdf`

Generate identifiers server-side and retain the original filename only as metadata. Never use an untrusted filename as the unique path.

## Phase 5 upload validation

Validate authentication, capability, ownership, extension, declared MIME, detected signature, byte size, image dimensions or PDF properties, and generated destination path on the server. Re-encode images where practical, reject active content, and scan PDFs according to the selected production process before publication.

## Reviewed properties

- All 24 application tables have RLS enabled.
- Anonymous product SELECT is policy-limited; anonymous product INSERT is not granted.
- Protected commerce/customer tables have no broad public write path.
- Search is parameterized and bounded.
- The role helper locks `search_path` and schema-qualifies references.
- Private COA objects require database visibility and storage-policy approval.
- Public services select explicit columns and omit internal notes, customer data, payment metadata, and roles.
