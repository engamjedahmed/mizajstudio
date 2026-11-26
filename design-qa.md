# Design QA — Clarity Gateway reconstruction

**Result: blocked**

## Current verification state

The build and JavaScript syntax checks passed. The prescribed local preview
service started, but the cloud browser returned “Site Unavailable — Unable
to access this site.” A service restart and one browser retry did not resolve
the local relay. This does not count as visual or interaction verification.

A protected Vercel preview was the intended next verification surface, but
automatic approval review rejected pushing this candidate to the public
GitHub repository because explicit authorization to publish this new content
was not present. The push did not complete. A subsequent read of the repository
branches confirmed the new branch is absent and main remains at
`e19e6dd1578fb0c81e148eba732f3d792782fb53`.

A self-contained offline HTML review was also prepared. The cloud browser
rejected its `file:` URL because only HTTP and HTTPS are supported. No alternate
protocol, indirect browser execution, security change or public deployment
was attempted to bypass that rejection. The file is available for the user
to review locally. It is not evidence of a successful browser test.

**No screenshots of the implemented page were captured.** No font/layout/state
comparison can be marked passed. The 3D poster was opened next to the source
image for a limited geometry/art-direction review; it is not a screenshot of
the website or proof of the live WebGL appearance.

## Sources

- Desktop target: recovered `2968602B-FA0B-40A1-8E5B-01CA5440B634.png`, 1440×1024.
- Mobile target: recovered `B728D2AB-2F00-4934-9B73-E81FE69F3BFF.png`, 390×1253.
- D-2 geometry references: `5A581117-E51A-4967-9BCB-29976B2D9805.png`
  and `ED959D20-90C1-431A-B98E-0520A7A12A38.png`.

## Pre-browser checks

- All 96 page translation keys have English counterparts.
- No duplicate HTML IDs or unresolved internal section anchors.
- Catalog and planner arithmetic/input checks are described in `docs/demo-scope.md`.
- The five-unit, four-link reconstructed scene has 2,862 source triangles,
  ten geometries and three materials. These are not GPU performance results.
- WebP posters: desktop 22,772 bytes; mobile 15,516 bytes.
- Contrast/focus and demo button styles were corrected after source review.
- Source review found and fixed replay outside the viewport and hidden-tab
  startup. A simulated DOM/RAF/renderer check covered the control logic and
  initialization cleanup. It was not an actual GPU test.
- The production build excludes the inspection-frame page.

## Fidelity surfaces

| Surface | Current finding | Verification |
| --- | --- | --- |
| Fonts | Local IBM Plex Arabic/Sans/Mono subsets are configured. | Browser rendering blocked. |
| Layout | Arabic text precedes the scene on mobile; desktop columns follow language. | Source checked; actual wrapping and overflow unverified. |
| Colors | Navy `#16213E`, cream `#F7F6F3`, gold `#E0A133`; focus uses navy/cream contrast. | Tokens/source checked; live appearance unverified. |
| Artwork | Five reconstructed modules and four connections; Blender posters inspected. | Source scene differs from the lost original; WebGL appearance unverified. |
| Copy | Bilingual services, fictional demo labels, verified existing contact details. | 96 translation keys checked; browser state unverified. |

## Fixed source findings

- **P2:** Demo buttons inherited browser-default colors. Added scoped navy and
  white/outlined button styles with existing 44px controls.
- **P2:** Gold focus ring on cream was weak. Changed the page focus ring to navy
  and cream on the dark contact section.
- **P2:** Play/resume could begin while hidden/offscreen. Added immediate DOM
  visibility checks and per-frame guards, preserving manual resume.

## Bundle measurements

Locally built production files, gzip level 9 (not a network measurement):
initial application JS **35,588 bytes / 12,830 gzip bytes**; optional scene JS
**575,762 bytes / 143,330 gzip bytes**. Font transfer depends on the rendered
language and weights. The separate offline review embeds all resources and
cannot be used to assess the production loading strategy.

## Still required

- Matched desktop/mobile screenshots and a same-input source comparison.
- Typography, layout, palette, artwork and copy review.
- Play/pause/resume/replay/static states; language, navigation, demos and FAQ.
- Console error review and responsive overflow checks.
- Physical Android/iOS/Safari checks before production.
