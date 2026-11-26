import { chromium } from 'playwright-core';
const url = process.argv[2];
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto(url, { waitUntil: 'load' }); await p.waitForTimeout(6500);
// bring a stats card + the CTA card + hero tag into view so scroll-triggered loops start
for (const sel of ['.hero-tag-wrap', '.stats-card-wrapper.set-2', '.cta-card-wrapper']) {
  await p.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'center' }), sel); await p.waitForTimeout(500);
  const samples = [];
  for (let i = 0; i < 5; i++) { samples.push(await p.evaluate((s) => { const g = document.querySelector(s + ' .stats-card-gradient'); if (!g) return null; const t = getComputedStyle(g).transform; const v = t === 'none' ? [0, 0] : t.match(/matrix\((.+)\)/)[1].split(',').map(parseFloat).slice(4, 6).map((n) => Math.round(n)); return v.join(','); }, sel)); await p.waitForTimeout(900); }
  console.log(sel.padEnd(30), samples.join('  ->  '));
}
await b.close();
