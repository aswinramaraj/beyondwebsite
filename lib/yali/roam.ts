/**
 * Yali, the Beyondlogik pet, loose on every page (mounted in app/layout.tsx by components/YaliPet.tsx). It replaces the header
 * mascot: on every page load it takes off from beside the Contact button.
 *
 *  flight – roams the viewport with smooth steering and a gentle bob, turning to face where it flies.
 *  under  – it is drawn with mix-blend-mode: multiply, so on the white pages every glyph shows through it: it reads as flying
 *           UNDER the text and cards. While it bites or breathes fire it switches to normal blending and is clearly in front.
 *  wake   – text it passes under drifts away and cards nudge away (individual `translate` / `rotate`, eased per element).
 *           Elements another script animates (an inline transform, a Webflow data-w-id, GSAP) are never touched.
 *  bite   – every 7–12 s it may fly to a visible button and bite it: a tooth-scalloped chunk is masked out, crumbs fall, the
 *           button shakes. Each bite goes deeper (max 3 per button). Bitten buttons still work and heal after 30 s.
 *  fire   – or it hovers and breathes fire: the space in front of it is charred dark for 2 s, then fades.
 *           Hovering / focusing the header's Contact button calls it over to breathe fire at it (event 'yali:fire-at').
 * Off on phones (< 768 px) and with prefers-reduced-motion (the header then shows its static mascot poster).
 * Add ?yali to the URL for a test hook: window.__yali.bite() / .fire() / .goto(x, y) / .hold() / .state().
 */
import type { MascotHandle } from '@/components/Mascot';

export type RoamOpts = {
  pet: HTMLElement;      // fixed, moving box (4:3 — frames the model exactly)
  flip: HTMLElement;     // inner wrapper that is mirrored to face left
  shadow: HTMLElement;   // soft shadow on the page below
  fx: HTMLElement;       // absolute layer in document coordinates for scorch marks and crumbs
  mascot: () => MascotHandle | null;
  phase: () => string;   // the pet's current clip phase ('fly', 'Bite', 'Fire', …), from <Mascot onPhase>
};

// Where things are inside the pet box, as fractions of its size, when it faces right (measured from screenshots of the flying pose).
const MOUTH = { x: 0.63, y: 0.47 }; // trunk tip
const BODY = { x: 0.55, y: 0.42 };  // centre used for the wake
const FIRE = { x: 1.05, y: 0.6 };   // centre of the scorch, in front of the trunk
const BITE_SNAP = 0.4;               // s into the Bite clip when the jaws close
const FIRE_LIT = 0.55;               // s into the Fire clip when the flames are out
const EXTRA_TARGETS = '.sp-vote, .sp-show__plus';
const TEXT = 'h1, h2, h3, h4, p, li, blockquote, figcaption';
const CARDS = '[class*="card"], [class*="tile"], article, .sp-show, .sp-board li, .sp-clock span, .sp-entry';
const NEVER = '.bl-mascot, .yl-pet, .bl-top-menu, [data-w-id], [aria-hidden="true"]';

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const rand = (a: number, b: number) => a + Math.random() * (b - a);

type Bitten = { el: HTMLElement; bites: string[]; side: 1 | -1; depth: number; healAt: number };
type Wake = { x: number; y: number; r: number; tx: number; ty: number; tr: number };

/** a link or button that looks like a button: solid background, rounded, button-sized */
function isButtonLike(el: HTMLElement) {
  if (el.matches(EXTRA_TARGETS)) return true;
  if (el.closest(NEVER) || el.closest('.sp-pen, .sp-penbar, .bl-burger')) return false;
  const r = el.getBoundingClientRect();
  if (r.width < 56 || r.width > 460 || r.height < 26 || r.height > 96) return false;
  const cs = getComputedStyle(el);
  const bg = cs.backgroundColor;
  const solid = bg && !/rgba?\([^)]*,\s*0\)$/.test(bg) && bg !== 'transparent';
  return !!solid && parseFloat(cs.borderTopLeftRadius) >= 6 && cs.visibility !== 'hidden' && +cs.opacity > 0.5;
}

export function initRoam(o: RoamOpts): () => void {
  const { pet, flip, shadow, fx } = o;

  let W = 0, H = 0;
  const size = () => { W = pet.offsetWidth; H = pet.offsetHeight; };
  size();

  // take off from beside the Contact button (where the header mascot used to sit), else fly in from the right
  let x = innerWidth + 60, y = innerHeight * 0.25;
  const contact = document.querySelector('.bl-contact') as HTMLElement | null;
  const cr = contact?.getBoundingClientRect();
  if (cr && cr.bottom > 0 && cr.top < innerHeight) { x = cr.left - W * 0.95; y = cr.top - H * 0.3; }
  let vx = 0, vy = 0, face: 1 | -1 = 1;
  let tx = x, ty = y;
  let mode: 'roam' | 'approach' | 'bite' | 'fire' | 'fireAt' | 'retreat' = 'roam';
  let modeT = 0, clipT = -1, clock = 0, nextAction = rand(5, 8), fireCool = 0;
  let target: { el: HTMLElement; side: 1 | -1 } | null = null;
  let did = false;
  const bitten = new Map<HTMLElement, Bitten>();
  const wakes = new Map<HTMLElement, Wake>();
  let raf = 0, last = performance.now(), dead = false;

  const pickSpot = () => {
    const m = 40;
    tx = rand(m, Math.max(m, innerWidth - W - m));
    ty = rand(innerHeight * 0.08, Math.max(innerHeight * 0.08, innerHeight - H - m));
  };
  window.setTimeout(pickSpot, 900); // hover a moment where it took off, then go
  const setMode = (m: typeof mode) => {
    mode = m; modeT = 0; clipT = -1; did = false;
    pet.classList.toggle('is-busy', m === 'bite' || m === 'fire' || m === 'fireAt');
  };

  const visibleButtons = () =>
    (Array.from(document.querySelectorAll('a, button')) as HTMLElement[]).filter((el) => {
      const r = el.getBoundingClientRect();
      const b = bitten.get(el);
      return r.top > H * 0.6 && r.bottom < innerHeight - 20 && r.left > 30 && r.right < innerWidth - 30 && (!b || b.depth < 3) && isButtonLike(el);
    });

  /* where the trunk goes on the button, and where the pet box must be for that */
  const biteGoal = () => {
    const r = target.el.getBoundingClientRect();
    const b = bitten.get(target.el);
    const inset = (b ? b.depth : 0) * Math.min(18, r.height * 0.45) + 4;
    const bx = target.side === 1 ? r.left + inset : r.right - inset; // side 1 = bites the left edge, facing right
    const by = r.top + r.height * 0.5;
    const mx = target.side === 1 ? MOUTH.x * W : (1 - MOUTH.x) * W;
    return { x: bx - mx, y: by - MOUTH.y * H, bx, by };
  };
  /* a spot a little in front of the button to breathe fire at it */
  const fireGoal = () => {
    const r = target.el.getBoundingClientRect();
    const gap = W * 0.45;
    const bx = target.side === 1 ? r.left - gap : r.right + gap;
    const mx = target.side === 1 ? MOUTH.x * W : (1 - MOUTH.x) * W;
    return { x: bx - mx, y: r.top + r.height / 2 - MOUTH.y * H };
  };

  /* ── bite: a tooth-scalloped hole on the button's edge (CSS mask, one layer per circle, intersected) ── */
  function bite(el: HTMLElement, side: 1 | -1, bx: number, by: number) {
    const r = el.getBoundingClientRect();
    let b = bitten.get(el);
    if (!b) { b = { el, bites: [], side, depth: 0, healAt: 0 }; bitten.set(el, b); }
    const R = clamp(r.height * 0.42, 9, 22);
    const cx = bx - r.left + (side === 1 ? -R * 0.35 : R * 0.35);
    const cy = by - r.top + rand(-r.height * 0.12, r.height * 0.12);
    const hole = (px: number, py: number, rr: number) =>
      `radial-gradient(circle ${rr.toFixed(1)}px at ${px.toFixed(1)}px ${py.toFixed(1)}px, transparent 98%, #000 100%)`;
    b.bites.push(hole(cx, cy, R));
    for (let i = 0; i < 7; i++) { // teeth marks around the bite
      const a = (side === 1 ? -Math.PI / 2 : Math.PI / 2) + (i / 6 - 0.5) * Math.PI * 0.95 * (side === 1 ? -1 : 1);
      b.bites.push(hole(cx + Math.cos(a) * R * 0.98, cy + Math.sin(a) * R * 0.98, R * 0.3));
    }
    b.depth++;
    b.healAt = clock + 30;
    const mask = b.bites.join(', ');
    el.style.setProperty('-webkit-mask-image', mask);
    el.style.setProperty('mask-image', mask);
    el.classList.add('yl-bitten');
    el.animate([{ translate: '0 0' }, { translate: `${-side * 4}px 1px` }, { translate: `${side * 3}px -1px` }, { translate: '0 0' }], { duration: 260, easing: 'ease-out' });
    crumbs(bx, by, getComputedStyle(el).backgroundColor, side);
  }
  function heal(b: Bitten) {
    bitten.delete(b.el);
    b.el.style.removeProperty('-webkit-mask-image');
    b.el.style.removeProperty('mask-image');
    b.el.classList.remove('yl-bitten');
    if (b.el.isConnected) b.el.animate([{ scale: '0.92' }, { scale: '1.04' }, { scale: '1' }], { duration: 420, easing: 'ease-out' });
  }
  const docW = () => document.documentElement.clientWidth;
  function crumbs(px: number, py: number, color: string, side: 1 | -1) {
    const fill = !color || /,\s*0\)$/.test(color) ? '#fe4a23' : color;
    for (let i = 0; i < 9; i++) {
      const c = document.createElement('i');
      c.className = 'yl-crumb';
      const s = rand(3, 7);
      Object.assign(c.style, { left: px + scrollX + 'px', top: py + scrollY + 'px', width: s + 'px', height: s * rand(0.6, 1.2) + 'px', background: fill });
      fx.appendChild(c);
      const dx = -side * rand(10, 60), dy = rand(60, 140), rot = rand(-260, 260);
      c.animate([{ transform: 'translate(0,0) rotate(0deg)', opacity: 1 }, { transform: `translate(${dx * 0.6}px, ${-rand(8, 26)}px) rotate(${rot * 0.4}deg)`, opacity: 1, offset: 0.25 },
        { transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`, opacity: 0 }], { duration: rand(650, 1000), easing: 'cubic-bezier(.3,.6,.6,1)' }).onfinish = () => c.remove();
    }
  }

  /* ── fire: char the space in front of the trunk for 2 s ── */
  function scorch() {
    const w = W * 1.15, h = W * 0.8;
    const cx = (face === 1 ? x + FIRE.x * W : x + (1 - FIRE.x) * W) + scrollX;
    const cy = y + FIRE.y * H + scrollY;
    const left = clamp(cx - w / 2, 0, Math.max(0, docW() - w)); // never widen the page
    const rot = `${rand(-12, 12)}deg`;
    // the char (multiplied onto the page, so the text under it darkens too) + a glowing ember rim on top
    for (const cls of ['yl-scorch', 'yl-ember']) {
      const s = document.createElement('div');
      s.className = cls;
      Object.assign(s.style, { left: left + 'px', top: cy - h / 2 + 'px', width: w + 'px', height: h + 'px', rotate: rot });
      fx.appendChild(s);
      window.setTimeout(() => s.remove(), 3600);
    }
  }

  /* ── the wake: sample what is under / around the pet and push it away ── */
  const untouchable = (el: HTMLElement) =>
    !!el.closest(NEVER) || (!wakes.has(el) && !!(el.style.transform || el.style.translate || el.style.rotate));
  function wake() {
    const px = x + (face === 1 ? BODY.x : 1 - BODY.x) * W, py = y + BODY.y * H;
    const R = Math.max(W, 200) * 0.9;
    const near = new Set<HTMLElement>();
    if (mode !== 'bite' && mode !== 'fire' && mode !== 'fireAt') {
      for (const [ox, oy] of [[0, 0], [-0.5, 0], [0.5, 0], [0, -0.45], [0, 0.45], [-0.4, -0.35], [0.4, -0.35], [-0.4, 0.35], [0.4, 0.35]]) {
        const sx = px + ox * R, sy = py + oy * R;
        if (sx < 0 || sy < 0 || sx > innerWidth || sy > innerHeight) continue;
        for (const hit of document.elementsFromPoint(sx, sy) as HTMLElement[]) {
          const t = hit.closest(TEXT) as HTMLElement | null;
          const c = hit.closest(CARDS) as HTMLElement | null;
          for (const el of [t, c]) {
            if (!el || near.has(el) || untouchable(el)) continue;
            const r = el.getBoundingClientRect();
            if (r.width * r.height > innerWidth * innerHeight * 0.35) continue; // whole sections are not "text" or "cards"
            near.add(el);
          }
          if (t || c) break; // the topmost text/card under this sample point is enough
        }
      }
    }
    // targets for the elements near the pet; everything else eases back home
    for (const el of near) {
      const r = el.getBoundingClientRect();
      const nx = clamp(px, r.left, r.right), ny = clamp(py, r.top, r.bottom);
      const k = Math.pow(clamp(1 - Math.hypot(px - nx, py - ny) / R, 0, 1), 2);
      let ux = r.left + r.width / 2 - px, uy = r.top + r.height / 2 - py;
      const len = Math.hypot(ux, uy) || 1; ux /= len; uy /= len;
      const card = el.matches(CARDS);
      const w = wakes.get(el) || { x: 0, y: 0, r: 0, tx: 0, ty: 0, tr: 0 };
      w.tx = ux * (card ? 9 : 16) * k; w.ty = uy * (card ? 9 : 12) * k; w.tr = ux * (card ? 1.2 : 1.6) * k;
      wakes.set(el, w);
    }
    for (const [el, w] of wakes) {
      if (!near.has(el)) { w.tx = w.ty = w.tr = 0; }
      w.x += (w.tx - w.x) * 0.16; w.y += (w.ty - w.y) * 0.16; w.r += (w.tr - w.r) * 0.16;
      if (!el.isConnected || (!near.has(el) && Math.abs(w.x) + Math.abs(w.y) + Math.abs(w.r) < 0.05)) {
        el.style.translate = ''; el.style.rotate = ''; wakes.delete(el); continue;
      }
      el.style.translate = `${w.x.toFixed(2)}px ${w.y.toFixed(2)}px`;
      el.style.rotate = `${w.r.toFixed(2)}deg`;
    }
  }

  /* ── called over by the header's Contact button ── */
  const onFireAt = (e: Event) => {
    const el = (e as CustomEvent<{ el?: HTMLElement }>).detail?.el;
    if (!el || mode === 'bite' || mode === 'fire' || mode === 'fireAt' || clock < fireCool) return;
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    target = { el, side: r.left + r.width / 2 > innerWidth / 2 ? 1 : -1 };
    setMode('fireAt');
  };
  addEventListener('yali:fire-at', onFireAt);

  /* ── the loop ── */
  function step(t: number) {
    if (dead) return;
    const dt = Math.min(0.05, (t - last) / 1000); last = t; clock += dt; modeT += dt;
    const vw = innerWidth, vh = innerHeight;

    for (const b of bitten.values()) if (clock > b.healAt || !b.el.isConnected) heal(b);

    if (mode === 'roam') {
      if (Math.hypot(tx - x, ty - y) < 24) pickSpot();
      if (clock > nextAction) {
        nextAction = clock + rand(7, 12);
        const btns = visibleButtons();
        if (btns.length && Math.random() < 0.62) {
          const el = btns[(Math.random() * btns.length) | 0];
          const r = el.getBoundingClientRect();
          const b = bitten.get(el);
          target = { el, side: b ? b.side : r.left + r.width / 2 > vw / 2 ? 1 : -1 }; // approach from the roomier side
          setMode('approach');
        } else if (x > 20 && x + W < vw - 20 && y > 20 && y + H < vh - 20) {
          setMode('fire');
          o.mascot()?.play('Fire', { queue: true });
        }
      }
    } else if (mode === 'approach' || mode === 'fireAt') {
      const r = target.el.getBoundingClientRect();
      if (!target.el.isConnected || r.bottom < 0 || r.top > vh || modeT > 9) { setMode('roam'); pickSpot(); }
      else if (mode === 'approach') {
        const g = biteGoal(); tx = g.x; ty = g.y; face = target.side;
        if (Math.hypot(tx - x, ty - y) < 5 && Math.hypot(vx, vy) < 40) { setMode('bite'); o.mascot()?.play('Bite', { queue: true }); }
      } else {
        const g = fireGoal(); tx = g.x; ty = g.y; face = target.side;
        if (Math.hypot(tx - x, ty - y) < 12 && Math.hypot(vx, vy) < 60) { setMode('fire'); fireCool = clock + 5; o.mascot()?.play('Fire', { queue: true }); }
      }
    } else if (mode === 'bite') {
      const g = biteGoal(); x = g.x; y = g.y; vx = vy = 0; // stay locked on while the page scrolls
      clipT = clipT < 0 ? (o.phase() === 'Bite' ? 0 : -1) : clipT + dt;
      if (!did && clipT > BITE_SNAP) { did = true; bite(target.el, target.side, g.bx, g.by); }
      if (clipT > 1.05 || (clipT < 0 && modeT > 3)) { setMode('retreat'); tx = x - target.side * rand(140, 220); ty = y + rand(-110, 60); }
    } else if (mode === 'fire') {
      vx *= 0.8; vy *= 0.8;
      clipT = clipT < 0 ? (o.phase() === 'Fire' ? 0 : -1) : clipT + dt;
      if (!did && clipT > FIRE_LIT) { did = true; scorch(); }
      if (clipT > 2.05 || (clipT < 0 && modeT > 3.5)) { setMode('roam'); pickSpot(); }
    } else if (mode === 'retreat') {
      if (Math.hypot(tx - x, ty - y) < 30 || modeT > 2.5) { setMode('roam'); pickSpot(); }
    }

    // steering (not while biting / breathing fire)
    if (mode !== 'bite' && mode !== 'fire') {
      const dx = tx - x, dy = ty - y, dist = Math.hypot(dx, dy) || 1;
      const homing = mode === 'approach' || mode === 'fireAt';
      const want = Math.min(homing ? 280 : 170, dist * (homing ? 3 : 1.6));
      const acc = Math.min(1, dt * (homing ? 5 : 2.2));
      vx += ((dx / dist) * want - vx) * acc; vy += ((dy / dist) * want - vy) * acc;
      x += vx * dt; y += vy * dt;
      if (!homing && Math.abs(vx) > 25) face = vx > 0 ? 1 : -1;
    }
    // stay on screen (the page can resize / scroll under it)
    if (mode === 'roam') { x = clamp(x, -W * 0.2, vw - W * 0.8); y = clamp(y, -H * 0.2, vh - H * 0.8); }

    // over a dark section multiply would make it vanish: blend with "screen" there instead (light text still shows through)
    const cxp = x + W * 0.5, cyp = y + H * 0.45;
    if (cxp > 0 && cyp > 0 && cxp < vw && cyp < vh) {
      const darkUnder = document.elementsFromPoint(cxp, cyp).some((e) => (e as HTMLElement).closest?.('[data-yali-tone="dark"]'));
      pet.classList.toggle('on-dark', darkUnder);
      shadow.style.opacity = darkUnder ? '0' : '';
    }
    const bob = mode === 'bite' ? 0 : Math.sin(clock * 2.3) * 6;
    pet.style.transform = `translate3d(${x.toFixed(1)}px, ${(y + bob).toFixed(1)}px, 0)`;
    flip.style.transform = `scaleX(${face})`;
    const sh = clamp(1 - bob / 40, 0.6, 1.2);
    shadow.style.transform = `translate3d(${(x + W * 0.5 - 70).toFixed(1)}px, ${(y + H * 0.8).toFixed(1)}px, 0) scale(${sh.toFixed(3)})`;
    wake();
    raf = requestAnimationFrame(step);
  }
  raf = requestAnimationFrame(step);
  const onResize = () => size();
  addEventListener('resize', onResize);

  if (/[?&]yali\b/.test(location.search)) {
    (window as unknown as Record<string, unknown>).__yali = {
      bite: () => { const b = visibleButtons(); if (b.length) { target = { el: b[0], side: 1 }; setMode('approach'); } return b.map((e) => e.className || e.tagName); },
      fire: () => { setMode('fire'); o.mascot()?.play('Fire', { queue: true }); },
      goto: (gx: number, gy: number) => { x = tx = gx; y = ty = gy; vx = vy = 0; },
      hold: () => { nextAction = Infinity; },
      state: () => ({ mode, x, y, face, W, H, phase: o.phase() }),
    };
  }

  return () => {
    dead = true;
    cancelAnimationFrame(raf);
    removeEventListener('resize', onResize);
    removeEventListener('yali:fire-at', onFireAt);
    for (const b of bitten.values()) heal(b);
    for (const el of wakes.keys()) { el.style.translate = ''; el.style.rotate = ''; }
    fx.textContent = '';
  };
}
