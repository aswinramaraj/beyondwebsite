import { chromium } from 'playwright-core';
import fs from 'fs';
const [url, outfile] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto(url, { waitUntil: 'load' }); await p.waitForTimeout(6500);
// each target: selector (first match) → what to read
const TARGETS = {
  heroHeading: '.hero-heading', showWrap: '.show-wrap', set1: '.hero-paralax.set-1.hide-mob', set2: '.hero-paralax.set-2', set3: '.hero-paralax.set-3', set4: '.hero-paralax.set-4.hide-mob', set5: '.hero-paralax.set-5', set6: '.hero-paralax.set-6.hide-mob', set7: '.hero-paralax.set-7.hide-mob',
  showreal: '.showreal-home', showVideo: '.show-real-video', lapBg: '.lap-top-bg',
  card1: '.stats-card-wrapper.img-list-set-1', card2: '.stats-card-wrapper.set-3', card3: '.stats-card-wrapper.set-2', card4: '.stats-card-wrapper.set-4',
  gradLTop: '.left-stat-gradient.top', gradRTop: '.right-stat-gradient.top', gradLBot: '.left-stat-gradient.bot', gradRBot: '.right-stat-gradient.bot',
  statsHeadWrap: '.case--new-heading-wrap', secName: '.section-name', servSub: '.b1.serv-sub.max-w-40', servSecond: '.b1.serv-sub.second', servLine: '.stats-card-gradient.services.line',
};
const read = () => p.evaluate((T) => {
  const out = {};
  for (const [k, sel] of Object.entries(T)) {
    const e = document.querySelector(sel); if (!e) { out[k] = null; continue; }
    const cs = getComputedStyle(e); const m = cs.transform; let tx = 0, ty = 0, rot = 0, sc = 1;
    if (m && m !== 'none') { const v = m.match(/matrix(3d)?\((.+)\)/)[2].split(',').map(parseFloat); if (v.length === 6) { tx = v[4]; ty = v[5]; rot = Math.atan2(v[1], v[0]) * 180 / Math.PI; sc = Math.hypot(v[0], v[1]); } else { tx = v[12]; ty = v[13]; rot = Math.atan2(v[1], v[0]) * 180 / Math.PI; sc = Math.hypot(v[0], v[1]); } }
    const r = e.getBoundingClientRect();
    out[k] = { tx: +tx.toFixed(1), ty: +ty.toFixed(1), rot: +rot.toFixed(2), sc: +sc.toFixed(3), op: +parseFloat(cs.opacity).toFixed(3), w: Math.round(r.width), h: Math.round(r.height) };
  }
  return out;
}, TARGETS);
const tops = await p.evaluate(() => { const t = (s) => { const e = document.querySelector(s); return e ? e.getBoundingClientRect().top + scrollY : null; }; return { hero: 0, stats: t('.section.bg-dark.cards'), serv: t('.section.is-cases'), stages: t('.height-cases') }; });
const plan = [];
for (const y of [0, 250, 500, 750, 1000, 1250, 1500, 1750, 2000]) plan.push([`hero@${y}`, y]);
// position relative to a section: scrollY = sectionTop - viewportHeight + offset  (offset 0 = section just entering)
for (const d of [0, 300, 600, 900, 1200, 1500]) plan.push([`stats@${d}`, tops.stats - 900 + d]);
for (const d of [0, 300, 600, 900, 1200, 1500, 1800]) plan.push([`serv@${d}`, tops.serv - 900 + d]);
const res = {};
for (const [name, y] of plan) {
  await p.evaluate((yy) => window.scrollTo(0, yy), Math.max(0, y));
  await p.waitForTimeout(1600);
  res[name] = await read();
}
fs.writeFileSync(outfile, JSON.stringify({ tops, res }, null, 1));
console.log('sampled', Object.keys(res).length, 'positions; tops', JSON.stringify(tops));
await b.close();
