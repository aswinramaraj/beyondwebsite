import { chromium } from 'playwright-core';
import fs from 'fs';
const OUT = process.argv[2]; const W = +process.argv[3] || 1440; const H = +process.argv[4] || 900; const tag = process.argv[5] || 'r';
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) if (f.startsWith(tag + '_')) fs.unlinkSync(OUT + '/' + f);
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const ctx = await b.newContext({ viewport: { width: W, height: H }, isMobile: W < 500, hasTouch: W < 500 });
const p = await ctx.newPage();
const errs = [];
p.on('console', (m) => { if (['error', 'warning'].includes(m.type())) errs.push(m.type() + ': ' + m.text().slice(0, 220)); });
p.on('pageerror', (e) => errs.push('PAGEERROR: ' + String(e).slice(0, 300)));
p.on('requestfailed', (r) => errs.push('REQFAIL: ' + r.url().slice(0, 140)));
p.on('response', (r) => { if (r.status() >= 400) errs.push('HTTP ' + r.status() + ': ' + r.url().slice(0, 140)); });
await p.goto('http://localhost:3100/', { waitUntil: 'load' });
await p.waitForTimeout(6000);
const dh = await p.evaluate(() => document.documentElement.scrollHeight);
console.log('docHeight', dh, 'mq', await p.evaluate(() => window.__ix2 && window.__ix2.mq()), 'ix instances', await p.evaluate(() => window.__ix2 && window.__ix2.conts().length));
let i = 0;
for (let y = 0; y < dh; y += H) {
  await p.evaluate((yy) => (window.__lenis ? window.__lenis.scrollTo(yy, { immediate: true }) : window.scrollTo(0, yy)), y);
  await p.waitForTimeout(1300);
  await p.screenshot({ path: `${OUT}/${tag}_${String(i).padStart(2, '0')}_y${y}.png` });
  i++;
}
console.log('slices', i);
console.log('--- console/network issues (' + errs.length + ') ---');
[...new Set(errs)].slice(0, 25).forEach((e) => console.log(e));
await b.close();
