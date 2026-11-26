// Renders the motion graphics in scenes.js.
//   node render.mjs preview [scene ...]   → key-frame PNGs in <out>/preview/<scene>_<time>.png
//   node render.mjs video   [scene ...]   → ../../public/video/<prefix>-<scene>.mp4 + <prefix>-<scene>-poster.webp
//   node render.mjs still   [scene ...]   → ../../public/img/<prefix>-<scene>.webp (one frame; used for the blog covers)
// Needs: playwright-core (set PW=/path/to/playwright-core/index.mjs if it is not resolvable), Google Chrome, ffmpeg.
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFileSync } from 'child_process';
import { fileURLToPath, pathToFileURL } from 'url';

const { chromium } = await import(process.env.PW || 'playwright-core');
const here = path.dirname(fileURLToPath(import.meta.url));
const publicVideo = path.resolve(here, '../../public/video');
const out = process.env.OUT || path.join(os.tmpdir(), 'bl-motion');
const FPS = 30, DUR = 6;
const ALL = ['feeding', 'work', 'hiring', 'moving', 'including', 'automating', 'question', 'explore', 'think', 'make', 'heart', 'rocket', 'graph', 'installs', 'boost'];
const STILLS = ['y2024', 'y2026', 'y2027', 'agents', 'energy', 'coding', 'upi', 'deepfake', 'mcp', 'pqc', 'quantum', 'passkeys', 'access', 'classroom', 'euact', 'ondevice', 'webgpu', 'satellite'];
const [mode = 'preview', ...rest] = process.argv.slice(2);
const names = rest.length ? rest : mode === 'still' ? STILLS : ALL.filter((n) => !STILLS.includes(n));
const KEYS = (process.env.KEYS || "0.5,1.5,2.5,3.5,4.5,5.5,6.5,7.5").split(",").map(Number);

const browser = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const page = await (await browser.newContext({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 1 })).newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e).slice(0, 300)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 300)); });

for (const name of names) {
  await page.goto(pathToFileURL(path.join(here, 'scenes.html')).href + '?scene=' + name);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 15000 });
  const [W, H] = await page.evaluate(() => window.__size);
  const prefix = await page.evaluate(() => window.__prefix);
  const dur = await page.evaluate(() => window.__dur);
  const posterAt = await page.evaluate(() => window.__poster);
  await page.setViewportSize({ width: W, height: H });
  if (mode === 'preview') {
    const dir = path.join(out, 'preview');
    fs.mkdirSync(dir, { recursive: true });
    for (const t of KEYS) {
      await page.evaluate((tt) => window.seek(tt), t);
      await page.screenshot({ path: path.join(dir, `${name}_${t.toFixed(1)}.png`) });
    }
    console.log('preview', name);
  } else if (mode === 'still') {
    await page.evaluate(() => window.seek(0));
    const dir = path.join(out, 'stills');
    fs.mkdirSync(dir, { recursive: true });
    const png = path.join(dir, `${prefix}-${name}.png`);
    await page.screenshot({ path: png });
    const img = path.resolve(here, '../../public/img');
    fs.mkdirSync(img, { recursive: true });
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', png, '-quality', '86', path.join(img, `${prefix}-${name}.webp`)]);
    console.log('still', name, (fs.statSync(path.join(img, `${prefix}-${name}.webp`)).size / 1024).toFixed(0) + ' KB');
  } else {
    const dir = path.join(out, 'frames', name);
    fs.mkdirSync(dir, { recursive: true });
    for (const f of fs.readdirSync(dir)) fs.unlinkSync(path.join(dir, f));
    const n = Math.round(FPS * dur); // t = 0 … dur − 1/30 (frame `dur` would equal frame 0, so the loop is seamless)
    for (let i = 0; i < n; i++) {
      await page.evaluate((tt) => window.seek(tt), i / FPS);
      await page.screenshot({ path: path.join(dir, `f${String(i).padStart(4, '0')}.png`) });
    }
    fs.mkdirSync(publicVideo, { recursive: true });
    const mp4 = path.join(publicVideo, `${prefix}-${name}.mp4`);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(dir, 'f%04d.png'),
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-preset', 'slow', '-crf', '23', '-g', '60', '-movflags', '+faststart', '-an', mp4]);
    // poster = the "everything visible" moment, so the card looks finished before (or without) playback
    await page.evaluate((tt) => window.seek(tt), posterAt);
    await page.screenshot({ path: path.join(dir, 'poster.png') });
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(dir, 'poster.png'), '-vf', 'scale=min(1000\\,iw):-1', '-quality', '88', path.join(publicVideo, `${prefix}-${name}-poster.webp`)]);
    console.log('video', name, (fs.statSync(mp4).size / 1024).toFixed(0) + ' KB');
  }
}
await browser.close();
if (errors.length) console.log('PAGE ERRORS:', [...new Set(errors)].join(' | '));
