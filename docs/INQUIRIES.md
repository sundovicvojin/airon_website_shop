# Contact inquiries

The database is the source of truth; email is only a notification.

## Flow

`submitInquiry` (`src/features/inquiries/actions.ts`) runs the pipeline in `service.ts`:

1. Zod validation (name 2–100, valid email, optional phone, message 10–3000, locale, optional product slug).
2. Honeypot field `website`: if filled, a fake success is returned and nothing is written.
3. Cloudflare Turnstile token verified server-side. Without `TURNSTILE_SECRET_KEY` the check is skipped outside production and **fails closed in production**.
4. Rate limit: SHA-256 of `IP_HASH_SALT:ip`, max 5 inquiries per 60 minutes, counted in `public.inquiries`. The raw IP is never stored. Requests without a detectable IP share one bucket. The IP is read from `x-forwarded-for` / `x-real-ip`, which is trustworthy on Vercel; behind another proxy make sure it sets these headers.
5. The product slug is resolved server-side to `product_id` and a `product_name` snapshot; an unknown slug is ignored.
6. Insert through the service role.
7. Resend notification (REST API, no package). Failures are logged without message content and never change the result the visitor sees.

## Database

Migration `202610120002_inquiries.sql`: `inquiries` table, `inquiry_status` enum, indexes `(status, created_at desc)` and `(ip_hash, created_at)`, RLS enabled. `anon` has no grants. `authenticated` may `select` and update only `status` and `internal_note`, and only through policies that require SUPER_ADMIN, ADMIN or ORDERS_MANAGER. Inserts are possible only with the service role.

## Environment

| Variable | Scope | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | public | Widget is hidden when unset (development only). |
| `TURNSTILE_SECRET_KEY` | server | Required in production. |
| `IP_HASH_SALT` | server | Required in production; keep stable, rotating it resets rate-limit history. |
| `RESEND_API_KEY` | server | Missing: warning logged, inquiry still saved. |
| `INQUIRY_NOTIFY_EMAIL` | server | One address or a comma-separated list. |
| `INQUIRY_FROM_EMAIL` | server | Must belong to a domain verified in Resend. |

## Privacy

Message bodies are never logged. The contact form carries a privacy note marked as a draft until counsel approves the wording. Define a retention period for inquiries before launch.
