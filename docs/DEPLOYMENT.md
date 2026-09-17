# Deployment runbook

## Environments

Maintain separate local, preview/staging, and production Supabase projects. Never point preview deployments at production data. Scope Vercel environment variables accordingly.

## Build gate

Before deployment:

```bash
npm ci
npm run typecheck
npm run lint
npm run build
```

Later phases add database, unit, integration, E2E, accessibility, and visual tests to this gate.

## Migration order

1. Back up production and confirm restore readiness.
2. Review migration SQL, RLS policies, locks, and backward compatibility.
3. Apply additive/backward-compatible migrations first.
4. Deploy application code.
5. Verify public empty states, admin access, and critical transactions.
6. Remove deprecated fields only in a later deployment after all code stops using them.

No migration may seed products, categories, customers, orders, coupons, batches, or COA documents.

## Vercel configuration

- Framework: Next.js
- Node.js: 22+
- Install: `npm ci`
- Build: `npm run build` (Webpack is selected explicitly because the local managed environment blocks Turbopack's helper-process port binding; the output remains a standard Next.js production build.)
- Configure canonical `NEXT_PUBLIC_SITE_URL` for each environment.
- Keep `SUPABASE_SERVICE_ROLE_KEY`, payment secrets, webhook secrets, and email keys server-only.

## Release checklist

- Final brand assets and fonts are licensed and present.
- Product/legal/regulatory copy is approved for intended markets.
- No placeholder legal tokens or `DRAFT — LEGAL REVIEW REQUIRED` copy can be mistaken for final production terms.
- Supabase RLS/storage policies pass negative tests.
- Admin role revocation takes effect immediately.
- Price, coupon, shipping, tax, stock, and order total are server-validated.
- Payment webhooks verify signatures and are idempotent.
- Empty database and empty cart paths are tested.
- Required viewport, keyboard, screen-reader, reduced-motion, and browser checks pass.
- Sitemap/robots/indexing are enabled only when production content is ready.
- Monitoring, alerting, backup, and incident ownership are assigned.

## Rollback

Application rollback uses the previous known-good Vercel deployment. Database changes must be designed so the previous application version remains compatible during the release window; destructive down migrations are not the primary rollback strategy. Data repair is performed with reviewed scripts and backups, never ad hoc production editing.
