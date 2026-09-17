# Repository audit — Phase 0

Audit date: 18 September 2026

## Executive summary

The workspace was completely empty: no Git metadata, source files, dependencies, configuration, assets, or existing business logic were present. There was therefore nothing to migrate, preserve, or refactor. Phase 1 was started as a clean foundation aligned with the supplied master brief.

The implementation now provides a strict Next.js foundation, but it is intentionally **not** a finished storefront, database, admin panel, or payment system.

## What existed before work began

- Empty directory only.
- No package manifest or lockfile.
- No application routes or design system.
- No Supabase project, schema, migrations, generated types, or credentials.
- No logo, reference image, product imagery, font files, colour palette, or legal/business data.
- No CI, hosting configuration, tests, analytics, payment, email, or shipping integration.

## Phase 1 added

- Next.js App Router, React, strict TypeScript, Tailwind CSS, ESLint, and Zod.
- Localised route foundation for `/en` and `/sr` without a translation widget.
- Central semantic design tokens for colour, type, spacing, containers, borders, radii, focus, and motion.
- Shared button, input, badge, skeleton, container, and empty-state primitives.
- Responsive foundation page and an honest zero-product shop state.
- Lazily validated public/server environment modules.
- Separate browser, server-session, and service-role Supabase clients; privileged modules are server-only.
- Baseline 404 and application error experiences.
- Architecture, database, design, admin, and deployment documentation.
- Exact dependency lockfile and standard quality scripts.

## Important gaps

- No database schema or migration has been applied; this is intentionally deferred to Phase 4.
- No final storefront visual language, header, hero photography, product card, or footer.
- No product queries, search, cart, checkout, order, stock, coupon, shipping, payment, or email logic.
- No Supabase Auth, admin authorisation, dashboard, CRUD, storage, batches, or COA workflows.
- No final legal copy or production SEO/indexing. Root metadata deliberately sets `robots: noindex` during foundation work.
- No automated unit, integration, end-to-end, accessibility, or performance suite yet.
- No preview/staging/production infrastructure.

## Recommended architecture

Use one Next.js application with two explicit surfaces:

1. Public locale routes under `src/app/[locale]`.
2. Protected admin routes under `src/app/admin`, with a separate layout and server-side permission checks.

Domain work belongs in `src/features/<domain>` (catalogue, cart, checkout, orders, admin-products, etc.). Route files compose those modules but do not own business logic. `src/lib` holds infrastructure only: environment parsing, Supabase clients, errors, logging, analytics adapters, and shared validation. Payment, shipping, and email are ports with provider adapters, so core order logic never imports a vendor SDK directly.

Mutations use Server Actions or Route Handlers with validation, central authorisation, database transactions/RPC where atomicity is required, and typed error results. Browser state is limited to transient UI and the guest cart identifier; all trusted totals are computed on the server.

See [ARCHITECTURE.md](ARCHITECTURE.md) for boundaries and flow.

## Proposed folder structure

```text
src/
  app/
    [locale]/
      (storefront)/
      cart/
      checkout/
      products/[slug]/
      shop/
    admin/
    api/
  components/
    ui/
    feedback/
  config/
  features/
    analytics/
    auth/
    catalogue/
    cart/
    checkout/
    orders/
    shipping/
    payments/
    admin/
  i18n/
  lib/
    env/
    errors/
    supabase/
  services/
  types/
supabase/
  migrations/
  tests/
public/
  brand/
  imagery/
docs/
```

Folders are introduced only when a real feature needs them; empty scaffolding is avoided.

## Asset intake still required

- Final AIRON logo in SVG plus light/dark and compact variants if available.
- The referenced visual-direction image; it was not included with the text attachment.
- Approved colour palette with RGB/HEX values and permitted metallic/gold usage.
- Hero and product-family photography at desktop and mobile crops.
- Per-product packshots/galleries and approved alt text, supplied later through admin.
- Final display/body font files and licence/usage confirmation; current stacks are safe fallbacks.
- Social/Open Graph image and final favicon/app icons; the current `A` icon is explicitly a temporary technical placeholder.
- Approved icon style or an instruction to use a minimal open-source set.

## Business information still unknown

- Legal entity, registered address, country, company/VAT numbers, contact and returns addresses.
- Approved legal, privacy, cookie, disclaimer, shipping, and returns language for both locales.
- Product regulatory classification, permitted markets, sale restrictions, age rules, and approved claims.
- Tax/VAT model, price inclusion rules, invoice requirements, rounding, and accounting integration.
- Shipping carriers, service levels, flat rates, free-shipping thresholds, lead times, and restricted destinations.
- Payment provider and confirmed acceptance of the product category; settlement, refund, chargeback, and webhook rules.
- Email provider, sender domain, support contact, and approved transactional copy.
- Production domain, canonical host, analytics consent model, IDs, and cookie categories.
- Admin bootstrap owner and role assignment process.
- Stock reservation window, oversell policy, low-stock threshold, cancellation/refund rules, and order-number format.
- COA public-visibility rules, document retention, acceptable file types/sizes, and archival policy.
- Customer-data retention, deletion, export, and support procedures.

## Development plan

### Phase 1 — Foundation (completed in this pass)

Tooling, strict typing, tokens, base layout, localisation foundation, env validation, Supabase client boundaries, reusable primitives, honest empty/error states, and documentation.

### Phase 2 — AIRON visual language

Approve typography and palette, then implement only the header, hero, one product card, one editorial section, and footer. Validate desktop/mobile composition and reduced motion before expanding.

### Phase 3 — Public storefront

Build database-driven homepage, shop, product detail, search, cart drawer/page, legal drafts, and responsive states. All catalogue sections must disappear or show honest empty states when no products exist.

### Phase 4 — Database

Implement reviewed Supabase migrations, generated types, indexes, constraints, RLS, storage policies, and zero-row tests. Do not seed commerce data.

### Phase 5 — Admin

Add Auth, central RBAC, server-protected admin routes, dashboard, product/category/order/customer/coupon/banner/batch/COA workflows, safe file uploads, and audit-sensitive actions.

### Phase 6 — Commerce

Add persistent guest cart, server revalidation, shipping/coupon calculation, transactional order creation, idempotency, stock handling, provider-neutral payment flow, and confirmation states.

### Phase 7 — Analytics, SEO, and legal

Enable metadata, sitemap, robots, canonical/locale alternates, structured data, consent-aware analytics adapters, ecommerce events, and counsel-approved bilingual legal copy.

### Phase 8 — QA and release

Run responsive/browser/accessibility/performance/security checks, empty-state scenarios, role tests, order invariants, webhook replay/idempotency tests, backups, restore rehearsal, and release sign-off.

## Principal risks and mitigations

| Risk | Consequence | Required mitigation |
| --- | --- | --- |
| Product/regulatory ambiguity | Provider suspension or unlawful sales | Counsel review, country/product gating, approved claims only |
| RLS or admin-role mistake | Private data exposure or unauthorised writes | Deny-by-default policies, server checks, policy tests, separate environments |
| Browser-trusted prices/totals | Order fraud | Re-query products and calculate every total server-side in one transaction |
| Race conditions in stock | Overselling | Atomic reservation/decrement, idempotency key, transaction/RPC |
| Unverified payment webhooks | Forged payment state | Signature verification, event storage, replay protection, state machine |
| Service-role leakage | Full database compromise | `server-only` modules, no public prefix, secret scanning, Vercel scope separation |
| Unsafe uploads | Malware, XSS, private COA exposure | MIME/signature validation, size limits, private buckets, signed URLs, scanning |
| Weak locale/content model | Expensive translation rewrite | Translation tables/JSON policy and locale-aware slugs decided before Phase 4 |
| Legal placeholders reaching production | Compliance failure | Deployment checklist blocks placeholder tokens and unapproved draft copy |
| Analytics without consent | Privacy breach | Consent-aware central adapter; no direct vendor calls in components |
| Dependency drift | Broken builds/security regressions | Lockfile, automated updates, CI checks, reviewed upgrades |

## Audit decision

Proceed with the current modular monolith. It is the simplest architecture that still supports provider substitution, central security, and a database-driven admin/storefront. Do not split services, introduce queues, or add a CMS until real scale or operational needs justify them.
