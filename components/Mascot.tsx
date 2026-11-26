'use client';
/**
 * <Mascot /> – the Beyond Logik 3D mascot (public/fantasy_pet.min.glb, rendered with three.js on a transparent canvas).
 *
 * It fills its parent (give the parent a size). Until the model is ready – and always when the visitor prefers reduced motion – it shows
 * a static poster instead, so the page never waits for the 1.2 MB model. The model is only downloaded once the pet is near the viewport.
 *
 *   <div style={{ width: 240, height: 200 }}><Mascot idle="fly" autoplay /></div>
 *
 * Props
 *   action     play this clip when it changes ('Rotate' | 'Fly' | 'Lift' | 'Backflip' | 'Bite' | 'Fire'); `actionKey` re-triggers the same clip
 *   idle       'rest' (stands) | 'fly' (hovers: takes off with Lift → Fly when scrolled into view, and again after every one-shot clip)
 *   autoplay   play a random trick every 9–14 s (never with reduced motion)
 *   hover      pointer over the pet → Rotate          click      click / Enter on the pet → Backflip
 *   yaw        facing angle in radians (0 = at the viewer, + = turned toward the right)
 * Ref: { play(action, { queue }), setIdle(idle), phase }.   Add ?mascot to the URL to get window.__mascot (test hook).
 */
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { MascotController, type Action, type Idle, type Phase } from '@/lib/mascot/controller';

export type { Action, Idle, Phase };
export interface MascotHandle {
  play: (a: Action, o?: { queue?: boolean }) => boolean;
  setIdle: (i: Idle) => void;
  readonly phase: Phase;
}
export interface MascotProps {
  action?: Action | null;
  actionKey?: number;
  idle?: Idle;
  autoplay?: boolean;
  hover?: boolean;
  click?: boolean;
  yaw?: number;
  poster?: string;
  alt?: string;
  modelUrl?: string;
  className?: string;
  onReady?: (clips: string[]) => void;
  onPhase?: (p: Phase) => void;
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

const Mascot = forwardRef<MascotHandle, MascotProps>(function Mascot(
  { action = null, actionKey = 0, idle = 'rest', autoplay = false, hover = true, click = true, yaw = 0.55, poster = '/fantasy_pet.webp', alt = 'Beyond Logik mascot', modelUrl = '/fantasy_pet.min.glb', className = '', onReady, onPhase },
  ref,
) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const ctl = useRef<MascotController | null>(null);
  const [ready, setReady] = useState(false);
  const reduced = useReducedMotion();
  const idleRef = useRef(idle);
  const autoRef = useRef(autoplay);
  const cb = useRef({ onReady, onPhase });
  const lastHover = useRef(0);
  idleRef.current = idle;
  autoRef.current = autoplay;
  cb.current = { onReady, onPhase };

  useImperativeHandle(ref, () => ({
    play: (a, o) => ctl.current?.play(a, o) ?? false,
    setIdle: (i) => ctl.current?.setIdle(i),
    get phase() { return ctl.current?.phase ?? 'rest'; },
  }), []);

  // load lazily (near the viewport, when the browser is idle), render only while visible
  useEffect(() => {
    if (reduced) return;
    const el = box.current, cv = canvas.current;
    if (!el || !cv) return;
    let c: MascotController | null = null, dead = false, idleHandle: number | null = null, started = false;
    const ro = new ResizeObserver(() => { const r = el.getBoundingClientRect(); c?.resize(r.width, r.height, window.devicePixelRatio || 1); });
    ro.observe(el);
    const start = async () => {
      if (started || dead) return;
      started = true;
      try {
        c = new MascotController({ canvas: cv, url: modelUrl, idle: idleRef.current, yaw, autoplay: autoRef.current, onPhase: (p) => cb.current.onPhase?.(p) });
        const clips = await c.load();
        if (dead) { c.dispose(); return; }
        ctl.current = c;
        const r = el.getBoundingClientRect();
        c.resize(r.width, r.height, window.devicePixelRatio || 1);
        setReady(true);
        cb.current.onReady?.(clips);
        c.setVisible(vis.isIntersecting);
        if (/[?&]mascot\b/.test(location.search)) {
          (window as unknown as Record<string, unknown>).__mascot = { ctl: c, play: (a: Action) => c!.play(a), tick: (s: number, draw?: boolean) => c!.tick(s, draw), fire: () => c!.fireExtent(), pause: () => c!.pause(), resume: () => c!.resume(), phase: () => c!.phase };
        }
      } catch (e) {
        console.warn('[mascot] could not start (WebGL or model unavailable) – the poster stays', e);
      }
    };
    const vis = { isIntersecting: false };
    const io = new IntersectionObserver((entries) => {
      const e = entries[entries.length - 1];
      vis.isIntersecting = e.isIntersecting;
      c?.setVisible(e.isIntersecting);
      if (e.isIntersecting && !started) {
        const go = () => { idleHandle = null; start(); };
        if ('requestIdleCallback' in window) idleHandle = (window as unknown as { requestIdleCallback: (f: () => void, o?: { timeout: number }) => number }).requestIdleCallback(go, { timeout: 1500 });
        else setTimeout(go, 400);
      }
    }, { rootMargin: '200px 0px' });
    io.observe(el);
    return () => {
      dead = true;
      io.disconnect();
      ro.disconnect();
      if (idleHandle !== null && 'cancelIdleCallback' in window) (window as unknown as { cancelIdleCallback: (h: number) => void }).cancelIdleCallback(idleHandle);
      ctl.current = null;
      c?.dispose();
      setReady(false);
    };
  }, [reduced, modelUrl, yaw]);

  useEffect(() => { ctl.current?.setIdle(idle); }, [idle, ready]);
  useEffect(() => { if (ctl.current) ctl.current.autoplay = autoplay; }, [autoplay, ready]);
  useEffect(() => { if (action) ctl.current?.play(action, { queue: true }); }, [action, actionKey, ready]);

  const onHover = (e: React.PointerEvent) => {
    if (!hover || e.pointerType === 'touch') return; // a tap also fires pointerenter; the click handler covers it
    const now = performance.now();
    if (now - lastHover.current < 2500) return;
    if (ctl.current?.play('Rotate')) lastHover.current = now;
  };

  return (
    <div ref={box} className={`bl-mascot${ready ? ' is-ready' : ''} ${className}`}>
      <img className="bl-mascot-poster" src={poster} alt={alt} draggable={false} />
      {!reduced && <canvas ref={canvas} className="bl-mascot-canvas" aria-hidden="true" />}
      {!reduced && (hover || click) && (
        <button
          type="button"
          className="bl-mascot-hit"
          aria-label={`${alt} – press for a backflip`}
          tabIndex={click ? 0 : -1}
          onPointerEnter={onHover}
          onClick={() => { if (click) ctl.current?.play('Backflip'); }}
        />
      )}
    </div>
  );
});

export default Mascot;
