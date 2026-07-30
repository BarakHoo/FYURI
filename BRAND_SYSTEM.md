# FYURI brand system

## Core idea: Split Aperture

The identity turns paired optical channels into a single converging `Y` light path. It references night-vision optics without drawing a literal owl, eye, scope, reticle, or binocular. The small lime datum is the calibration signature.

The unusual `FYURI` name remains the hero. Its custom monoline wordmark uses wide technical proportions and restrained terminal cuts, matching the site's instrument-panel typography without becoming a military stencil.

## Production lockups

| Asset | Use |
| --- | --- |
| `fyuri-lockup-on-dark.svg` | Public header, footer, and other dark surfaces |
| `fyuri-lockup-on-light.svg` | Light drawer, documents, and pale surfaces |
| `fyuri-lockup-mono.svg` | Single-ink printing, engraving, and vendor handoff |
| `fyuri-mark-on-dark.svg` | Compact mark on dark surfaces |
| `fyuri-mark-on-light.svg` | Compact mark on light surfaces |
| `fyuri-mark-mono.svg` | Single-ink compact mark |
| `favicon.svg` and PNG/ICO exports | Browser and installed-app identity |

All web brand assets live under `/brand`, outside the backend-managed `/images` volume.

## Color

- Night ink: `#02070C`
- Deep surface: `#07111B`
- Off-white: `#EDF9FF`
- Optical cyan: `#4FC3F7`
- Signal lime: `#B8FF3D`
- Light-surface cyan: `#0D5F8A`
- Light-surface datum: `#2D6500`

The mark must work in one color. Lime is a datum, not a fill color, and should remain below five percent of the lockup.

## Placement

- Desktop navigation: horizontal lockup at 38px high.
- Mobile navigation: horizontal lockup at 30–34px high.
- Drawer: horizontal lockup at 32px high, matched to the active surface.
- Footer: horizontal on-dark lockup at 34–38px high.
- Admin: compact horizontal lockup at 30–32px high.
- Favicon/app icon: mark only; never squeeze in the wordmark.

Minimum clear space is the width of the mark's lower stem on every side. Do not stretch, rotate, outline, recolor, glow, bevel, or place the logo over busy imagery without a solid contrast surface.

## Generated concept

The visual direction was explored with the built-in image-generation workflow, then rebuilt as deterministic SVG geometry for production. The selected concept reference is stored under `brand-exploration/fyuri-split-aperture-lockup-concept.png`.
