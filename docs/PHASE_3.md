# Phase 3 — public storefront

Phase 3 completes the public AIRON experience without starting commerce persistence. It adds all localized customer-facing routes, functional search and cart shells, a reusable product-detail composition, contact validation, policy drafts, and deliberate zero-data states.

## Production behaviour

- Products, collections, prices, stock, orders, customers, coupons, batches, and COA records remain empty.
- The homepage hides the development product preview in production and remains complete through editorial, quality, verification, and CTA sections.
- Shop, search, collections, and cart show honest empty states.
- Unknown product and collection slugs render not-found.
- Contact delivery, account, checkout, and unique-code verification are visibly inactive.
- All legal text is source-marked `DRAFT — LEGAL REVIEW REQUIRED BEFORE PRODUCTION` and retains bracketed company placeholders.

## Deferred

Phase 4+ owns Supabase migrations and RLS, production catalogue queries, Auth and roles, admin, persistent carts, checkout, orders, inventory, COA storage, email, shipping providers, payments, and verification-code logic.
