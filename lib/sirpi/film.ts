/**
 * Sirpi (/studio) — layer 1 and the page-level motion.
 *  film     – 1185 frames (parts 1–5 of the film, public/sirpi/frames/{d,m}) scrubbed by scroll on a fixed canvas.
 *             Frames load progressively (opening seconds, then a coarse pass over the whole film, then finer passes);
 *             until a frame arrives, its nearest loaded neighbour is drawn. Phones get the 960 px set.
 *  title    – the giant "Sirpi" is painted into the canvas so it can "difference"-blend with the film.
 *  beats    – story lines fade in and out at fixed fractions of the film (one per part).
 *  parallax – when the film ends it leaves FASTER (×1.65) than layer 2 scrolls in; [data-speed] blocks inside layer 2 lag.
 *  reveal   – the "We all are Sirpi" layer behind the page drifts into place as layer 2 lifts off it; its word cycles
 *             through "sculptor" in 18 languages.
 * Smooth scroll is Lenis with the same settings as the home and About pages. Returns a cleanup for client navigation.
 */
import Lenis from '@studio-freight/lenis';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

export type Ctx = {
  root: HTMLElement;
  reduce: boolean;
  on: (t: EventTarget, type: string, fn: Any, opts?: Any) => void;
  later: (fn: () => void, ms: number) => void;
  every: (fn: () => void, ms: number) => void;
  frame: (fn: (t: number) => void) => void; // registers a per-frame callback on the shared loop
  lenis: Any;
  dead: () => boolean;
};

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/** Shared plumbing: listeners, timers, one rAF loop and Lenis, all torn down by the returned cleanup. */
export function createCtx(root: HTMLElement): { ctx: Ctx; destroy: () => void } {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const offs: Array<() => void> = [];
  const callbacks: Array<(t: number) => void> = [];
  let dead = false;
  let lenis: Any = null;
  if (!reduce) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.7, gestureOrientation: 'vertical', normalizeWheel: false, smoothTouch: false } as Any);
  }
  let raf = 0;
  const loop = (t: number) => {
    if (lenis) lenis.raf(t);
    for (const cb of callbacks) cb(t);
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  const ctx: Ctx = {
    root,
    reduce,
    lenis,
    on: (t, type, fn, opts) => { t.addEventListener(type, fn, opts); offs.push(() => t.removeEventListener(type, fn, opts)); },
    later: (fn, ms) => { const id = window.setTimeout(() => { if (!dead) fn(); }, ms); offs.push(() => clearTimeout(id)); },
    every: (fn, ms) => { const id = window.setInterval(fn, ms); offs.push(() => clearInterval(id)); },
    frame: (fn) => { callbacks.push(fn); },
    dead: () => dead,
  };
  return {
    ctx,
    destroy: () => {
      dead = true;
      cancelAnimationFrame(raf);
      offs.forEach((f) => f());
      if (lenis) lenis.destroy();
    },
  };
}

// Five parts of the film, back to back.
const CHAPTERS = [
  { name: 'Stone', len: 300 },   // part 1
  { name: 'Wheel', len: 285 },   // part 2
  { name: 'Machine', len: 285 }, // part 3
  { name: 'Silicon', len: 285 }, // part 4
  { name: 'Sky', len: 30 },      // part 5
].map((c, i, a) => ({ ...c, start: a.slice(0, i).reduce((s, x) => s + x.len, 0) }));
const FRAME_COUNT = CHAPTERS.reduce((s, c) => s + c.len, 0); // 1185
const FILM_SPEED = 1.65; // layer 1 leaves this much faster than layer 2 (1.0)

const WORDS: Array<[string, string]> = [
  ['Sirpi', 'Tamil · transliterated'], ['சிற்பி', 'Tamil'], ['शिल्पी', 'Hindi'], ['Sculptor', 'English'],
  ['శిల్పి', 'Telugu'], ['Escultor', 'Spanish'], ['ശില്പി', 'Malayalam'], ['Sculpteur', 'French'],
  ['ಶಿಲ್ಪಿ', 'Kannada'], ['彫刻家', 'Japanese'], ['শিল্পী', 'Bengali'], ['Bildhauer', 'German'],
  ['조각가', 'Korean'], ['نحّات', 'Arabic'], ['Scultore', 'Italian'], ['雕塑家', 'Chinese'],
  ['Скульптор', 'Russian'], ['Γλύπτης', 'Greek'],
];
const GLYPHS = Array.from('அஆஇஈஉஊஎஏஐஒகஙசஞடணதநபமயரலவழளறனअआइईउऊएऐओकखगघचछजझटठडढणतथदधनపమయరలవకఖగഅആഇഈഉകഖഗಅಆಇಈಕಖಗঅআইকখগabcdefghijklmnopqrstuvwxyz01');

export function initFilm(ctx: Ctx) {
  const { root, reduce, on, later, every, frame, lenis } = ctx;
  const $ = (s: string) => root.querySelector(s) as HTMLElement;
  const $$ = (s: string) => Array.from(root.querySelectorAll(s)) as HTMLElement[];

  const film = $('#sp-film');
  const canvas = $('#sp-filmCanvas') as unknown as HTMLCanvasElement;
  const c2d = canvas.getContext('2d');
  const hero = $('.sp-hero');
  const heroSticky = $('.sp-hero__sticky');
  const beats = $$('.sp-beat');
  const layer2 = $('#sp-layer2');
  const footerBg = $('#sp-footerBg');
  const siteFooter = $('.sp-site-footer');
  const loader = $('#sp-loader');
  const titleEl = $('.sp-hero__word');

  const SET = Math.min(screen.width, innerWidth) < 900 ? 'm' : 'd'; // 960 px frames on phones, 1600 px on desktop
  const PX_PER_FRAME = SET === 'm' ? 6 : 9;
  const framePath = (i: number) => `/sirpi/frames/${SET}/${String(i + 1).padStart(4, '0')}.webp`;

  /* ── loader: hold scrolling until the opening frames and a coarse pass are in ── */
  const html = document.documentElement;
  const prevOverflow = html.style.overflow;
  html.style.overflow = 'hidden';
  if (lenis) lenis.stop();
  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    later(() => {
      loader.classList.add('sp-is-done');
      html.style.overflow = prevOverflow;
      if (lenis) lenis.start();
    }, 250);
  };
  const restoreScroll = () => { html.style.overflow = prevOverflow; };

  /* ── progressive preload ── */
  const frames: HTMLImageElement[] = new Array(FRAME_COUNT);
  const ready = new Uint8Array(FRAME_COUNT);
  const queued = new Uint8Array(FRAME_COUNT);
  const queue: number[] = [];
  const push = (i: number) => { if (i < FRAME_COUNT && !queued[i]) { queued[i] = 1; queue.push(i); } };
  for (let i = 0; i < 90; i++) push(i);
  for (const step of [16, 8, 4, 2, 1]) for (let i = 0; i < FRAME_COUNT; i += step) push(i);
  const GATE = queue.indexOf(16 * Math.floor((FRAME_COUNT - 1) / 16)) + 1;
  let loadedCount = 0;
  let current = 0;
  const loaderBar = $('#sp-loaderBar');
  const loaderPct = $('#sp-loaderPct');
  const loadNext = () => {
    if (ctx.dead()) return;
    const i = queue.shift();
    if (i === undefined) return;
    const img = new Image();
    img.decoding = 'async';
    img.onload = img.onerror = () => {
      if (ctx.dead()) return;
      if (img.naturalWidth) ready[i] = 1;
      loadedCount++;
      if (!released) {
        const pct = Math.min(100, Math.round((loadedCount / GATE) * 100));
        loaderBar.style.width = pct + '%';
        loaderPct.textContent = String(pct);
        if (loadedCount >= GATE) release();
      }
      if (i === 0 || Math.abs(i - Math.round(current)) < 20) drawFrame(Math.round(current), true);
      loadNext();
    };
    img.src = framePath(i);
    frames[i] = img;
  };
  for (let k = 0; k < 8; k++) loadNext();
  later(release, 15000); // never hold the page hostage on a slow network

  const nearestReady = (i: number) => {
    if (ready[i]) return i;
    for (let d = 1; d < FRAME_COUNT; d++) {
      if (i - d >= 0 && ready[i - d]) return i - d;
      if (i + d < FRAME_COUNT && ready[i + d]) return i + d;
    }
    return -1;
  };

  /* ── canvas ── */
  let cw = 0, ch = 0, drawn = -1;
  let titleAlpha = 1, titleAt = -1;
  function drawTitle() {
    if (titleAlpha <= 0.001 || !titleEl) return;
    const dpr = cw / innerWidth;
    const cs = getComputedStyle(titleEl);
    const size = parseFloat(cs.fontSize) * dpr;
    const r = titleEl.getBoundingClientRect();
    c2d.save();
    c2d.globalCompositeOperation = 'difference';
    c2d.globalAlpha = titleAlpha;
    c2d.fillStyle = '#fff';
    c2d.font = `500 ${size}px "Itcavantgardestd Md", sans-serif`;
    if ('letterSpacing' in c2d) (c2d as Any).letterSpacing = `${parseFloat(cs.letterSpacing || '0') * dpr}px`;
    c2d.textBaseline = 'alphabetic';
    c2d.fillText(titleEl.textContent || '', r.left * dpr, r.bottom * dpr - size * 0.06);
    c2d.restore();
  }
  function drawFrame(want: number, force = false) {
    const i = nearestReady(want);
    if (i < 0) return;
    if (i === drawn && !force) return;
    drawn = i;
    const img = frames[i];
    const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * s, h = img.naturalHeight * s;
    c2d.fillStyle = '#efede8';
    c2d.fillRect(0, 0, cw, ch);
    c2d.drawImage(img, (cw - w) / 2, (ch - h) * 0.4, w, h);
    drawTitle();
  }
  function sizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cw = canvas.width = Math.round(innerWidth * dpr);
    ch = canvas.height = Math.round(innerHeight * dpr);
    c2d.imageSmoothingEnabled = true;
    c2d.imageSmoothingQuality = 'high';
    drawFrame(drawn < 0 ? 0 : drawn, true);
  }
  const sizeHero = () => { hero.style.height = FRAME_COUNT * PX_PER_FRAME + innerHeight + 'px'; };

  /* ── layer-2 parallax targets ── */
  let parallax: Array<{ el: HTMLElement; speed: number; center: number }> = [];
  function measure() {
    const k = innerWidth < 900 ? 0.35 : 1; // gentler on phones, where blocks stack
    parallax = $$('[data-speed]').map((el) => {
      el.style.transform = '';
      const r = el.getBoundingClientRect();
      return { el, speed: (parseFloat(el.dataset.speed || '0') || 0) * k, center: r.top + scrollY + r.height / 2 };
    });
  }

  /* ── the per-frame update ── */
  frame(() => {
    const vh = innerHeight;
    const y = scrollY;
    const heroTop = hero.getBoundingClientRect().top + y;
    const heroEnd = heroTop + hero.offsetHeight - vh;
    const p = clamp((y - heroTop) / (heroEnd - heroTop));

    // 1) scrub
    const target = p * (FRAME_COUNT - 1);
    current = reduce ? target : current + (target - current) * 0.18;
    if (Math.abs(target - current) < 0.01) current = target;
    const tA = clamp(1 - p / 0.05);
    const titleChanged = (tA > 0.001 && Math.abs(p - titleAt) > 0.0002) || Math.abs(tA - titleAlpha) > 0.002;
    titleAlpha = tA; titleAt = p;
    drawFrame(Math.round(current), titleChanged);

    // 2) story beats
    for (const b of beats) {
      const a = parseFloat(b.dataset.in), z = parseFloat(b.dataset.out);
      const t = (p - a) / (z - a);
      let o = 0;
      if (t >= 0 && t <= 1) o = Math.min(a === 0 ? 1 : clamp(t / 0.25), clamp((1 - t) / 0.25));
      b.style.opacity = o.toFixed(3);
      const shift = a === 0 ? -t * 120 : (0.5 - t) * 80;
      b.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`;
    }

    // 3) layer 1 leaves faster than layer 2 arrives
    const d = Math.max(0, y - heroEnd);
    if (d > 0) {
      const k = clamp(d / vh);
      film.style.transform = `translate3d(0, ${(-d * FILM_SPEED).toFixed(1)}px, 0) scale(${(1 - k * 0.06).toFixed(4)})`;
      film.style.borderRadius = `0 0 ${Math.round(k * 40)}px ${Math.round(k * 40)}px`;
      heroSticky.style.transform = `translate3d(0, ${(-d * (FILM_SPEED - 1)).toFixed(1)}px, 0)`;
      film.classList.toggle('sp-is-gone', d * FILM_SPEED > vh * 1.15);
    } else {
      film.style.transform = '';
      film.style.borderRadius = '';
      heroSticky.style.transform = '';
      film.classList.remove('sp-is-gone');
    }

    // 4) per-block parallax inside layer 2 (positive speed = lags behind)
    if (!reduce) {
      const mid = y + vh / 2;
      for (const it of parallax) {
        if (Math.abs(it.center - mid) < vh * 1.6) it.el.style.transform = `translate3d(0, ${((it.center - mid) * it.speed).toFixed(1)}px, 0)`;
      }
    }

    // 5) "We all are Sirpi" drifts into place as layer 2 lifts off it
    const r = clamp((vh - layer2.getBoundingClientRect().bottom) / vh);
    // …and moves up again with the site footer, so the footer never covers the word
    const overlap = Math.max(0, vh - siteFooter.getBoundingClientRect().top);
    footerBg.style.transform = `translate3d(0, ${((r - 1) * vh * 0.35 - overlap * 0.6).toFixed(1)}px, 0)`;
    footerBg.style.opacity = (0.15 + r * 0.85).toFixed(3);
  });

  /* ── "We all are ___" ── */
  const wordEl = $('#sp-sirpiWord');
  const langEl = $('#sp-sirpiLang');
  let wi = 0;
  const fitWord = () => {
    wordEl.style.fontSize = '';
    const max = footerBg.clientWidth - parseFloat(getComputedStyle(footerBg).paddingLeft) * 2;
    const w = wordEl.scrollWidth;
    if (w > max) wordEl.style.fontSize = (parseFloat(getComputedStyle(wordEl).fontSize) * max) / w + 'px';
  };
  every(() => {
    wordEl.classList.add('sp-is-out');
    later(() => {
      wi = (wi + 1) % WORDS.length;
      const [w, lang] = WORDS[wi];
      wordEl.textContent = w;
      wordEl.dir = lang === 'Arabic' ? 'rtl' : 'ltr';
      langEl.textContent = lang;
      wordEl.classList.remove('sp-is-out');
      wordEl.classList.add('sp-is-in');
      fitWord();
      void wordEl.offsetWidth;
      wordEl.classList.remove('sp-is-in');
    }, 450);
  }, reduce ? 3500 : 2200);

  /* ── Yali: a field of glyphs from many scripts, lighting up ── */
  const glyphBox = $('#sp-glyphs');
  const buildGlyphs = () => {
    const r = glyphBox.getBoundingClientRect();
    const n = Math.ceil((r.width + 12) / 34) * Math.ceil((r.height + 12) / 34);
    glyphBox.textContent = '';
    const frag = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span');
      s.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0];
      frag.appendChild(s);
    }
    glyphBox.appendChild(frag);
  };
  let glyphsOn = false;
  const io = new IntersectionObserver(([e]) => { glyphsOn = e.isIntersecting && !reduce; });
  io.observe(glyphBox);
  every(() => {
    if (!glyphsOn) return;
    const spans = glyphBox.children;
    if (!spans.length) return;
    for (let k = 0; k < 5; k++) {
      const s = spans[(Math.random() * spans.length) | 0] as HTMLElement;
      s.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0];
      const cls = Math.random() < 0.15 ? 'sp-gold' : 'sp-on';
      s.classList.add(cls);
      later(() => s.classList.remove(cls), 120 + Math.random() * 300);
    }
  }, 90);

  /* ── boot ── */
  const onResize = () => { sizeHero(); sizeCanvas(); measure(); buildGlyphs(); fitWord(); };
  let rt = 0;
  on(window, 'resize', () => { clearTimeout(rt); rt = window.setTimeout(onResize, 120); });
  on(window, 'load', measure);
  document.fonts?.ready.then(() => { if (!ctx.dead()) { measure(); fitWord(); drawFrame(drawn < 0 ? 0 : drawn, true); } });
  onResize();

  return () => { io.disconnect(); clearTimeout(rt); restoreScroll(); };
}
