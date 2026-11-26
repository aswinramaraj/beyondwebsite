import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const hosts = new Map(); const bad = [];
p.on('request', (r) => { const u = new URL(r.url()); hosts.set(u.host, (hosts.get(u.host) || 0) + 1); if (r.url().startsWith('http') && !u.host.startsWith('localhost')) bad.push(r.url()); });
await p.goto('http://localhost:3100/', { waitUntil: 'load' }); await p.waitForTimeout(3000);
const dh = await p.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < dh; y += 700) { await p.evaluate((yy) => window.scrollTo(0, yy), y); await p.waitForTimeout(150); }
await p.waitForTimeout(1500);
console.log('request hosts:', JSON.stringify([...hosts.entries()]));
console.log('external requests:', bad.length ? bad : 'none');
// every <img> loaded?
const broken = await p.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src));
console.log('broken images:', broken.length ? broken : 'none');
await b.close();
