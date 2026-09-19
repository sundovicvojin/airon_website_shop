# Architecture

## Runtime shape

```text
Browser → localized public UI → Next.js Server Components / Route Handlers
                                    ├─ Zod validation
                                    ├─ typed public services
                                    └─ server-only privileged client
                                              ↓
Supabase: PostgreSQL constraints + RLS + Auth roles + private Storage
```

The browser never receives the service-role key and is never authoritative for price, discounts, shipping, stock, or order totals.

## Module boundaries

- `src/app` composes routes and not-found/error states.
- `src/features` owns domain view models and UI.
- `src/lib/supabase/services` is the public catalogue query layer.
- `src/lib/supabase/{client,server,admin}.ts` owns typed clients; `admin.ts` is server-only.
- `src/lib/permissions/admin.ts` centralizes capabilities; authorization never uses email.
- `src/components/ui` remains reusable and commerce-agnostic.

Server Components are the default. Client Components are limited to browser interaction.

## Public data flow

Homepage featured products and collections, shop listing/search/sort, product detail, collection listing/detail, banners, and public COA metadata read through typed services. Services request explicit columns, map rows into stable domain models, sign approved private storage paths, apply deterministic ordering, and return `Result` values that distinguish empty/not-found from failure.

The database is the production source of truth. The Phase 3 visual fixture is used only when `NODE_ENV === "development"` and a real product query is empty.

## Localization and URLs

Localized copy lives in translation tables; commerce facts remain on parent rows. Serbian falls back to English when an SR translation is absent. Slugs are language-neutral in V1.

## Caching

Phase 4 catalogue reads are dynamic and uncached. Search uses `no-store`. Phase 5 may add cache tags once mutations exist, with narrow invalidation for products, categories, and banners. Customer, order, admin, and signed-URL responses must never enter a public cache.

## Commerce invariants

- Money uses integer minor units and an ISO currency code; V1 requires EUR.
- Order items and addresses retain immutable snapshots.
- Public routes never write orders or customer records.
- Phase 6 must recalculate price, coupon, shipping, tax, stock, and totals server-side in one transaction.
- Payment-provider state cannot directly define AIRON order truth.

## Security and testing

External input is validated with Zod. Public errors omit raw provider details. RLS denies access unless explicitly granted; server helpers map capabilities to enum roles.

Testing covers clean migration reset, schema lint, RLS and zero-row behavior, generated types, production build, zero-data routes, keyboard interaction, reduced motion, and the required viewport matrix.
