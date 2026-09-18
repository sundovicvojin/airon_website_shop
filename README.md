# AIRON Commerce

Production-oriented foundation and approved visual-language study for AIRON, a premium bilingual biotechnology commerce platform. The repository currently contains **Phase 1 and Phase 2 only**: application foundations plus the header, cinematic hero, development-only product-card study, quality section, footer, responsive system, and restrained motion language.

No products, categories, customers, orders, coupons, batches, or COA documents are seeded or hardcoded.

## Stack

- Next.js 16 App Router and React 19
- TypeScript in strict mode
- Tailwind CSS 4 with CSS design tokens
- Supabase SSR and Supabase JS clients
- Zod environment validation
- English and Serbian route/dictionary foundation
- Self-hosted Newsreader Variable and Manrope Variable fonts

## Local setup

Requirements: Node.js 22 or newer and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

The visual foundation is available at `http://localhost:3000/en` and `http://localhost:3000/sr`. Supabase values can remain empty while viewing the Phase 1 pages because clients are created lazily only where data access is needed.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
```

All three checks must pass before merging.

## Environment

Copy `.env.example` to `.env.local`. Public keys may be used by browser clients; the service-role key must never be exposed through a `NEXT_PUBLIC_` variable or imported into a Client Component.

Required once Supabase-backed features are enabled:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — server-side privileged tasks only
- `NEXT_PUBLIC_SITE_URL`

Payment, email, and analytics entries are reserved placeholders. They do not represent active integrations.

## Supabase setup

Database migrations intentionally begin in Phase 4. At that point:

1. Create separate development, staging, and production Supabase projects.
2. Link the local project with the Supabase CLI.
3. Apply reviewed migrations from `supabase/migrations`.
4. Generate TypeScript database types after every schema change.
5. Configure storage buckets and RLS policies before uploading assets.
6. Create the first administrator through a controlled bootstrap process; never by matching an email address in application code.

The planned data model and access boundaries are in [docs/DATABASE.md](docs/DATABASE.md).

## Deployment

The intended host is Vercel. Configure environment variables separately for preview and production, run all checks in CI, apply migrations before deploying code that depends on them, and validate the empty-database path after deployment. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Documentation

- [Repository audit](docs/AUDIT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database proposal](docs/DATABASE.md)
- [Design system](docs/DESIGN_SYSTEM.md)
- [Admin plan](docs/ADMIN.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Phase 2 visual-language report](docs/PHASE_2.md)

## Current scope

Phase 2 is not a finished storefront and deliberately stops before catalogue/database integration. Product preview data is returned only when `NODE_ENV === "development"`; production renders no product card or fabricated commerce values. Phase 3 requires explicit approval.
