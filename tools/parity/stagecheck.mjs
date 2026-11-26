import { chromium } from 'playwright-core';
import fs from 'fs';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://localhost:3100/', { waitUntil: 'load' }); await p.waitForTimeout(6500);
await p.evaluate(() => document.querySelector('[fs-cc="allow"]')?.click());
const info = await p.evaluate(() => { const e = document.querySelector('.height-cases'); const r = e.getBoundingClientRect(); return { top: r.top + scrollY, h: r.height }; });
console.log('height-cases', info);
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
let n = 0;
for (const v of [1.0, 1.45, 1.9, 2.4, 2.95, 3.5, 4.0, 4.5, 5.05, 5.6, 6.1]) {
  const y = info.top + 900 * (v - 1);
  await p.evaluate((yy) => window.scrollTo(0, yy), y);
  await p.waitForTimeout(1700);
  const m = await p.evaluate(() => {
    const items = [...document.querySelectorAll('.cards-cases-left .cases-cards-left-item')].map((e) => { const r = e.getBoundingClientRect(); return Math.round(r.top + r.height / 2); });
    const ell = getComputedStyle(document.querySelector('.rotate-ellipse-2')).transform; const mm = ell.match(/matrix\(([^)]+)\)/); let deg = 0; if (mm) { const v = mm[1].split(',').map(parseFloat); deg = Math.atan2(v[1], v[0]) * 180 / Math.PI; }
    const imgs = [...document.querySelectorAll('.case-rotate-img')].map((i) => +parseFloat(getComputedStyle(i).opacity).toFixed(2));
    const hw = +parseFloat(getComputedStyle(document.querySelector('.case--new-heading-wrap')).opacity).toFixed(2);
    return { centres: items, ellipseDeg: +deg.toFixed(1), imgOpacity: imgs, rightBg: getComputedStyle(document.querySelector('.cards-cases-right')).backgroundColor, leftOp: +parseFloat(getComputedStyle(document.querySelector('.cards-cases-left')).opacity).toFixed(2) };
  });
  console.log(`v=${v.toFixed(2)}vh `, JSON.stringify(m));
  if ([2.0, 1.9, 2.95, 4.0, 5.05].includes(v)) { await p.screenshot({ path: `${OUT}/stage_${String(n++).padStart(2, '0')}_v${v}.png` }); }
}
await b.close();
