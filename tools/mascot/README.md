# Beyond Logik mascot — model, component and checks

The mascot is a rigged 3D model (`public/fantasy_pet.glb`) rendered with three.js. It lives next to the **Contact** button in the site header (this replaced the
old procedural "Yali" pet) and has a test page at **`/mascot-demo`** (not linked anywhere, `noindex`).

## Files
| File | What it is |
|---|---|
| `public/fantasy_pet.glb` (5.5 MB) | **Source of truth**, exported from Blender. Re-export over this file when the model changes. |
| `public/fantasy_pet.min.glb` (1.2 MB) | What the site loads: meshopt-compressed copy. Made by `npm run optimize:mascot` — **regenerate it after every re-export, never edit it by hand.** |
| `public/mascot-header.webp` (16 KB) | Poster for the header: the standing pose captured from the real header canvas, so it lines up exactly with the live model. Regenerate with `node tools/mascot/make-poster.mjs http://localhost:3001` after the model or header layout changes. |
| `public/fantasy_pet.png` / `.webp` | Generic 1920×1080 transparent poster (used by `<Mascot />` when no `poster` is given, e.g. on the demo page). **Currently a stand-in rendered from the GLB (3/4 view)** — copy your own render over the PNG when you have it (then recreate the .webp: `ffmpeg -i public/fantasy_pet.png -vf scale=1280:-1 -quality 90 public/fantasy_pet.webp`). |
| `lib/mascot/controller.ts` | Framework-free controller: loads the GLB, owns the clip state machine and the render loop. |
| `components/Mascot.tsx` | The React component (below). |
| `components/MascotDemo.tsx`, `app/mascot-demo/` | The test page. |
| `tools/mascot/verify.mjs` + `verify.html` | Browser check of the GLB (clips, bones, fire, compressed-vs-original frames). |

## Using the component
```tsx
<div style={{ width: 240, height: 200 }}>        {/* it fills its parent: give the parent a size */}
  <Mascot idle="fly" autoplay yaw={0.55} />
</div>
```
| Prop | Meaning |
|---|---|
| `action` (+ `actionKey`) | Play a clip when it changes: `'Rotate' \| 'Fly' \| 'Lift' \| 'Backflip' \| 'Bite' \| 'Fire'`. Bump `actionKey` to re-trigger the same one. |
| `idle` | `'rest'` stands · `'fly'` hovers: takes off (Lift → Fly) whenever it scrolls into view and again after every one-shot clip. |
| `autoplay` | A random trick (Rotate / Backflip / Bite) every 9–14 s. |
| `hover`, `click` | Pointer over the pet → Rotate · click / Enter on the pet → Backflip (both on by default). |
| `yaw` | Facing angle in radians (0 = at the viewer, + = turned toward the right). Keep it ≤ 0.6 — the camera frame was measured for that. |
| `poster`, `alt`, `modelUrl`, `className`, `onReady(clips)`, `onPhase(phase)` | Poster image shown while loading / with reduced motion · alt text (default "Beyond Logik mascot") · model path · … |

Ref: `{ play(action, { queue }), setIdle(idle), phase }`. `Fly` and `Lift` both mean "take off and hover" — **Lift always runs first and chains into Fly by itself**
(Fly starts mid-air, so playing it from standing would pop). One-shots cross-fade in 0.2 s, clamp on their last frame, then return to the idle state.
Add `?mascot` to any URL to get `window.__mascot` (`play`, `tick`, `pause`, `resume`, `phase`, `fire`) for tests.

**On every page** it is Yali, the roaming pet (`components/YaliPet.tsx`, `lib/yali/roam.ts`, see the main README): it takes off from beside Contact, flies under the text, bites buttons and breathes fire; hovering or focusing **Contact** calls it over to breathe fire at it (once per 5 s). The header itself only renders the mascot (static poster) when Yali is off because of `prefers-reduced-motion`. Under 768 px wide neither is rendered.

**Performance & accessibility:** the 1.2 MB model is only requested once the pet is near the viewport and the browser is idle; until then (and always with
`prefers-reduced-motion`) a static poster is shown and nothing is downloaded. Rendering stops while the pet is off-screen. The poster carries the alt text; the
canvas is `aria-hidden`; the clickable area is a real `<button>` (keyboard: Tab, Enter = backflip). If WebGL or the model is unavailable the poster simply stays.

**Not built (ideas):** Bite on a form submit · Backflip on a successful submit · Fire on the dock's "Book a call" · eyes that follow the cursor (needs eye bones) ·
Rotate when a new section scrolls in · a "Land" clip so Fly can return to the ground smoothly (today it cross-fades).

## Why meshopt (not Draco), and what the compressed file is
5.67 MB → 1.24 MB, all meshes, bones, materials and the 6 clips kept; the decoder ships inside three.js. Draco would be 0.9 MB but needs a ~300 KB WASM decoder.
The compressed file requires `EXT_meshopt_compression` and `KHR_mesh_quantization` (three.js `GLTFLoader` + `MeshoptDecoder`; `<model-viewer>` is not used).
It has 9 `skin` entries instead of 1 (one per skinned mesh, same 36 bones): quantization gives each mesh its own inverse-bind correction — expected and valid.

## Verify (repeatable)
```
cd site && python3 -m http.server 3300 --bind 127.0.0.1 &
node tools/mascot/verify.mjs http://127.0.0.1:3300 /tmp/mascot-check
```
Logs the clips, meshes and bones of both files, checks they are identical, measures the `Fire_*` meshes in every pose and saves matching frames of both files.

## What was found (model of 2026-11-25, 11:18)
* Clips: exactly `Backflip` 1.5 s · `Bite` 1.0 s · `Fire` 2.0 s · `Fly` **1.042 s** (brief: 1.0 s) · `Lift` 1.667 s · `Rotate` 2.0 s, 108 tracks each — identical in both files. (An earlier export that day had no rig and no clips at all; this one does.)
* Rig: 1 skeleton, 36 bones; 9 skinned meshes (Body, Head, Mane, Wings, Tail, Glow_Markings, Fire_Core/Mid/Outer); 16 meshes, flat PBR materials, no textures;
  extensions `KHR_materials_clearcoat/emissive_strength/specular` (supported by three.js).
* Fire: the largest `Fire_*` extent is ~1.6 cm at rest and in every other clip (invisible), ~1.35–1.6 m during `Fire`, back to ~1.4 cm at its end. Never hide these meshes.
* Size: the bind pose is 2.9 m tall and 4.1 m wide (wings raised); over all clips the model reaches x ±2.4 m, y −0.4 … 4.0 m, and the fire z = 3.4 m. The brief said ≈1.9 m / 3.6 m wingspan.
  The camera frame in `controller.ts` (`FRAME`) was measured from these numbers (screen extents at yaw 0.55: x −2.95 … 2.83, y −0.40 … 3.99).
* Compressed vs original: mean pixel difference < 0.3 / 255 over 12 matching frames (edge pixels only).
