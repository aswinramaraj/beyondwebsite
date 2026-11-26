# Motion graphics (fifteen videos)

Fifteen original, looping motion graphics, all built from one shared kit: six for the cards of the **Focus** section (4:3), four for the
**steps** section (16:9, shown in its rotating cards and in the mobile list) and five **hero widgets** that float around the landing-page
headline (the original uses looping Lottie widgets there). Designed and rendered here:

| Video | Card | Story |
|---|---|---|
| `focus-feeding.mp4` | Feeding people | **Craveo** app window: an order is placed, tracked Placed → Preparing → Ready with a live "Ready in N min", a bag appears |
| `focus-work.mp4` | Empowering work | **Calcubill** window: invoices turn Pending → Paid one by one, "N of 4 paid" and the progress bar follow |
| `focus-hiring.mp4` | Hiring smarter | **RedHander** window: a scan fills each candidate's match score, the best one moves to the top and is shortlisted; **Autocloser** works through its call list |
| `focus-moving.mp4` | Moving people | **GPS Tracking** window: Bus 12 follows its route past School Gate and Park Street, "Arrives in" counts down, an arrival alert appears |
| `focus-including.mp4` | Including everyone | **SahaBandh** finds a match ("Shared interests"), then **NextStep** offers an accessible job and "Apply" turns to "Applied ✓" |
| `focus-automating.mp4` | Automating tasks | an **Agent** window: a task typed in plain words, four steps run and tick off, an optimization is suggested |
| `step-question.mp4` | 01 Question everything | an orange "?" smashes a wall of assumptions and a bulb lights up behind it |
| `step-explore.mp4` | 02 Explore possibilities | three explorers leave a compass, branch out and test a flask, a magnifier and a rocket |
| `step-think.mp4` | 03 Think differently | technology, ideas and creativity connect and a new perspective (an eye) opens in the middle |
| `step-make.mp4` | 04 Make it happen | the idea hops up a staircase of steps and plants a flag; check badge + confetti |
| `hero-heart.mp4` | hero widget (round, left) | "72 bpm": a heart beats every 1.2 s with a ripple and heartbeat spikes along a dotted line (4.8 s loop) |
| `hero-rocket.mp4` | hero widget (left) | a "10+ products" bubble; a rocket hovers while the bar chart slides under it, lighting the bar below (9 s loop) |
| `hero-graph.mp4` | hero widget (bottom left) | "Iteration speed": the line draws itself month by month while the result card counts 1.0× → 2× (9 s) |
| `hero-installs.mp4` | hero widget (right) | "Milestones": the bars keep changing height; two highlighted bars carry bubbles whose percentages change with them (9 s loop) |
| `hero-boost.mp4` | hero widget (blue circle) | "2× Faster iterations": a ring fills while the number counts up (content kept to the right, where the laptop frame does not cover it) |
| `about-y2024/y2026/y2027.webp` | About timeline (stills) | client projects on a globe (2024), the EIS app window (2026), an ideation whiteboard "Launching in 2027" (2027); `node render.mjs still y2024 y2026 y2027` |
| `insight-<name>.webp` (15) | Insights covers (stills) | one per post in `content/insights`: agents, energy, coding, upi, deepfake, mcp, pqc, quantum, passkeys, access, classroom, euact, ondevice, webgpu, satellite — real UI text (sign-in card, code diff, QR payment, EU AI Act dates…) on the pastel tiles; `node render.mjs still [name …]`. Key content stays inside x 170–1030 because the home cards crop to near-square |

Files: `scenes.js` (all scenes + the shared kit), `scenes.html` (the stage), `render.mjs` (frame-by-frame renderer).
Output: `public/video/focus-<scene>.mp4` / `step-<scene>.mp4` / `hero-<scene>.mp4` (H.264, 30 fps; Focus 1200×900 × 12 s, steps 1280×720 × 6 s, hero widgets 4.8–9 s; 0.2–0.65 MB each) and the matching `-poster.webp`.

## Design principles (every scene follows all of them)
1. **Frame** – 4:3 for the Focus cards, 16:9 (1280×720) for the steps panels; a soft pastel gradient tile (one tint per scene) with two big translucent circles drifting on the same 6 s sine.
2. **Palette** – ink `#0b0b10`, white, brand blue `#1f4bff`, brand orange `#fe4a23`, pastel neutrals. Nothing else.
3. **Shapes** – rounded rectangles and circles; white UI windows/cards with one shared soft shadow; icons are round-capped ink strokes.
   **The Focus cards and hero widgets use real UI text** (product names, labels, counting numbers) in the brand typeface so they read as real
   products, not abstract shapes – only numbers the client has stated (2× faster iterations, 92 % / 85 %, "10+" products) or obviously
   illustrative demo data (invoice numbers, "6 yrs experience"). The four steps videos are still the older text-free, faster style (to be redone).
4. **Story** – one hero action in orange, a supporting action in blue, and the same signature ending in the Focus and steps scenes: a blue check
   badge (white ring) pops with a small confetti burst. (The hero widgets are ambient: no badge, they just keep moving; their sizes are
   3× their on-screen boxes.)
5. **Motion** – calm, seamless loops (the originals' widgets run 2.4–8.8 s; fast loops felt unreal). Focus cards: 12 s – 0–2 s the window and its content settle in,
   2–10 s the story plays slowly, 10–11.5 s hold, then a soft fade. Hero widgets: 4.8–9 s, periodic motion (a heartbeat every 1.2 s, bars that keep changing)
   so the loop closes by itself; the "one-way" ones (graph, blue circle) end with a fade. Steps videos: the older 6 s version (0–1 s in, 1–4 s action, 4–5.4 s hold, fade). One easing family: `power3.out` (in), `power2.inOut` (travel), `back.out(1.5)` (pop),
   `sine.inOut` (idle float), `expo.out` (ripples).
6. **Safe zone** – the card crops the bottom ~12 %, so key content stays above y = 770 (of 900); the sixth card shows a square crop of the canvas,
   so content also stays between x = 150 and x = 1050.

## Regenerate / edit
Needs `playwright-core`, Google Chrome and `ffmpeg`. GSAP is loaded from `node_modules`.
```
node render.mjs preview [scene …]    # key-frame PNGs (8 per scene) in $OUT/preview – look before you encode
node render.mjs video   [scene …]    # renders 180 frames per scene and encodes the mp4 + poster into public/video
node render.mjs still   [scene …]    # one frame → public/img/<prefix>-<scene>.webp (the Insights covers)
```
If `playwright-core` is not resolvable from here, point at it: `PW=/path/to/playwright-core/index.mjs OUT=/tmp/motion node render.mjs preview`.
To add a scene: write a `(S, tl) => …` function in `scenes.js` using the kit (`card`, `icons.*`, `badge`, `burst`, `ripple`, `pop`),
register it in `SCENES` with a tone, and keep to the principles above.

Gotcha: GSAP's `transformOrigin` px values are relative to the element; for absolute canvas points use `svgOrigin: 'x y'`.
In the site the videos are `lazy` (see `components/AutoVideo.tsx`): they download/play only near the viewport and stay on the
poster when the visitor prefers reduced motion.
