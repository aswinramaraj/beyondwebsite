// Mascot GLB check. Loads the original and the meshopt-compressed GLB in three.js (headless Chrome, software WebGL), logs clips / meshes / bones,
// measures the Fire_* meshes at rest and during the clips, and saves matching frames of both files for a pixel comparison.
//   cd site && python3 -m http.server 3300 --bind 127.0.0.1        (serves /public and /node_modules)
//   node tools/mascot/verify.mjs http://127.0.0.1:3300 /tmp/mascot-check        (needs playwright-core and Google Chrome; PW=/path/to/index.mjs if not resolvable)
const { chromium } = await import(process.env.PW || 'playwright-core');
import fs from 'fs';
const [base = 'http://127.0.0.1:3300', out = '/tmp/mascot-check', minUrl = '/public/fantasy_pet.min.glb'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'] });
const p = await (await b.newContext({ viewport: { width: 600, height: 600 } })).newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(String(e).slice(0, 300))); p.on('console', (m) => { if (['error', 'warning'].includes(m.type())) errs.push(m.text().slice(0, 300)); });
p.on('response', (r) => { if (r.status() >= 400) errs.push('HTTP ' + r.status() + ' ' + r.url()); });
await p.goto(base + '/tools/mascot/verify.html', { waitUntil: 'load' });
await p.waitForFunction(() => window.__ready, null, { timeout: 20000 });
const orig = await p.evaluate(() => window.loadModel('orig', '/public/fantasy_pet.glb'));
const mini = await p.evaluate((u) => window.loadModel('min', u), minUrl);
console.log('ORIGINAL clips:', JSON.stringify(orig.clips)); console.log('ORIGINAL meshes:', orig.meshes.join(', ')); console.log('bones:', orig.bones);
console.log('MINIFIED clips:', JSON.stringify(mini.clips)); console.log('MINIFIED meshes:', mini.meshes.join(', ')); console.log('bones:', mini.bones);
console.log('same clip names+durations:', JSON.stringify(orig.clips.map((c) => c.slice(0, 2))) === JSON.stringify(mini.clips.map((c) => c.slice(0, 2))));
const shot = async (name) => p.locator('canvas').screenshot({ path: `${out}/${name}.png`, omitBackground: true });
const frames = [[null, 0, 'rest'], ['Rotate', 0.5, 'rotate_0.5'], ['Rotate', 1.0, 'rotate_1.0'], ['Fly', 0.25, 'fly_0.25'], ['Lift', 0.9, 'lift_0.9'], ['Lift', 1.667, 'lift_end'], ['Backflip', 0.75, 'backflip_0.75'], ['Bite', 0.35, 'bite_0.35'], ['Bite', 0.55, 'bite_0.55'], ['Fire', 0.6, 'fire_0.6'], ['Fire', 1.1, 'fire_1.1'], ['Fire', 1.5, 'fire_1.5']];
for (const key of ['orig', 'min']) {
  for (const [clip, t, name] of frames) {
    await p.evaluate(([k, c, tt]) => window.pose(k, c, tt), [key, clip, t]);
    await shot(`${key}_${name}`);
  }
}
// fire meshes: size at rest and during the Fire clip, in both files
for (const key of ['orig', 'min']) {
  const res = {};
  for (const [clip, t] of [[null, 0], ['Rotate', 1], ['Fly', 0.5], ['Lift', 0.8], ['Backflip', 0.7], ['Bite', 0.5], ['Fire', 0.3], ['Fire', 0.9], ['Fire', 1.2], ['Fire', 1.6], ['Fire', 2.0]]) {
    await p.evaluate(([k, c, tt]) => window.pose(k, c, tt), [key, clip, t]);
    const s = await p.evaluate((k) => window.fireSizes(k), key);
    res[(clip || 'rest') + '@' + t] = Math.max(...Object.values(s));
  }
  console.log(key, 'largest Fire_* extent (m):', JSON.stringify(res));
}
await p.evaluate(() => window.pose('orig', null, 0));
console.log('bbox at rest:', JSON.stringify(await p.evaluate(() => window.bbox('orig'))));
await p.evaluate(() => window.pose('orig', 'Fly', 0.25));
console.log('bbox Fly@0.25:', JSON.stringify(await p.evaluate(() => window.bbox('orig'))));
console.log('issues:', errs.length ? [...new Set(errs)].join(' | ') : 'none');
await b.close();
