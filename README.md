# AIRON Commerce

Production-oriented bilingual biotechnology commerce platform built with Next.js 16, React 19, strict TypeScript, and Supabase. Phases 1–5 cover the application foundation, visual language, public storefront, production data layer, and secured admin panel.

The database starts with **zero business data**. Migrations do not seed products, categories, customers, orders, coupons, batches, COA documents, banners, or shipping rules. The public site remains usable when every commerce table is empty.

## Local setup

Requirements: Node.js 22+, npm, Docker Desktop, and Supabase CLI 2.117.0 or compatible.

```bash
npm install
cp .env.example .env.local
npx supabase@latest start
npx supabase@latest db reset
npm run dev
```

Copy the local API URL and anon key reported by `supabase status -o env` into `.env.local`. The service-role key is needed only by privileged server-only code; public catalogue reads use the anon key and RLS.

The storefront is available at `http://localhost:3000/en` and `http://localhost:3000/sr`. A visual product fixture can appear only in development when the real query is empty. Production never falls back to fixture commerce data.

## Database workflow

All schema changes belong in `supabase/migrations/`:

```bash
npx supabase@latest start
npx supabase@latest db reset
npx supabase@latest db lint --local --schema public --level warning --fail-on error
npx supabase@latest gen types typescript --local --schema public > src/lib/supabase/database.types.ts
```

For a remote development or staging project:

```bash
npx supabase@latest login
npx supabase@latest link --project-ref YOUR_PROJECT_REF
npx supabase@latest db push
npx supabase@latest gen types typescript --linked --schema public > src/lib/supabase/database.types.ts
```

Review pending SQL before `db push`. Never link routine local development to production. Production migrations are a separate reviewed release step.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
```

Before merging a schema change, also run a clean database reset, database lint, regenerate types, and verify the zero-data storefront.

## Environment

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public client key, restricted by RLS
- `SUPABASE_SERVICE_ROLE_KEY` — server-only privileged operations; never `NEXT_PUBLIC_`
- `NEXT_PUBLIC_SITE_URL` — canonical URL for the current environment

Payment, email, and analytics variables in `.env.example` are future adapter placeholders, not active integrations.

## Public surface

Every page is localized under `/en` and `/sr`: homepage, shop, product detail, collections, quality, verification, about, contact, cart, and legal/policy drafts. `/api/catalog/search` provides bounded public search through a parameterized database function and public RLS.

Unknown, hidden, draft, inactive, or untranslated product slugs resolve to the same not-found experience and do not leak product data.

## Admin

The admin panel is available at `/admin`. Supabase Auth establishes identity, while database roles control access. See [docs/ADMIN.md](docs/ADMIN.md) for routes, permissions, first-admin bootstrap, publishing, uploads, and cache invalidation.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Database implementation](docs/DATABASE.md)
- [Storage and security](docs/SECURITY_STORAGE.md)
- [Admin operations](docs/ADMIN.md)
- [Deployment runbook](docs/DEPLOYMENT.md)
- [Repository audit](docs/AUDIT.md)
- [Design system](docs/DESIGN_SYSTEM.md)
- [Phase 3 storefront report](docs/PHASE_3.md)

## Current scope

Phase 5 stops after admin content management. Customer accounts, checkout/order creation, payment providers/webhooks, transactional email, loyalty, wishlist, affiliate features, and advanced verification remain intentionally deferred.
