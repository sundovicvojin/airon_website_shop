# AIRON design system direction

## Principle

**Luxury science**: editorial scale and restraint combined with laboratory precision. The interface should feel deliberate, quiet, and material—not medical, cyberpunk, dashboard-like, or template-driven.

## Final Phase 2 token direction

- Canvas: near-black `#070707`
- Surfaces: `#0D0D0D`, `#141414`, `#191919`
- Primary ink: warm off-white `#F3F1EB`
- Muted ink: neutral warm greys
- Lines: precise graphite hairlines
- Accent: restrained muted metal `#C6B486`; final use requires palette approval
- Status colours: desaturated green/amber/red, always paired with text or icon meaning

These values establish the approved Phase 2 direction and remain centralised in `src/app/globals.css`, allowing the final supplied brand palette to replace them without component rewrites.

## Typography

Implemented pairing:

- Display/editorial serif: **Newsreader Variable** (OFL), chosen for a refined editorial voice, optical contrast, and excellent large-scale composition without fashion-brand imitation.
- Body/UI sans: **Manrope Variable** (OFL), chosen for neutral geometry, clear compact labels, Latin Extended/Serbian coverage, and strong UI legibility.

Both fonts are self-hosted from locked npm packages, so production rendering has no Google CDN dependency. Display text uses low variable weights with tight optical tracking; UI labels use compact uppercase sans with wider tracking.

## Layout

- Page maximum: 1792px (`112rem`)
- Content maximum: 1344px (`84rem`)
- Reading maximum: 736px (`46rem`)
- Fluid outer gutter: 16–56px
- Grid direction: 12 columns on wide desktop, 8 on tablet, 4 on mobile, introduced when Phase 2 compositions are approved
- Vertical rhythm uses a small token scale and generous section spacing rather than card padding everywhere

## Shape and borders

- One-pixel graphite rules provide structure.
- Radius scale is 2/4/8/12px; default controls use 4px.
- Large rounded cards and pill-heavy UI are avoided.
- Elevation comes primarily from contrast, image/light composition, and borders—not diffuse shadows or glass panels.

## Components

- Primary button: compact, rectangular metallic accent, clear active/focus/disabled states.
- Secondary button: transparent, precise border, restrained surface hover.
- Inputs: 48px minimum height, persistent labels, explicit errors, no placeholder-only labelling.
- Product cards: image-dominant; content and CTA hierarchy must work without hover.
- Dialogs/drawers: focus-trapped, escapable, labelled, scroll-safe, and reduced-motion aware.
- Tables: dense admin-specific component set, separate from cinematic storefront styles.
- Empty/loading/error states: honest, calm, and action-oriented; no fabricated content.

## Motion

Target intensity is 6/10. Phase 2 uses CSS entrance/scale transitions and a progressive-enhancement IntersectionObserver reveal. GSAP was intentionally not added because the approved interactions do not require timeline orchestration. All motion respects `prefers-reduced-motion`, never hijacks scroll, and keeps content visible when JavaScript is unavailable.

## Responsive intent

Mobile is composed separately: shorter lines, image-first products, thumb-safe 44px controls, simplified navigation, safe-area-aware drawers, and sticky purchase action only where it does not obscure content. Required review widths: 375, 390, 430, 768, 1024, 1280, 1440, and 1920px.

## Accessibility baseline

Semantic elements, visible focus, sufficient contrast, explicit form labels, keyboard-operable menus/dialogs, meaningful alt text, and non-colour status cues are mandatory. ARIA supplements native HTML; it does not replace it.
