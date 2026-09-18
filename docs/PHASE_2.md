# Phase 2 — AIRON visual language

Status: implemented and awaiting visual approval before Phase 3.

## Scope delivered

- Final Phase 2 dark/graphite/metallic token direction.
- Self-hosted Newsreader Variable + Manrope Variable typography.
- Sticky desktop header and mobile header with native modal navigation drawer.
- Full-bleed cinematic hero with intentionally different mobile composition.
- Typed reusable product card and development-only local fixture.
- Editorial Quality / Verification section.
- Large restrained footer with required link groups.
- CSS/IntersectionObserver motion system with reduced-motion fallback.
- Honest empty shop and zero-product production behaviour.

No database, Supabase migration, admin, cart, checkout, payment, or production product data was added.

## Component inventory

- `components/brand/wordmark.tsx`
- `components/icons/site-icons.tsx`
- `components/layout/site-header.tsx`
- `components/layout/site-footer.tsx`
- `components/motion/reveal.tsx`
- `features/catalog/components/product-card.tsx`
- `features/home/components/hero.tsx`
- `features/home/components/product-preview-section.tsx`
- `features/home/components/quality-section.tsx`

## Product fixture boundary

`src/fixtures/product-preview.ts` returns its typed fixture only when `NODE_ENV === "development"`. The production build returns `null`, so the product-preview section is not rendered and no fake price, stock, strength, or product name appears to users. The shop continues to show an intentional empty state.

## Art-direction assets

Generated with the built-in ImageGen tool and copied into the project:

- `public/images/art-direction/airon-hero-art-direction.png`
- `public/images/art-direction/airon-quality-art-direction.png`
- `public/images/art-direction/airon-product-fixture.png`

All three are original, unbranded visual studies with no product names, labels, dosage, claims, or logos.

### Final prompt set

#### Hero

Use case: product-mockup. AIRON premium biotechnology ecommerce homepage hero. Cinematic editorial photography of one unbranded smoked-graphite laboratory vial with a brushed titanium cap on a black mineral plinth in a dark architectural laboratory. Wide landscape framing, product slightly right of centre, negative space left for copy, controlled reflection, precise silver rim light, restrained champagne highlight. No text, logo, watermark, dosage, claims, extra bottles, people, neon, cyberpunk, or blue medical lighting.

#### Quality section

Use case: photorealistic-natural. Close editorial photograph of precision glassware and brushed stainless-steel equipment in a dark quality-control laboratory. Vertical asymmetric composition with negative space, believable borosilicate glass and machined metal, cool-white rim light and restrained warm reflection. No people, labels, branding, medical claims, pills, syringes, neon, hospital aesthetic, or clutter.

#### Product-card fixture

Use case: product-mockup. Development-only square studio packshot of one generic unbranded smoked-glass biotechnology vial with a machined graphite cap on a near-black seamless backdrop. Full bottle visible, centred, precise silver edge light and warm cap highlight. No label, dosage, product name, logo, watermark, packaging, people, medical objects, neon, or blue lighting.

## Responsive decisions

- 375–430px: mobile header, full-screen drawer, image-led hero, full-width CTAs, one-column sections, edge-to-edge product/quality imagery.
- 768–1024px: mobile navigation retained to protect spacing and hierarchy; editorial grids remain simplified.
- 1280px and above: full desktop navigation and multi-column editorial compositions.
- Hero type uses a dedicated mobile scale so `AIRON COLLECTION` remains fully visible at 375px.
- All tested widths render without horizontal document overflow.

## Motion decisions

- Hero image fades/scales into place once; copy enters in a restrained stagger.
- Product and quality images use subtle hover scale only on capable devices.
- Below-the-fold sections use IntersectionObserver reveals.
- Native dialog provides focus containment and Escape handling for the mobile drawer.
- `prefers-reduced-motion` reduces all animation/transition duration and keeps revealed content visible.

## Remaining placeholders

- Typographic `AIRON` wordmark until the final SVG logo is supplied.
- Generated hero, quality, and product-study images until approved photography is supplied.
- Header search/account/cart controls are visually present but disabled until their phases.
- Footer routes remain placeholders until Phase 3 legal/support pages.
- Hero copy and quality copy are editable art-direction copy, not regulatory-approved production claims.

## Assets still needed

- Final AIRON logo SVG and compact/light/dark variants.
- Original reference webshop image mentioned in the brief.
- Approved final colour palette.
- Approved brand/product photography and product packshots.
- Final Open Graph, favicon, and social assets.

## QA result

- TypeScript strict check: passed.
- ESLint: passed.
- Production build: passed.
- Responsive widths: 375, 390, 430, 768, 1024, 1280, 1440, 1920 passed without horizontal overflow.
- Mobile drawer: opens, traps interaction natively, closes by button and Escape, and restores focus.
- Images: loaded at all tested widths with intentional crops.
- Empty shop: visible and coherent at all tested widths.
- Production product fixture exclusion: verified after production build.
