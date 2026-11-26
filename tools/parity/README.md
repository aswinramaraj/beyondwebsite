# Parity tools

Scripts used to prove the replica matches outcrowd.io (animation values, layout geometry, interactions).
They drive headless Chrome with `playwright-core` (`npm i -D playwright-core`, and set the Chrome path inside each
script if it is not `/usr/bin/google-chrome`). Start the site first (`npm run build && npm start`, port 3100).

| Script | What it checks |
|---|---|
| `sample.mjs <url> <out.json>` | scrolls to 22 positions and records transform / opacity / size of ~30 animated elements |
| `compare_samples.py` | diffs `sample_original.json` vs `sample_replica.json` (run in the folder holding both) |
| `geom.mjs <url> [width]` | x / y / width / height of ~45 layout elements |
| `inter.mjs <url>` | hover (button, footer link) and FAQ open/close timelines |
| `stagecheck.mjs <outdir>` | the four-step pinned section: step text position, ring angle, image cross-fade |
| `loops.mjs <url>` | looping glow borders keep moving |
| `spacing.mjs <url> <out.json>` | vertical offset and height of every block relative to its section (run on both sites, diff the JSON) |
| `vidcheck.mjs <outdir>` | the hero showreel and the six Focus-card videos play (cards only while on screen), are muted and looping, and have the expected boxes |
| `hosts.mjs` | every request goes to localhost; no broken images |
| `qa.mjs <outdir> <w> <h> <tag>` | viewport screenshots down the whole page + console / network errors |

Typical run:
```
node sample.mjs https://www.outcrowd.io/ sample_original.json
node sample.mjs http://localhost:3100/    sample_replica.json
python3 compare_samples.py
```
