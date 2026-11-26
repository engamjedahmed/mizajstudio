# Clarity Gateway — development reconstruction

This is a new implementation reconstructed from the supplied 03.0C hero and
03.0D-2 comparison/stage screenshots. It is **not the recovered original D-2
source**, and the earlier D-2 measurements do not describe this implementation.
The original screenshots were read without modifying their bytes.

## Shared visual source

`src/scene-math.js` defines the five units, their component geometry, the four
relationships, final positions, story poses, palette and orthographic camera.
Both the live Three.js scene and `scripts/render-gateway.py` read this source.

| Unit | Architectural form |
| --- | --- |
| Products | Upper beam with a chamfered end |
| Inventory | Left pier with three recessed vertical channels |
| Customers | Right pier with an inward shoulder |
| Orders | Lower bridge |
| Reports | Two-level base and small supporting strut, one logical unit |

The only four gold relationships are products–inventory, inventory–orders,
customers–orders and orders–reports. The reports path follows the top and front
faces of the stepped base. The palette remains Navy `#16213E`, Gold `#E0A133`
and Cream `#F7F6F3`.

## Integration contract

```js
const { mountGateway } = await import('./src/clarity-scene.js');
const scene = await mountGateway(container, { onStage, onState, onError });
```

Mount renders the **final pose once**, then emits `onStage(3)` and
`onState('ready')`. It never starts the story on its own. The page should keep
its static illustration available until that ready signal.

Returned methods: `play`, `pause`, `resume`, `replay`, `showStatic`, `dispose`,
and `getStats`. `play` and `replay` reset the sequence to stage 0. `resume`
continues a paused sequence. `showStatic` stops animation and hides the canvas.
User controls and translated accessible text belong to the surrounding page.

- Stage indices are 0–3; state values are `ready`, `playing`, `paused`,
  `complete`, and `static`.
- The sequence lasts 4.8 seconds, including a 0.3-second settled final hold.
  Stage 2 has a rotated upper beam and an angled bridge; stage 3 aligns them
  into the completed gateway. It is a visible geometric transition.
- The mount draws once; an observer may perform a second resize draw. Animation
  uses requestAnimationFrame only while playing. Completion, pause, static view,
  page hiding and leaving the viewport cancel continuous rendering.
- Returning to the page or viewport does not resume playback automatically.
- Reduced-motion preference prevents playback and returns to the static view;
  changing that preference while playing also stops the scene.
- Initial WebGL creation failure rejects the mount promise. Context loss hides
  the canvas, emits static state and calls `onError(Error)` so the page can keep
  its fallback visible. It does not retry indefinitely.
- Dispose removes observers/listeners/canvas, disposes geometry/materials and
  renderer resources, and releases the WebGL context.

Gold path position/normal buffers and sample vectors are allocated once and
updated in place. No path geometry is recreated during animation. DPR is
capped at 1.5. There are no particles, orbit controls, model downloads, external
textures, postprocessing passes or runtime animation libraries.

## Checks completed for this source

Node syntax and module import checks passed. `getGeometryBudget()` creates the
actual source geometries, counts their triangles, and disposes them. Its result:

| Source quantity | Count |
| --- | ---: |
| Logical units / relationships | 5 / 4 |
| Buffer geometries, including contact-shadow plane | 10 |
| Materials | 3 |
| Triangles, including paths and shadow plane | 2,862 |

A mathematical framing check sampled 97 times across the sequence using
conservative piece bounds. No unit bounds crossed the camera edges at desktop
1.28:1 or mobile 1:1 aspect ratios. Maximum absolute normalized projected
coordinates were `(0.6616, 0.8690)` and `(0.8401, 0.8621)` respectively. This is
a sampled bounds check, not a continuous collision proof or a browser test.

`getStats()` exposes actual renderer memory/program counts, last-render
triangles/draw calls, elapsed time, frame counter and DPR. Source counts are
separate from live renderer counts. No production diagnostics are logged.

## Static fallback reproduction

```bash
python scripts/render-gateway.py
```

Requires Blender 4.x, Node and Pillow. The script reads the shared source module,
renders the final geometry on a neutral background, and creates desktop
1152×900 and mobile 700×700 WebP files under `public/assets`. It does not edit or
embed reference screenshots. Use `--samples` to change offline render quality.

Both resulting WebP files were opened and inspected. All five units and the
four gold relationships are visible, including the path over the stepped base.
The desktop file is 22,772 bytes; the mobile file is 15,516 bytes. These are file
sizes of the produced assets, not a page transfer or loading-time measurement.
The source render uses Cycles with 64 samples, without denoising because this
Blender build does not include OpenImageDenoise. Fine render grain can remain
near the base when enlarged. The actual shadow pass is composited at 35%
opacity beneath the object to keep the contact shadow quiet.

Blender's offline lights, bevel implementation, shading and true contact shadows
are not pixel-identical to Three.js. The live version uses a lightweight
analytic contact-shadow plane, without a real-time shadow-map pass. Treat
appearance consistency as a review target, not a claim of pixel equality.

## Remaining validation

Browser interaction, context-loss/reduced-motion behaviour, resting frame
counts, draw calls and visual comparison need checking in the integrated page.
No FPS, GPU-memory, Core Web Vitals, physical Android/iPhone or Safari result is
claimed by the source checks above. No production domain, main-branch files,
published deployment or external paid service is changed by this reconstruction.
