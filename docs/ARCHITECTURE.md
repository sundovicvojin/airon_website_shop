# Architecture

## Shape

AIRON is a modular Next.js application deployed to Vercel with Supabase providing PostgreSQL, Auth, and Storage. The browser never receives the service-role key and never becomes the authority for commerce values.

```text
Browser
  ├─ public Server Components ── read public catalogue/content under RLS
  ├─ client interaction ──────── cart UI, menus, forms
  └─ mutations ──────────────── Server Actions / Route Handlers
                                      │
                                      ├─ validate input
                                      ├─ authenticate + authorise
                                      ├─ re-read trusted data
                                      ├─ transact in PostgreSQL
                                      └─ call provider adapter
```

## Module boundaries

- **Routes** choose locale, compose features, and define metadata/loading/error states.
- **Features** own domain-specific UI, schemas, queries, actions, and tests.
- **Services/ports** define payment, shipping, email, analytics, and storage contracts.
- **Adapters** translate a selected provider into a port without leaking vendor types into domain logic.
- **Lib** owns environment parsing, Supabase construction, errors, logging, and low-level helpers.
- **UI components** have no catalogue/order knowledge.

## Rendering policy

- Server Components are the default for catalogue, product, content, and admin reads.
- Client Components are limited to menus, drawers, cart interaction, form affordances, and animation.
- Public product pages are server-rendered with explicit cache/revalidation rules after the schema exists.
- Privileged admin reads and all sensitive mutations execute server-side.

## Phase 3 public storefront boundaries

- Route pages and editorial content remain Server Components.
- `SearchDialog`, `CartDrawer`, `ShopControls`, `ContactForm`, `ProductDetail`, and progressive reveal behaviour are the only client-side interaction boundaries.
- Search accepts local UI input and renders an honest empty result. A future catalogue search adapter can replace the empty collection without changing the dialog.
- Cart types and views model a zero-item public shell only. The drawer and `/cart` route do not persist state, fabricate line items, or create orders.
- Product and collection dynamic routes are ready for Phase 4 queries. Unknown slugs call `notFound()`; production exposes no fixture route.
- Contact input is validated with Zod in the browser, then explicitly reports that delivery is inactive. No message is transmitted or stored.

## Development fixture rule

The visual product fixture is returned only when `NODE_ENV === "development"`. It can exercise both the product card and product-detail composition locally. Production catalogue output remains empty and must never fall back to this fixture.

## Public route surface

Localized routes cover the homepage, shop, products, collections, quality, verification, about, contact, cart, and six legal/policy drafts. Shared locale layout owns header/footer controls and typed dictionaries; route-specific loading, error, empty, and not-found states preserve the AIRON visual system.

## Locale policy

Public URLs use `/en/...` and `/sr/...`; English is the default. UI copy lives in typed dictionaries. Database-authored content requires a translation policy before Phase 4; the recommended model is separate translation tables for products/categories/content so missing translations can fall back predictably without duplicating commerce facts such as price or stock.

Admin routes remain locale-neutral in V1 unless operator requirements demand otherwise.

## Commerce invariants

- Store money as integer minor units plus ISO currency code, never floating-point values.
- The order stores immutable item snapshots (name, SKU, strength, unit price, tax data) alongside product references.
- Totals are calculated server-side from current trusted rows.
- Stock changes and order creation are atomic and idempotent.
- Status changes follow explicit state machines; arbitrary strings are not accepted.
- Payment providers cannot directly define AIRON order truth; verified events are translated into internal payment states.

## Caching

Catalogue reads may use tag-based revalidation once admin publishing exists. Admin mutations invalidate only affected tags. Cart, checkout, account, and admin data are dynamic and private. No response containing customer/order data is placed in a public cache.

## Observability

Use structured server logs with request/order/payment correlation IDs and redacted context. Track failures without logging secrets, full addresses, payment material, or COA private URLs. Error reporting and uptime monitoring are release requirements, but no vendor is selected yet.

## Testing strategy

- Unit: validators, money, totals, coupons, shipping, permissions, state transitions.
- Database: constraints, functions, RLS policies, zero-row behaviour.
- Integration: order transaction, storage rules, auth bootstrap, payment webhook idempotency.
- E2E: empty shop/cart, guest checkout, admin product publish, stock change, permission denial.
- Visual/accessibility: required viewport matrix, keyboard flows, contrast, reduced motion.
