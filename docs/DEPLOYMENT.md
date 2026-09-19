# Deployment runbook

## Environments

Use separate local, staging, and production Supabase projects and separate Vercel variable scopes. Preview deployments must never use production credentials. Keep local development unlinked from production.

## Required configuration

Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_SITE_URL` per environment. Add `SUPABASE_SERVICE_ROLE_KEY` only to server-side secrets when privileged operations are deployed. Never prefix it with `NEXT_PUBLIC_`, expose it in browser code, or print it in logs.

## Release gate

```bash
npm ci
npx supabase@latest db reset
npx supabase@latest db lint --local --schema public --level warning --fail-on error
npx supabase@latest gen types typescript --local --schema public > src/lib/supabase/database.types.ts
npm run typecheck
npm run lint
npm run build
```

Database checks require Docker or an ephemeral CI Supabase stack. Fail the release if generated types differ from the committed file.

## Release order

1. Back up the target and confirm restore ownership.
2. Review SQL, locks, constraints, RLS, storage policies, and compatibility.
3. Link the exact target and inspect pending migrations.
4. Apply migrations with `supabase db push`.
5. Deploy the Next.js application.
6. Verify homepage, shop, collections, search, unknown-product 404, and empty cart against zero data.
7. Confirm public roles remain read-only and storage access is scoped.

Never seed business rows during deployment.

## Vercel

- Framework: Next.js
- Runtime: Node.js 22.x
- Install: `npm ci`
- Build: `npm run build`
- Canonical URL: environment-specific `NEXT_PUBLIC_SITE_URL`

The build uses Webpack explicitly because the managed local environment blocks Turbopack helper-process port binding; the output is a standard Next.js deployment.

## Release checks and rollback

Confirm clean migrations, current generated types, RLS/storage negative tests, no production fixtures, draft legal labeling, and viewport/keyboard/reduced-motion checks. Phase 6 must add transactional total/stock validation and idempotent payment handling before checkout is enabled.

Rollback the application to the previous known-good Vercel deployment. Keep migrations backward compatible through the release window; destructive down migrations are not the default recovery mechanism. Restore production data only from reviewed scripts and verified backups.
