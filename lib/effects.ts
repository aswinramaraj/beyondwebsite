/**
 * Ports of the original page's inline scripts (see outcrowd_scrape/code/inline-scripts.js) plus glue:
 *  Lenis smooth scroll · SplitType + GSAP character reveals · nav theme / collapse · showreel expansion ·
 *  "explode" button hover · magnetic social icons · service-card spotlight ·
 *  dropdowns (FAQ) · preloader session logic · cookie notice · in-page anchors.
 * The Webflow interaction engine itself lives in ./ix2.ts.
 */
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import { initIx2 } from './ix2';
import { adaptStages } from './stages';
import { compensateHeights } from './compensate';

type Any = any;
const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector(s) as T | null;
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll(s)) as T[];

export function initEffects(): () => void {
  const cleanups: Array<() => void> = [];
  let dead = false;
  const on = (t: EventTarget, ev: string, fn: (e: Any) => void, o?: AddEventListenerOptions) => {
    t.addEventListener(ev, fn, o);
    cleanups.push(() => t.removeEventListener(ev, fn, o));
  };
  gsap.registerPlugin(ScrollTrigger);

  /* ── Lenis (same options as the original) ── */
  const lenis: Any = new Lenis({
    lerp: 0.09,
    smoothWheel: true,
    wheelMultiplier: 0.7,
    gestureOrientation: 'vertical',
    normalizeWheel: false,
    smoothTouch: false,
  } as Any);
  (window as Any).__lenis = lenis;
  let raf = 0;
  const loop = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
  raf = requestAnimationFrame(loop);
  cleanups.push(() => { cancelAnimationFrame(raf); lenis.destroy(); });
  const hashTarget = () => (location.hash.length > 1 ? $(location.hash) : null);
  const toTop = () => { if (window.innerWidth > 767 && !hashTarget()) setTimeout(() => lenis.scrollTo(0, { immediate: true }), 0); };
  if (document.readyState === 'complete') toTop(); else on(window, 'load', toTop);

  /* ── in-page anchors via Lenis ── */
  const OFFSETS: Record<string, number> = { '#results': -90 };
  on(document, 'click', (e: MouseEvent) => {
    const a = (e.target as HTMLElement).closest('a[href^="#"], a[href^="/#"]') as HTMLAnchorElement | null;
    if (!a) return;
    let id = a.getAttribute('href') || '#';
    if (id.startsWith('/#')) { if (location.pathname !== '/') return; id = id.slice(1); } // header "Contact" etc.
    if (id === '#') { e.preventDefault(); return; }
    const el = id === '#top' ? null : $(id);
    if (id !== '#top' && !el) return;
    e.preventDefault();
    lenis.scrollTo(id === '#top' ? 0 : (el as HTMLElement), { offset: OFFSETS[id] ?? 0 });
    if (a.dataset.blFocus) setTimeout(() => $('#bl-first-name')?.focus({ preventScroll: true }), 1400);
  });

  (async () => {
    try { await (document as Any).fonts?.ready; } catch { /* ignore */ }
    if (dead) return;

    /* ── interaction engine ── */
    adaptStages();
    compensateHeights();
    cleanups.push(initIx2());

    /* ── preloader (session logic from the original) ── */
    const preloader = $('#preloader');
    const start = $('#startPreloader');
    on(window, 'beforeunload', () => sessionStorage.setItem('preloaderClicked', 'false'));
    const seen = sessionStorage.getItem('preloaderClicked');
    if (!seen || seen === 'false') { start?.click(); sessionStorage.setItem('preloaderClicked', 'true'); }
    else if (preloader) preloader.style.display = 'none';

    /* ── character reveals (SplitType + GSAP, parameters from the original) ── */
    const reveal = (sel: string) => {
      if (!$(sel)) return;
      if (window.innerWidth >= 767) {
        new SplitType(sel, { types: 'lines,words,chars', tagName: 'span' });
        gsap.from(`${sel} .char`, {
          opacity: 0, duration: 2, ease: 'power2.out', stagger: 0.05,
          scrollTrigger: { trigger: sel, start: 'top 90%', end: 'bottom 20%', scrub: true },
        });
      } else {
        new SplitType(sel, { types: 'lines,words,chars', tagName: 'span' });
        const io = new IntersectionObserver((entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) gsap.from(en.target.querySelectorAll('.char'), { opacity: 0, duration: 0.25, ease: 'power2.inOut', stagger: 0.03 });
          });
        }, { threshold: 0.1 });
        $$(sel).forEach((el) => io.observe(el));
        cleanups.push(() => io.disconnect());
      }
    };
    reveal('[animate]');
    reveal('[animate-2]');
    learnHeading();
    const refresh = () => ScrollTrigger.refresh();
    if (document.readyState === 'complete') setTimeout(refresh, 300); else on(window, 'load', () => setTimeout(refresh, 300));

    navBehaviour();
    showreel();
    explodeHovers();
    magnets();
    spotlight();
    dropdowns();
    cookieNotice();
    checkHeight();

    // arrived with a #hash (e.g. the header's Contact button from another page): go there, and check again a couple of times
    // while the layout settles (fonts, pinned sections) – unless the visitor has already started scrolling themselves
    const target = hashTarget();
    if (target) {
      let touched = false;
      for (const ev of ['wheel', 'touchstart', 'keydown', 'pointerdown']) window.addEventListener(ev, () => { touched = true; }, { once: true, passive: true });
      const settle = () => {
        if (touched || dead) return;
        const off = OFFSETS[location.hash] ?? 0;
        if (Math.abs((target as HTMLElement).getBoundingClientRect().top + off) > 4) lenis.scrollTo(target as HTMLElement, { offset: off, immediate: true });
      };
      [400, 1200, 2600].forEach((ms) => setTimeout(settle, ms));
    }
  })();

  /* ───────────── bottom dock: theme by the section behind it + active in-page link ───────────── */
  /* "Beyond the classroom": the same reveal as the "Focus" word (IX2 a-100 on .section.is-cases): the word fades in while a page-coloured
     gradient wipes down off it. The original runs it over section progress 12→20 % (fade) and 12→23 % (wipe), i.e. while the word's top
     travels from ~46 % to ~−4 % of the viewport; the same distances are used here with GSAP. */
  function learnHeading() {
    const wrap = $('.bl-learn-title-wrap');
    if (!wrap) return;
    const word = $('.bl-learn-title', wrap), shade = $('.shadow', wrap);
    if (!word || !shade) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // shown as is
    const tl = gsap.timeline({ scrollTrigger: { trigger: wrap, start: 'top 46%', end: 'top -4%', scrub: 0.6 } });
    tl.fromTo(word, { opacity: 0 }, { opacity: 1, duration: 8, ease: 'none' }, 0)
      .fromTo(shade, { yPercent: -49 }, { yPercent: 38, duration: 11, ease: 'none' }, 0);
    cleanups.push(() => { tl.scrollTrigger?.kill(); tl.kill(); });
  }

  function navBehaviour() {
    const dock = $('.nav-new') as HTMLElement | null;
    if (!dock) return;
    const hoverTxt = $$('.nav-new .footer-nav-link.hover');
    const sections = $$('[section-color]');
    const links = $$('.nav-menu .footer-link') as HTMLAnchorElement[];
    const targets = links.map((a) => $(a.getAttribute('href') || '#'));
    const stops = ['#clients', '#book-a-demo'].map((q) => $(q)).filter(Boolean) as HTMLElement[]; // partners/why and the demo form

    const theme = () => {
      const r = dock.getBoundingClientRect();
      const mid = (r.top + r.bottom) / 2;
      let color = 'white';
      sections.forEach((s) => {
        const sr = s.getBoundingClientRect();
        if (mid >= sr.top && mid <= sr.bottom) color = s.getAttribute('section-color') || color;
      });
      const black = color === 'black';
      dock.style.backgroundColor = black ? '#191919' : '#FAFAFA';
      dock.dataset.theme = black ? 'dark' : 'light';
      hoverTxt.forEach((el) => (el.style.color = black ? '#fff' : '#080808'));
    };
    const active = () => {
      const line = window.innerHeight * 0.45;
      // the current section = the last anchor whose top has passed the line; "stops" are sections with no link of their own,
      // so while one of them is on screen no link is highlighted
      let cur = -1, best = -Infinity;
      targets.forEach((t, i) => { if (!t) return; const top = t.getBoundingClientRect().top; if (top <= line && top > best) { best = top; cur = i; } });
      stops.forEach((st) => { const top = st.getBoundingClientRect().top; if (top <= line && top > best) { best = top; cur = -1; } });
      links.forEach((a, i) => a.classList.toggle('is-active', i === cur));
    };
    // Landing screen (top of the page): always expanded. Below it: compact (logo · Book a call · Contact), expanding while the visitor
    // scrolls DOWN and folding back ~1 s after the scrolling stops, or straight away on a scroll up. While the pointer is on the bar or a
    // link in it has keyboard focus it stays open, so the links can actually be reached once they appear.
    const FOLD_AFTER = 1000;
    let lastY = window.scrollY || 0, foldTimer = 0, hold = false, landing = true;
    const setCompact = (c: boolean) => { if (dock.classList.contains('is-compact') !== c) dock.classList.toggle('is-compact', c); };
    const scheduleFold = (ms = FOLD_AFTER) => {
      clearTimeout(foldTimer);
      foldTimer = window.setTimeout(() => { if (!hold && !landing) setCompact(true); }, ms);
    };
    const compactCheck = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      const dy = y - lastY;
      lastY = y;
      landing = landing ? y <= window.innerHeight * 0.3 : y <= window.innerHeight * 0.12; // hysteresis: no flicker at the edge
      if (landing) { clearTimeout(foldTimer); setCompact(false); return; }
      if (dy > 1) { setCompact(false); scheduleFold(); }            // scrolling down: show the links
      else if (dy < -1 && !hold) { clearTimeout(foldTimer); setCompact(true); } // scrolling up: fold
    };
    const holdOpen = () => { hold = true; clearTimeout(foldTimer); setCompact(false); };
    const release = () => { hold = false; if (!landing) scheduleFold(); };
    on(dock, 'pointerenter', holdOpen);
    on(dock, 'pointerleave', release);
    on(dock, 'focusin', holdOpen);
    on(dock, 'focusout', (e: FocusEvent) => { if (!dock.contains(e.relatedTarget as Node | null)) release(); });
    cleanups.push(() => clearTimeout(foldTimer));
    const update = () => { theme(); active(); compactCheck(); };
    update();
    if (!landing) setCompact(true); // opened further down the page (e.g. #book-a-demo): start folded
    on(window, 'scroll', update, { passive: true });
    on(window, 'resize', update);
  }

  /* ───────────── showreel grows from 48 % to full width (script block 35) ───────────── */
  function showreel() {
    const home = $('.showreal-home');
    const video = $('.show-real-video');
    const lap = $('.lap-top-bg');
    const trigger = $('.section.hero.home');
    if (!home || !video || !lap || !trigger) return;
    const f = () => {
      if (window.innerWidth <= 767) return;
      const frac = window.scrollY / trigger.offsetHeight;
      const startSize = window.innerWidth >= 1921 ? 60 : 48;
      const endSize = 100;
      if (frac <= 0.2) {
        home.style.width = `${startSize}%`;
        home.style.borderRadius = '1.7vw';
        video.style.borderRadius = '1.2vw';
        lap.style.borderRadius = '1.7vw';
      } else if (frac <= 0.33) {
        const p = (frac - 0.2) / 0.13;
        home.style.width = `${startSize + (endSize - startSize) * p}%`;
        home.style.borderRadius = `${1.7 - 1.7 * p}vw`;
        video.style.borderRadius = `${1.2 - 1.2 * p}vw`;
        lap.style.borderRadius = `${1.7 - 1.7 * p}vw`;
      } else {
        home.style.width = `${endSize}%`;
        home.style.borderRadius = '0vw';
        video.style.borderRadius = '0vw';
        lap.style.borderRadius = '0vw';
      }
    };
    on(document, 'scroll', f, { passive: true });
  }

  /* ───────────── "explode" colour-fill hover (script blocks 7, 8, 15, 17, 25–28, 24) ───────────── */
  function explodeHovers() {
    const make = (sel: string, scale: number, text?: { on: string; off: string }) => {
      $$(sel).forEach((btn) => {
        const explode = $('.explode', btn);
        const txt = $('.btn-text', btn);
        if (!explode) return;
        on(btn, 'mousemove', (e: MouseEvent) => {
          const r = btn.getBoundingClientRect();
          explode.style.left = `${e.clientX - r.left}px`;
          explode.style.top = `${e.clientY - r.top}px`;
          explode.style.transform = `scale(${scale})`;
          if (txt && text) txt.style.color = text.on;
        });
        on(btn, 'mouseleave', () => {
          explode.style.transform = 'scale(.1)';
          if (txt && text) txt.style.color = text.off;
        });
      });
    };
    make('.nav_link-c', 50, { on: 'white', off: '' });
    make('.nav_link-cta', 70, { on: '#fff', off: '' });
    make('.social-footer', 20);
    make('.button-main', 50, { on: 'white', off: '#080808' });
    make('[button-main-text-white]', 50, { on: 'white', off: '' });
    make('[button-main-text-white-big]', 70, { on: 'white', off: '' });
    const check = () => {
      $$('.explode').forEach((ex) => {
        const tf = getComputedStyle(ex).transform;
        if (tf !== 'none') {
          const m = tf.match(/matrix.*\((.+)\)/);
          if (!m) return;
          ex.style.opacity = parseFloat(m[1].split(', ')[0]) <= 0.1 ? '0' : '1';
        }
      });
    };
    const id = setInterval(check, 100);
    cleanups.push(() => clearInterval(id));
    check();
  }

  /* ───────────── magnetic social icons (script block 18, strength 10) ───────────── */
  function magnets() {
    $$('.social-footer-wrap').forEach((m) => {
      on(m, 'mousemove', (e: MouseEvent) => {
        const r = m.getBoundingClientRect();
        const dx = ((e.clientX - (r.left + r.width / 2)) / r.width) * 10;
        const dy = ((e.clientY - (r.top + r.height / 2)) / r.height) * 10;
        m.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      on(m, 'mouseleave', () => { m.style.transform = 'translate(0, 0)'; });
    });
  }

  /* ───────────── service-card spotlight follows the pointer (script block 13) ───────────── */
  function spotlight() {
    const cards = $('#cards');
    if (!cards) return;
    cards.onmousemove = (e: MouseEvent) => {
      $$('.service-card').forEach((c) => {
        const r = c.getBoundingClientRect();
        c.style.setProperty('--mouse-x', `${e.clientX - r.left}px`);
        c.style.setProperty('--mouse-y', `${e.clientY - r.top}px`);
      });
    };
  }

  /* ───────────── Webflow-style dropdowns (FAQ); IX2 listens for our open/close events ───────────── */
  function dropdowns() {
    const dds = $$('.w-dropdown');
    const setOpen = (dd: HTMLElement, open: boolean) => {
      const toggle = $('.w-dropdown-toggle', dd) as HTMLElement;
      const list = $('.w-dropdown-list', dd) as HTMLElement;
      const was = dd.classList.contains('w--open');
      if (was === open) return;
      [dd, toggle, list].forEach((n) => n.classList.toggle('w--open', open));
      toggle.setAttribute('aria-expanded', String(open));
      dd.dispatchEvent(new CustomEvent(open ? 'w-dd-open' : 'w-dd-close'));
    };
    dds.forEach((dd) => {
      const toggle = $('.w-dropdown-toggle', dd) as HTMLElement;
      on(toggle, 'click', () => setOpen(dd, !dd.classList.contains('w--open')));
      on(toggle, 'keydown', (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(dd, !dd.classList.contains('w--open')); } });
    });
    on(document, 'click', (e: MouseEvent) => dds.forEach((dd) => { if (!dd.contains(e.target as Node)) setOpen(dd, false); }));
    on(document, 'keydown', (e: KeyboardEvent) => { if (e.key === 'Escape') dds.forEach((dd) => setOpen(dd, false)); });
  }

  /* ───────────── cookie notice: the original clicks a hidden trigger twice (show → hide) ───────────── */
  function cookieNotice() {
    const trigger = $('.fs-cc-banner_trigger');
    const ok = $('[fs-cc="allow"]');
    if (!trigger || !ok) return;
    let acked = false;
    try { acked = !!localStorage.getItem('bl-cookie-ack'); } catch { /* ignore */ }
    if (!acked) setTimeout(() => trigger.click(), 1200);
    on(ok, 'click', (e: Event) => {
      e.preventDefault();
      trigger.click();
      try { localStorage.setItem('bl-cookie-ack', '1'); } catch { /* ignore */ }
    });
  }

  /* ───────────── tweak for 800–840 px tall viewports (script block 12) ───────────── */
  function checkHeight() {
    const el = $('.cards-cases-left-wrap');
    if (!el) return;
    const f = () => el.classList.toggle('height', window.innerHeight >= 800 && window.innerHeight <= 840);
    f();
    on(window, 'resize', f);
  }

  return () => {
    dead = true;
    cleanups.forEach((c) => { try { c(); } catch { /* ignore */ } });
  };
}
