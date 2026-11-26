/**
 * Sirpi contest: the bonfire that burns on the prize money (a pile of rolled banknotes and coins, SVG in the page).
 * Canvas particle fire: soft pre-rendered glow sprites drawn additively, rising with buoyancy and a gentle sideways sway,
 * cooling from white-hot to red; plus sparks. The countdown sits in the flames (HTML on top). Pauses off-screen;
 * with prefers-reduced-motion it renders a still fire.
 */
import type { Ctx } from './film';

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5; // ~N(0, .33), bounded

/** a soft round sprite in one colour, drawn once */
function sprite(r: number, g: number, b: number) {
  const s = 64, c = document.createElement('canvas');
  c.width = c.height = s;
  const x = c.getContext('2d');
  const grd = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grd.addColorStop(0, `rgba(${r},${g},${b},1)`);
  grd.addColorStop(0.35, `rgba(${r},${g},${b},0.55)`);
  grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
  x.fillStyle = grd;
  x.fillRect(0, 0, s, s);
  return c;
}

export function initBonfire(ctx: Ctx) {
  const { root, on, frame, reduce } = ctx;
  const box = root.querySelector('#sp-bonfire') as HTMLElement;
  const canvas = root.querySelector('#sp-fire') as HTMLCanvasElement;
  const money = root.querySelector('.sp-bonfire__money') as SVGElement;
  if (!box || !canvas) return () => {};
  const g = canvas.getContext('2d');
  // white-hot core → yellow → orange → red
  const SPR = [sprite(255, 246, 214), sprite(255, 196, 70), sprite(250, 110, 25), sprite(190, 40, 12)];

  let W = 0, H = 0, dpr = 1, baseY = 0, cx = 0, spread = 0, scale = 1;
  const size = () => {
    const r = box.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    const m = money.getBoundingClientRect();
    cx = m.left - r.left + m.width / 2;
    baseY = m.top - r.top + m.height * 0.42; // the flames start in the crossed notes
    spread = m.width * 0.34;
    scale = Math.max(0.7, Math.min(1.25, H / 500));
  };

  // particles (struct of arrays)
  const N = 900;
  const px = new Float32Array(N), py = new Float32Array(N), vx = new Float32Array(N), vy = new Float32Array(N);
  const life = new Float32Array(N), max = new Float32Array(N), sz = new Float32Array(N), seed = new Float32Array(N);
  const alive = new Uint8Array(N);
  const SP = 60;
  const sx = new Float32Array(SP), sy = new Float32Array(SP), svx = new Float32Array(SP), svy = new Float32Array(SP), sl = new Float32Array(SP), sm = new Float32Array(SP);
  const sAlive = new Uint8Array(SP);
  let clock = 0, carry = 0, sCarry = 0;

  const spawn = () => {
    for (let i = 0; i < N; i++) if (!alive[i]) {
      const off = gauss() * spread;
      const k = 1 - Math.min(1, Math.abs(off) / spread); // 1 in the middle, 0 at the edges
      px[i] = cx + off; py[i] = baseY + rand(-6, 6);
      vx[i] = rand(-14, 14) - off * 0.35; // lean in, so the fire makes a tongue shape
      vy[i] = -rand(110, 190) * (0.5 + 0.8 * k) * scale; // tall in the middle: the flames rise through the countdown
      life[i] = 0; max[i] = rand(0.75, 1.35) * (0.55 + 0.75 * k);
      sz[i] = rand(40, 78) * scale * (0.7 + 0.5 * k); seed[i] = Math.random() * 100;
      alive[i] = 1; return;
    }
  };
  const spark = () => {
    for (let i = 0; i < SP; i++) if (!sAlive[i]) {
      sx[i] = cx + gauss() * spread * 0.7; sy[i] = baseY - rand(10, 60);
      svx[i] = rand(-40, 40); svy[i] = -rand(140, 260) * scale; sl[i] = 0; sm[i] = rand(0.8, 1.8); sAlive[i] = 1; return;
    }
  };

  function step(dt: number) {
    clock += dt;
    carry += dt * 460; // particles per second
    while (carry >= 1) { spawn(); carry--; }
    sCarry += dt * rand(3, 9);
    while (sCarry >= 1) { spark(); sCarry--; }
    for (let i = 0; i < N; i++) if (alive[i]) {
      life[i] += dt;
      if (life[i] >= max[i]) { alive[i] = 0; continue; }
      vy[i] -= 55 * scale * dt; // buoyancy
      vx[i] += (Math.sin(clock * 2.6 + py[i] * 0.025 + seed[i]) * 70 + (cx - px[i]) * 0.9) * dt; // sway + pull to the centre line
      px[i] += vx[i] * dt; py[i] += vy[i] * dt;
    }
    for (let i = 0; i < SP; i++) if (sAlive[i]) {
      sl[i] += dt;
      if (sl[i] >= sm[i]) { sAlive[i] = 0; continue; }
      svx[i] += Math.sin(clock * 5 + i) * 120 * dt; svy[i] += 30 * dt;
      sx[i] += svx[i] * dt; sy[i] += svy[i] * dt;
    }
  }
  function draw() {
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    g.globalCompositeOperation = 'lighter';
    // flickering glow on the "ground"
    const fl = 0.75 + Math.sin(clock * 9) * 0.08 + Math.sin(clock * 23) * 0.05;
    g.globalAlpha = 0.5 * fl;
    g.drawImage(SPR[2], cx - spread * 1.8, baseY - spread * 1.2, spread * 3.6, spread * 1.8); // kept inside the canvas: no clipped edge
    for (let i = 0; i < N; i++) if (alive[i]) {
      const t = life[i] / max[i];
      const s = sz[i] * (1 - t * 0.65);
      const spr = t < 0.18 ? SPR[0] : t < 0.42 ? SPR[1] : t < 0.72 ? SPR[2] : SPR[3];
      g.globalAlpha = Math.pow(1 - t, 1.3) * (t < 0.18 ? 0.5 : 0.42);
      g.drawImage(spr, px[i] - s / 2, py[i] - s / 2, s, s);
    }
    for (let i = 0; i < SP; i++) if (sAlive[i]) {
      const t = sl[i] / sm[i];
      g.globalAlpha = (1 - t) * (0.6 + 0.4 * Math.sin(clock * 40 + i));
      g.drawImage(SPR[1], sx[i] - 3, sy[i] - 3, 6, 6);
    }
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
  }

  let visible = false;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '100px' });
  io.observe(box);
  let last = performance.now();
  size();
  if (reduce) { for (let i = 0; i < 90; i++) step(1 / 30); draw(); }
  else {
    for (let i = 0; i < 40; i++) step(1 / 30); // start already burning
    frame((t) => {
      const dt = Math.min(0.05, (t - last) / 1000); last = t;
      if (!visible) return;
      step(dt); draw();
    });
  }
  let rt = 0;
  on(window, 'resize', () => { clearTimeout(rt); rt = window.setTimeout(() => { size(); if (reduce) draw(); }, 150); });
  document.fonts?.ready.then(() => { if (!ctx.dead()) size(); });
  return () => { io.disconnect(); clearTimeout(rt); };
}
