import { chromium } from 'playwright-core';
import fs from 'fs';
const [url, outfile] = process.argv.slice(2);
const SECTIONS = {
  hero: ['.section.hero.home', ['.hero-tag-wrap', '.heading-hero', '.show-wrap', '.showreal-home']],
  stats: ['.section.bg-dark.cards', ['.anim-heading-home', '.hero-cards', '.card-hero-heading._3', '.card-hero-desc.max-w-17']],
  stepsHead: ['.case--new-heading-wrap', ['.case--new-heading', '.case-heading']],
  services: ['.section.is-cases', ['.section-name', '.b1.serv-sub.max-w-40', '.hero-tag-wrap.serv', '.verticle-line', '.b1.serv-sub.second', '.service-card-wrap', '.service-card.set-1', '.service-card.set-4', '.service-card.set-2', '.service-card.set-5', '.service-card.set-3', '.service-card.set-1 .service-card-title', '.service-card.set-1 .service-card-desc']],
  clients: ['.section.is-clients', ['.brands-heading', '.big-brands-wrap', '.big-brands-top-grid', '.big-brands-down-grid', '.startups', '.heading-3', '.startup-list', '.startup-list-item', '.startup-name', '.line-startup', '.startup-desc', '.btn-secondary']],
  insights: ['.section.is-blog', ['.heading-2', '.collection-news-wrap', '.featured-img-wrap', '.news-info', '.haeding-blog', '.btn-secondary.news']],
  faq: ['.section.is-faq', ['.heading-3', '.faq-wrap', '.faq-dropdown', '.faq-question-label']],
  cta: ['.section.is-cta', ['.cta-card-wrapper', '.cta-card', '.cta-heading', '.b1.grey', '.cta-btn-wrap', '.nav_link-cta.orange', '.cta-right']],
  footer: ['.footer', ['.footer-main', '.nav-block', '.footer-col', '.links-block', '.email-link', '.social-link-list', '.footer-bot', '.copy']],
};
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto(url, { waitUntil: 'load' }); await p.waitForTimeout(6000);
await p.evaluate(() => document.querySelector('[fs-cc="allow"]')?.click());
const dh = await p.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < dh; y += 500) { await p.evaluate((yy) => window.scrollTo(0, yy), y); await p.waitForTimeout(120); }
await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(1500);
const res = await p.evaluate((S) => {
  const out = {};
  for (const [name, [secSel, kids]] of Object.entries(S)) {
    const sec = document.querySelector(secSel); if (!sec) { out[name] = null; continue; }
    const sr = sec.getBoundingClientRect();
    const o = { _section: { top: Math.round(sr.top + scrollY), h: Math.round(sr.height) } };
    for (const k of kids) {
      const e = sec.querySelector(k); if (!e) { o[k] = null; continue; }
      const r = e.getBoundingClientRect();
      o[k] = { dy: Math.round(r.top - sr.top), h: Math.round(r.height), x: Math.round(r.left), w: Math.round(r.width) };
    }
    out[name] = o;
  }
  return out;
}, SECTIONS);
fs.writeFileSync(outfile, JSON.stringify(res, null, 1));
console.log('docHeight', dh);
await b.close();
