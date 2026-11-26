/**
 * Sirpi (/studio) — the interactive parts of layer 2.
 *  products – an image-only showcase: hovering (pointer devices), focusing or tapping a tile opens a small detail tab
 *             (click pins it; click outside / Esc closes). Muse rotates its prompts, Hush builds its loud → phone → calm bars.
 *  pen      – when the signature section comes into view, the pen signs "Sirpi" (Catmull-Rom centre lines, eased like a hand),
 *             then lies down beside its cap. Click it to pick it up: it follows the pointer and draws ink anywhere on the page
 *             (strokes are kept in page coordinates, so they scroll with the page). "Clear ink" / "Set the pen down" / Esc.
 *  (the contest lives in contest.ts + bonfire.ts)
 */
import type { Ctx } from './film';

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const SVGNS = 'http://www.w3.org/2000/svg';

export function initInteract(ctx: Ctx) {
  const { root, reduce, on, later, every, frame } = ctx;
  const $ = (s: string) => root.querySelector(s) as HTMLElement;
  const $$ = (s: string) => Array.from(root.querySelectorAll(s)) as HTMLElement[];

  /* ================= products: image-only showcase ================= */
  // Hover (pointer devices, pure CSS) or keyboard focus opens a tile's detail tab; a click/tap pins it open.
  const tiles = $$('.sp-show');
  const setOpen = (tile: HTMLElement | null) => {
    for (const t of tiles) {
      const open = t === tile;
      t.classList.toggle('sp-is-open', open);
      t.querySelector('.sp-show__hit')?.setAttribute('aria-expanded', String(open));
    }
  };
  // the whole tile toggles (including its open tab); the hidden button inside makes it keyboard-operable (Enter/Space bubble here)
  for (const t of tiles) on(t, 'click', () => setOpen(t.classList.contains('sp-is-open') ? null : t));
  on(document, 'click', (e: Event) => { if (!(e.target as HTMLElement).closest?.('.sp-show')) setOpen(null); });
  on(window, 'keydown', (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); });
  // tiles in view: Saalai's stops slide in, Muse rotates its prompts
  const seen = new Set<HTMLElement>();
  const tileIo = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const t = e.target as HTMLElement;
      t.classList.toggle('sp-is-seen', e.isIntersecting);
      if (e.isIntersecting) seen.add(t); else seen.delete(t);
    }
  }, { threshold: 0.35 });
  tiles.forEach((t) => tileIo.observe(t));

  const museQ = $('#sp-museQ');
  const PROMPTS = ['“What if the moon<br/>ran a bakery?”', '“A lullaby for<br/>a nervous robot.”', '“Draw the smell<br/>of rain on stone.”', '“A song about the last<br/>bus home.”'];
  let mq = 0;
  every(() => {
    if (reduce || !seen.has(museQ.closest('.sp-show') as HTMLElement)) return;
    museQ.classList.add('sp-is-swap');
    later(() => { mq = (mq + 1) % PROMPTS.length; museQ.innerHTML = PROMPTS[mq]; museQ.classList.remove('sp-is-swap'); }, 500);
  }, 3200);

  const wave = $('#sp-hushWave');
  wave.textContent = '';
  for (let i = 0; i < 37; i++) {
    const b = document.createElement('i');
    if (i === 18) b.className = 'sp-phone';
    else if (i > 18) b.className = 'sp-calm';
    else {
      b.style.animationDuration = (0.35 + Math.random() * 0.6).toFixed(2) + 's';
      b.style.animationDelay = (-Math.random()).toFixed(2) + 's';
    }
    wave.appendChild(b);
  }

  /* ================= signature pen ================= */
  const sign = $('#sp-sign');
  const desk = $('#sp-desk');
  const sig = $('#sp-sig') as unknown as SVGSVGElement;
  const pen = $('#sp-pen');
  const cap = $('#sp-cap');
  const PEN_ANGLE = -32; // writing posture, nib lower-left

  // centre-line strokes in a 400×200 box
  const STROKES: number[][][] = [
    [[94, 48], [80, 34], [58, 34], [44, 50], [50, 68], [78, 84], [98, 104], [94, 132], [68, 148], [42, 144], [30, 126]], // S
    [[102, 124], [110, 104], [114, 98], [116, 124], [126, 130], [134, 112], [138, 98], [140, 126], [146, 108], [158, 98], [170, 102],
      [174, 126], [172, 160], [168, 186], [174, 140], [186, 108], [204, 100], [214, 114], [204, 128], [184, 126], [212, 118],
      [222, 100], [224, 124], [238, 130], [262, 116], [298, 94], [330, 88], [326, 108], [292, 146], [206, 168], [104, 176], [30, 168]], // irpi + flourish
    [[112, 80], [117, 78]], // i dots
    [[221, 80], [226, 78]],
  ];
  const smoothPath = (pts: number[][]) => {
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${p2[0]} ${p2[1]}`;
    }
    return d;
  };
  sig.textContent = '';
  const paths = STROKES.map((pts) => {
    const el = document.createElementNS(SVGNS, 'path');
    el.setAttribute('d', smoothPath(pts));
    sig.appendChild(el);
    const len = el.getTotalLength();
    el.style.strokeDasharray = String(len);
    el.style.strokeDashoffset = String(len);
    return { el, len };
  });

  const penAspect = 64 / 520, capAspect = 64 / 230;
  const geom = () => {
    const d = desk.getBoundingClientRect();
    const s = sig.getBoundingClientRect();
    return { d, sx: s.left - d.left, sy: s.top - d.top, k: s.width / 400, penW: pen.offsetWidth, capW: cap.offsetWidth };
  };
  const place = (el: HTMLElement, x: number, y: number, h: number, rot: number) => {
    el.style.transform = `translate(${x.toFixed(1)}px, ${(y - h / 2).toFixed(1)}px) rotate(${rot}deg)`;
  };
  function restPose() {
    const g = geom();
    const penH = g.penW * penAspect, capH = g.capW * capAspect;
    const y = g.sy + 196 * g.k + 46; // just under the signature's flourish
    const narrow = g.penW + g.capW + 48 >= g.d.width - 20;
    desk.style.height = Math.round(y + penH + (narrow ? capH + 90 : 70)) + 'px';
    let capX: number, capY: number, tipX: number;
    if (!narrow) { capX = (g.d.width - (g.penW + g.capW + 48)) / 2; tipX = capX + g.capW + 48; capY = y; }
    else { tipX = (g.d.width - g.penW) / 2; capX = tipX + 10; capY = y + penH / 2 + capH / 2 + 22; }
    place(pen, tipX, y, penH, 0);
    cap.style.transform = `translate(${capX.toFixed(1)}px, ${(capY - capH / 2).toFixed(1)}px) rotate(-3deg)`;
  }
  const writePose = (pt: DOMPoint, lift = 0) => {
    const g = geom();
    place(pen, g.sx + pt.x * g.k, g.sy + pt.y * g.k - lift, g.penW * penAspect, PEN_ANGLE);
  };

  let signState: 'idle' | 'signing' | 'ready' = 'idle';
  restPose();
  const wait = (ms: number) => new Promise<void>((r) => later(r, ms));
  const finishSign = () => {
    pen.classList.add('sp-is-moving');
    restPose();
    later(() => {
      pen.classList.remove('sp-is-moving');
      pen.classList.add('sp-is-resting');
      desk.classList.add('sp-is-ready');
      signState = 'ready';
    }, 1000);
  };
  async function signIt() {
    signState = 'signing';
    if (reduce) { paths.forEach((p) => (p.el.style.strokeDashoffset = '0')); return finishSign(); }
    pen.classList.add('sp-is-moving');
    writePose(paths[0].el.getPointAtLength(0), 10);
    await wait(1000);
    for (let i = 0; i < paths.length; i++) {
      if (ctx.dead()) return;
      const { el, len } = paths[i];
      if (i > 0) {
        pen.classList.add('sp-is-moving');
        pen.style.transitionDuration = '0.28s';
        writePose(el.getPointAtLength(0), 6);
        await wait(300);
      }
      pen.classList.remove('sp-is-moving');
      pen.style.transitionDuration = '';
      const dur = Math.max(160, len * 2.4);
      await new Promise<void>((res) => {
        const t0 = performance.now();
        const step = (now: number) => {
          if (ctx.dead()) return res();
          const t = clamp((now - t0) / dur, 0, 1);
          const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // ease in-out, like a real hand
          const at = e * len;
          el.style.strokeDashoffset = (len - at).toFixed(2);
          writePose(el.getPointAtLength(at));
          if (t < 1) requestAnimationFrame(step); else res();
        };
        requestAnimationFrame(step);
      });
    }
    await wait(250);
    finishSign();
  }
  const signIo = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      sign.classList.add('sp-is-in');
      if (signState === 'idle' && e.intersectionRatio > 0.35) signIt();
    }
  }, { threshold: [0.1, 0.35, 0.6] });
  signIo.observe(sign);

  /* ================= pen mode (ink) ================= */
  const ink = $('#sp-ink') as unknown as HTMLCanvasElement;
  const ictx = ink.getContext('2d');
  const cursor = $('#sp-penCursor');
  cursor.innerHTML = pen.innerHTML;
  const INK = '#1f4fd1';
  type Stroke = { pts: number[][]; minY: number; maxY: number };
  let strokes: Stroke[] = [];
  let drawing: Stroke | null = null;
  let penOn = false, dirty = true;
  let last = { x: 0, y: 0, t: 0, w: 3.2 };
  let dpr = 1;
  const sizeInk = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    ink.width = innerWidth * dpr; ink.height = innerHeight * dpr;
    dirty = true;
  };
  frame(() => {
    if (!dirty) return;
    dirty = false;
    ictx.setTransform(1, 0, 0, 1, 0, 0);
    ictx.clearRect(0, 0, ink.width, ink.height);
    if (!strokes.length) return;
    ictx.setTransform(dpr, 0, 0, dpr, -scrollX * dpr, -scrollY * dpr);
    ictx.strokeStyle = INK; ictx.fillStyle = INK; ictx.lineCap = 'round'; ictx.lineJoin = 'round';
    const top = scrollY - 50, bot = scrollY + innerHeight + 50;
    for (const s of strokes) {
      if (s.maxY < top || s.minY > bot) continue;
      const p = s.pts;
      if (p.length === 1) { ictx.beginPath(); ictx.arc(p[0][0], p[0][1], p[0][2] / 2, 0, 7); ictx.fill(); continue; }
      for (let i = 1; i < p.length; i++) {
        const a = p[i - 1], b = p[i], c = p[i + 1];
        const m1 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        const m2 = c ? [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2] : b;
        ictx.lineWidth = (a[2] + b[2]) / 2;
        ictx.beginPath();
        ictx.moveTo(i === 1 ? a[0] : m1[0], i === 1 ? a[1] : m1[1]);
        ictx.quadraticCurveTo(b[0], b[1], m2[0], m2[1]);
        ictx.stroke();
      }
    }
  });
  on(window, 'scroll', () => { if (strokes.length) dirty = true; }, { passive: true });

  const moveCursor = (x: number, y: number) => {
    const h = cursor.offsetWidth * penAspect;
    cursor.style.transform = `translate(${x}px, ${y - h / 2}px) rotate(${PEN_ANGLE}deg)`;
  };
  const pickUp = (e: MouseEvent) => {
    if (signState !== 'ready' || penOn) return;
    penOn = true;
    root.classList.add('sp-pen-on');
    pen.classList.add('sp-is-picked');
    if (e && e.clientX) moveCursor(e.clientX, e.clientY);
    else { const r = pen.getBoundingClientRect(); moveCursor(r.left, r.top + r.height / 2); }
  };
  const setDown = () => {
    if (!penOn) return;
    penOn = false; drawing = null;
    root.classList.remove('sp-pen-on');
    pen.classList.remove('sp-is-picked');
  };
  on(pen, 'click', pickUp);
  on($('#sp-setPen'), 'click', setDown);
  on($('#sp-clearInk'), 'click', () => { strokes = []; dirty = true; });
  on(window, 'keydown', (e: KeyboardEvent) => { if (e.key === 'Escape') setDown(); });
  on(window, 'pointermove', (e: PointerEvent) => { if (penOn) moveCursor(e.clientX, e.clientY); }, { passive: true });
  on(ink, 'pointerdown', (e: PointerEvent) => {
    if (!penOn) return;
    ink.setPointerCapture(e.pointerId);
    const x = e.clientX + scrollX, y = e.clientY + scrollY;
    drawing = { pts: [[x, y, 3.2]], minY: y, maxY: y };
    strokes.push(drawing);
    last = { x, y, t: performance.now(), w: 3.2 };
    dirty = true;
  });
  on(ink, 'pointermove', (e: PointerEvent) => {
    if (!drawing) return;
    const x = e.clientX + scrollX, y = e.clientY + scrollY, t = performance.now();
    const dist = Math.hypot(x - last.x, y - last.y);
    if (dist < 1.5) return;
    const speed = dist / Math.max(1, t - last.t); // px per ms
    const w = last.w * 0.7 + clamp(4.4 - speed * 1.1, 1.5, 4.4) * 0.3; // faster = thinner, like a felt tip
    drawing.pts.push([x, y, w]);
    drawing.minY = Math.min(drawing.minY, y); drawing.maxY = Math.max(drawing.maxY, y);
    last = { x, y, t, w };
    dirty = true;
  });
  const endStroke = () => { drawing = null; };
  on(ink, 'pointerup', endStroke);
  on(ink, 'pointercancel', endStroke);
  on(window, 'resize', () => { sizeInk(); if (signState === 'ready') restPose(); });
  sizeInk();

  return () => { signIo.disconnect(); tileIo.disconnect(); root.classList.remove('sp-pen-on'); };
}
