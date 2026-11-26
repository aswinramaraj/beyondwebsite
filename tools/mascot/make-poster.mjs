// Renders public/mascot-header.webp: the mascot's standing pose captured from the real header canvas (same size, lighting, angle and framing),
// so the poster and the live 3D model line up exactly when the model fades in. Re-run after the model or the header layout changes.
//   (dev or production server running)  node tools/mascot/make-poster.mjs http://localhost:3001
// Needs playwright-core + Google Chrome (PW=/path/to/playwright-core/index.mjs if not resolvable) and ffmpeg.
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
const { chromium } = await import(process.env.PW || 'playwright-core');
const base = process.argv[2] || 'http://localhost:3001';
const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(here, '../../public/mascot-header.webp');
const b = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })).newPage();
await p.goto(base + '/about?mascot', { waitUntil: 'load' });
await p.waitForFunction(() => window.__mascot, null, { timeout: 60000 });
const png = await p.evaluate(() => {
  const m = window.__mascot; m.pause();
  m.ctl.setVisible(false);          // back to the standing (bind) pose
  m.tick(0, true);                  // draw it, then read the canvas in the same task (the drawing buffer is cleared afterwards)
  return document.querySelector('.bl-mascot-canvas').toDataURL('image/png');
});
const tmp = path.join(os.tmpdir(), 'mascot-header.png');
fs.writeFileSync(tmp, Buffer.from(png.split(',')[1], 'base64'));
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', tmp, '-quality', '90', out]);
console.log('wrote', out, (fs.statSync(out).size / 1024).toFixed(0) + ' KB');
await b.close();
