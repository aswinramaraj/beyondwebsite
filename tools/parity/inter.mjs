import { chromium } from 'playwright-core';
const url = process.argv[2];
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto(url, { waitUntil: 'load' }); await p.waitForTimeout(6500);
await p.evaluate(() => document.querySelector('[fs-cc="allow"]')?.click()); await p.waitForTimeout(900);
const tf = (sel) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const m = getComputedStyle(e).transform; if (m === 'none') return [0, 0, 0]; const v = m.match(/matrix(3d)?\((.+)\)/)[2].split(',').map(parseFloat); return v.length === 6 ? [+v[4].toFixed(1), +v[5].toFixed(1), +(Math.atan2(v[1], v[0]) * 180 / Math.PI).toFixed(1)] : [+v[12].toFixed(1), +v[13].toFixed(1), +(Math.atan2(v[6], v[5]) * 180 / Math.PI).toFixed(1)]; }, sel);
const center = (sel) => p.evaluate((s) => { const e = document.querySelector(s); e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, sel);
const out = {};
// 1) secondary button hover (a-125/a-126)
let [x, y] = await center('.btn-secondary.news'); await p.waitForTimeout(1500);
[x, y] = await p.evaluate(() => { const r = document.querySelector('.btn-secondary.news').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
const S = { t1: '.btn-secondary.news .btn-text-secondary.first-txt', t2: '.btn-secondary.news .btn-text-secondary.second-txt', i1: '.btn-secondary.news .icon-btn-secondary.first-icon', i2: '.btn-secondary.news .icon-btn-secondary.second-icon' };
const snap = async () => Object.fromEntries(await Promise.all(Object.entries(S).map(async ([k, s]) => [k, await tf(s)])));
out.btn_rest = await snap();
await p.mouse.move(x, y); await p.waitForTimeout(250); out.btn_hover_250ms = await snap(); await p.waitForTimeout(700); out.btn_hover_950ms = await snap();
await p.mouse.move(5, 5); await p.waitForTimeout(800); out.btn_out = await snap();
// 2) footer link flip (a-169)
[x, y] = await center('.footer .footer-link'); await p.waitForTimeout(1500);
[x, y] = await p.evaluate(() => { const r = document.querySelector('.footer .footer-link').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
out.footer_rest = await tf('.footer .footer-flip-hover'); await p.mouse.move(x, y); await p.waitForTimeout(800); out.footer_hover = await tf('.footer .footer-flip-hover'); await p.mouse.move(5, 5); await p.waitForTimeout(800); out.footer_out = await tf('.footer .footer-flip-hover');
// 3) FAQ first dropdown open / close (a-76 / a-77)
await center('.faq-dropdown .dropdown-toggle'); await p.waitForTimeout(1500);
const faq = () => p.evaluate(() => { const d = document.querySelector('.faq-dropdown'); const dl = d.querySelector('.drop-list'); const ap = d.querySelector('.faq-answer-p'); const pl = d.querySelector('.plus-faq'); const l1 = d.querySelector('.line-1'); const m = (e) => { const t = getComputedStyle(e).transform; if (t === 'none') return 0; const v = t.match(/matrix\((.+)\)/)[1].split(',').map(parseFloat); return +(Math.atan2(v[1], v[0]) * 180 / Math.PI).toFixed(1); }; return { listH: Math.round(dl.getBoundingClientRect().height), ansOp: +parseFloat(getComputedStyle(ap).opacity).toFixed(2), plusDeg: m(pl), line1Deg: m(l1) }; });
out.faq_closed = await faq();
const tg = await p.evaluate(() => { const r = document.querySelector('.faq-dropdown .dropdown-toggle').getBoundingClientRect(); return [r.left + 100, r.top + r.height / 2]; });
await p.mouse.click(tg[0], tg[1]); await p.waitForTimeout(250); out.faq_open_250ms = await faq(); await p.waitForTimeout(900); out.faq_open_1150ms = await faq();
await p.mouse.click(tg[0], tg[1]); await p.waitForTimeout(250); out.faq_close_250ms = await faq(); await p.waitForTimeout(900); out.faq_closed_again = await faq();
for (const [k, v] of Object.entries(out)) console.log(k.padEnd(18), JSON.stringify(v));
await b.close();
