import { chromium } from 'playwright-core';
const OUT = process.argv[2];
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 200))); p.on('requestfailed', (r) => errs.push('REQFAIL ' + r.url().slice(0, 100)));
await p.goto('http://localhost:3100/', { waitUntil: 'load' }); await p.waitForTimeout(6500);
await p.evaluate(() => document.querySelector('[fs-cc="allow"]')?.click()); await p.waitForTimeout(600);
const st = () => p.evaluate(() => [document.getElementById('video'), ...document.querySelectorAll('video.bl-card-art, video.case-rotate-img, video.bl-widget-video')].map((v, i) => { if (!v) return i + ': missing'; const r = v.getBoundingClientRect(); return `${i ? 'card' + i : 'hero'}: paused=${v.paused} muted=${v.muted} loop=${v.loop} ready=${v.readyState} t=${v.currentTime.toFixed(2)}s dur=${v.duration.toFixed(1)}s native=${v.videoWidth}x${v.videoHeight} box=${Math.round(r.width)}x${Math.round(r.height)} fit=${getComputedStyle(v).objectFit}`; }));
console.log('t0  ', JSON.stringify(await st(), null, 0));
await p.waitForTimeout(2500);
console.log('t+2.5', JSON.stringify(await st(), null, 0));
// hero frames at two moments
await p.screenshot({ path: OUT + '/vid_hero_a.png' });
await p.waitForTimeout(3500);
await p.screenshot({ path: OUT + '/vid_hero_b.png' });
// the five Focus cards: each plays only while it is on screen
for (const sel of ['.service-card.set-1', '.service-card.set-5', '.service-card.set-3', '.service-card.set-6']) {
  const y = await p.evaluate((s) => { const e = document.querySelector(s); const r = e.getBoundingClientRect(); return r.top + scrollY + r.height / 2 - 450; }, sel);
  await p.evaluate((yy) => (window.__lenis ? window.__lenis.scrollTo(yy, { immediate: true }) : window.scrollTo(0, yy)), y); await p.waitForTimeout(2200);
  console.log('scrolled to', sel, JSON.stringify(await st()));
}
await p.screenshot({ path: OUT + '/vid_cards.png' });
console.log('errors:', errs.length ? errs : 'none');
await b.close();
