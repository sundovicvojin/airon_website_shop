# AIRON repository guidance

## Product invariants

- Brand name is always **AIRON**.
- Production data starts empty. Never seed or hardcode products, categories, prices, stock, customers, orders, coupons, batches, or COA documents.
- The public storefront must render safely when every commerce table is empty.
- EUR is the V1 display and order currency, but monetary values belong to validated server/database data.
- Never make medical, disease-treatment, regulatory, or jurisdiction-wide legality claims.
- Legal copy remains marked as draft until counsel approves it.

## Engineering rules

- Keep TypeScript strict and avoid `any`.
- Default to Server Components. Use Client Components only for browser state or interaction.
- Validate all external input with Zod or an equivalent explicit schema.
- Recalculate price, discounts, shipping, stock, and totals server-side before creating an order.
- Keep service-role credentials in server-only modules.
- Centralise roles and permissions; never authorise administrators by email address.
- Add database changes through reviewed migrations and RLS policies.
- Prefer small feature modules over oversized route files or speculative abstractions.

## Required verification

Run `npm run typecheck`, `npm run lint`, and `npm run build` after meaningful changes. For visual work, check at least 375, 390, 430, 768, 1024, 1280, 1440, and 1920 pixels, plus reduced-motion and keyboard interaction.

## Source layout

- `src/app`: routes, layouts, route-level loading/error states
- `src/components/ui`: reusable visual primitives only
- `src/features`: domain-specific UI and server actions (introduced per phase)
- `src/lib`: infrastructure, validation, errors, Supabase clients
- `src/config`: stable application configuration
- `src/i18n`: locale configuration and dictionaries
- `supabase`: migrations, policies, and generated database types (Phase 4)
- `docs`: decisions, runbooks, and architecture

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
