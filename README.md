# Mizaj Studio — Clarity Gateway review candidate

Arabic-first, bilingual studio website with an optional Three.js sequence,
an illustrative catalog and a small demand calculator. The approved visual
direction is navy, cream and gold with IBM Plex typography.

## Status and provenance

This branch reconstructs the Clarity Gateway from the recovered 03.0C and
03.0D-2 images. The original D-2 runtime source was not recovered. Its earlier
performance measurements must not be attributed to this implementation.

The existing main branch and production domain remain separate. This candidate
has `noindex,nofollow` until a deliberate release decision. A successful build
alone does not establish browser or phone readiness; see `design-qa.md` for
the current verification status.

## Local development

```sh
npm ci
npm run dev -- --host 0.0.0.0
npm run check
npm run build
node scripts/build-review.mjs
```

The last command creates `review/MIZAJ_Clarity_Gateway_Review.html`, an offline
review file with the code, fonts and images embedded. It can be opened directly
in a browser without a local server. This portable build is for review only;
its loading/transfer behavior is not representative of the production bundle.

Vite emits the production bundle under `dist`. `vercel.json` declares the build
and output settings per deployment, without changing project settings for the
existing production version.

## Structure

- `index.html`, `styles.css`, `script.js`: bilingual page and interaction shell.
- `src/translations.js`: English copy; the source HTML supplies Arabic.
- `src/clarity-scene.js`, `src/scene-math.js`: optional 4.8-second Three.js scene.
- `scripts/render-gateway.py`: Blender poster rendering from the shared scene specification.
- `src/demos.js`, `src/demo-math.js`, `src/demos.css`: illustrative, local-only demos.
- `public/assets`: compressed scene posters. Fonts are bundled locally from Fontsource.
- `docs`: scene provenance, demo boundaries and handoff notes.

Three.js loads only after a visitor asks to play the scene. The initial page
uses a static poster. Reduced motion, WebGL failure and context loss retain
the text, contact links and image. Catalog selections and calculator inputs
are local, contain fictional data, and are not submitted to any server.

## Review and release

For a protected Vercel preview, `VERCEL_ENV=preview` also builds `qa-frame.html`,
a fixed-viewport inspection frame. Ordinary production builds exclude it.
No analytics, payment service, database or new paid subscription is configured.
Test actual Android/iOS/Safari devices and review the visual result before
promoting this branch to production. Remove the review-only robots directive
as part of that explicit release.
