/**
 * Port of the Webflow "IX2" interaction engine, limited to the paths used by the
 * Outcrowd homepage (7 action types, 11 event types). The numeric behaviour is taken
 * from the engine source:
 *   - continuous (scroll-scrubbed) instances: per-frame smoothing
 *       position += (target - position) * max(1 - smoothing, .01)
 *     hold-before-first-keyframe, interpolation between keyframes with the first
 *     item's easing, grouping by (target, action type);
 *   - SCROLLING_IN_VIEW progress maths (startsEntering / startsExiting / offsets);
 *   - time-based action lists: groups play sequentially, items in a group start
 *     together, group ends when every item finished, `loop` restarts at group 0,
 *     `useFirstGroupAsInitialState` applies group 0 instantly at init and skips it on play;
 *   - SCROLL_INTO_VIEW fires once (unless an auto-stop partner exists);
 *   - MOUSE_OVER/OUT hover tracking, click / second click toggling, PAGE_START,
 *     PAGE_SCROLL_UP/DOWN, dropdown open/close (dispatched by our FAQ component).
 */
import RAW from './ix2-data.json';

type Any = any;
const DATA: Any = RAW;
const EVENTS: Record<string, Any> = DATA.events;
const LISTS: Record<string, Any> = DATA.actionLists;
const MQS: Any[] = DATA.mediaQueries;
/** exposed so lib/stages.ts can adapt the pinned timeline to four steps before init */
export const IX_LISTS: Record<string, Any> = LISTS;

/* ───────────────────────── easing ───────────────────────── */
const optimizeFloat = (e: number, a = 5, t = 10) => {
  const n = Math.pow(t, a);
  const i = Number(Math.round(e * n) / n);
  return Math.abs(i) > 1e-4 ? i : 0;
};
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const e = sx(t) - x;
      if (Math.abs(e) < 1e-6) return sy(t);
      const d = dx(t);
      if (Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    let lo = 0, hi = 1;
    t = x;
    for (let i = 0; i < 40; i++) {
      const e = sx(t);
      if (Math.abs(e - x) < 1e-6) break;
      if (x > e) lo = t; else hi = t;
      t = (hi - lo) / 2 + lo;
    }
    return sy(t);
  };
}
const EASE: Record<string, (t: number) => number> = {
  ease: bezier(0.25, 0.1, 0.25, 1),
  easeIn: bezier(0.42, 0, 1, 1),
  easeOut: bezier(0, 0, 0.58, 1),
  easeInOut: bezier(0.42, 0, 0.58, 1),
  inQuad: (t) => t * t,
  outQuad: (t) => -(Math.pow(t - 1, 2) - 1),
  inOutQuad: (t) => ((t /= 0.5) < 1 ? 0.5 * t * t : -0.5 * ((t -= 2) * t - 2)),
  inCubic: (t) => t * t * t,
  outCubic: (t) => Math.pow(t - 1, 3) + 1,
  inOutCubic: (t) => ((t /= 0.5) < 1 ? 0.5 * t * t * t : 0.5 * (Math.pow(t - 2, 3) + 2)),
  inExpo: (t) => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
  outExpo: (t) => (t === 1 ? 1 : -Math.pow(2, -10 * t) + 1),
  inOutExpo: (t) => (t === 0 ? 0 : t === 1 ? 1 : (t /= 0.5) < 1 ? 0.5 * Math.pow(2, 10 * (t - 1)) : 0.5 * (-Math.pow(2, -10 * --t) + 2)),
  inSine: (t) => -Math.cos(t * (Math.PI / 2)) + 1,
  outSine: (t) => Math.sin(t * (Math.PI / 2)),
  inOutSine: (t) => -0.5 * (Math.cos(Math.PI * t) - 1),
};
const applyEasing = (name: string | undefined, p: number) =>
  p === 0 ? 0 : p === 1 ? 1 : optimizeFloat(p > 0 && name && EASE[name] ? EASE[name](p) : p);

/* ───────────────────────── element state ───────────────────────── */
type TF = { mv: number[]; mvu: string[]; sc: number[]; rot: number[]; sk: number[] };
const UNIT: Record<string, string> = { PX: 'px', '%': '%', REM: 'rem', VW: 'vw', VH: 'vh', EM: 'em', DEG: 'deg', '': '', AUTO: 'auto' };
let TF_STATE = new WeakMap<Element, TF>();
const ORIG_STYLE = new Map<Element, string | null>();

function touch(el: Element) {
  if (!ORIG_STYLE.has(el)) ORIG_STYLE.set(el, el.getAttribute('style'));
}
function readTF(el: HTMLElement): TF {
  let tf = TF_STATE.get(el);
  if (tf) return tf;
  tf = { mv: [0, 0, 0], mvu: ['px', 'px', 'px'], sc: [1, 1, 1], rot: [0, 0, 0], sk: [0, 0] };
  const s = el.style.transform || '';
  let m: RegExpMatchArray | null;
  if ((m = s.match(/translate3d\(([^)]+)\)/))) {
    m[1].split(',').forEach((p, i) => {
      const q = p.trim().match(/^(-?[\d.]+(?:e-?\d+)?)([a-z%]*)$/i);
      if (q) { tf!.mv[i] = parseFloat(q[1]); tf!.mvu[i] = q[2] || 'px'; }
    });
  }
  if ((m = s.match(/scale3d\(([^)]+)\)/))) m[1].split(',').forEach((p, i) => (tf!.sc[i] = parseFloat(p)));
  (['X', 'Y', 'Z'] as const).forEach((a, i) => {
    const r = s.match(new RegExp('rotate' + a + '\\(([^)]+)\\)'));
    if (r) tf!.rot[i] = parseFloat(r[1]);
  });
  if ((m = s.match(/skew\(([^)]+)\)/))) m[1].split(',').forEach((p, i) => (tf!.sk[i] = parseFloat(p)));
  TF_STATE.set(el, tf);
  return tf;
}
function renderTF(el: HTMLElement, t: TF) {
  const f = (n: number) => String(n);
  el.style.transform =
    `translate3d(${f(t.mv[0])}${t.mvu[0]}, ${f(t.mv[1])}${t.mvu[1]}, ${f(t.mv[2])}${t.mvu[2]}) ` +
    `scale3d(${f(t.sc[0])}, ${f(t.sc[1])}, ${f(t.sc[2])}) ` +
    `rotateX(${f(t.rot[0])}deg) rotateY(${f(t.rot[1])}deg) rotateZ(${f(t.rot[2])}deg) ` +
    `skew(${f(t.sk[0])}deg, ${f(t.sk[1])}deg)`;
}

const KEYS: Record<string, string[]> = {
  TRANSFORM_MOVE: ['xValue', 'yValue', 'zValue'],
  TRANSFORM_SCALE: ['xValue', 'yValue', 'zValue'],
  TRANSFORM_ROTATE: ['xValue', 'yValue', 'zValue'],
  TRANSFORM_SKEW: ['xValue', 'yValue'],
  STYLE_OPACITY: ['value'],
  STYLE_SIZE: ['widthValue', 'heightValue'],
  STYLE_BACKGROUND_COLOR: ['rValue', 'gValue', 'bValue', 'aValue'],
  PLUGIN_LOTTIE: ['value'],
};
const AXIS = ['x', 'y', 'z'];
/** The data mixes cases ('PX', 'rem', '%', 'AUTO', 'vw' …); normalise to a CSS unit. */
const unitOf = (u: unknown): string => {
  if (u == null || u === '') return 'px';
  const t = String(u);
  return t === '%' ? '%' : t.toLowerCase();
};
const isAuto = (u: unknown) => String(u ?? '').toLowerCase() === 'auto';


function applyVals(el: Element, type: string, vals: Record<string, number>, cfg: Any) {
  const e = el as HTMLElement;
  touch(e);
  switch (type) {
    case 'TRANSFORM_MOVE': {
      const t = readTF(e);
      AXIS.forEach((a, i) => {
        const v = vals[a + 'Value'];
        if (v == null || Number.isNaN(v)) return;
        t.mv[i] = v;
        t.mvu[i] = unitOf(cfg[a + 'Unit']);
      });
      renderTF(e, t);
      break;
    }
    case 'TRANSFORM_SCALE': {
      const t = readTF(e);
      AXIS.forEach((a, i) => { const v = vals[a + 'Value']; if (v != null && !Number.isNaN(v)) t.sc[i] = v; });
      renderTF(e, t);
      break;
    }
    case 'TRANSFORM_ROTATE': {
      const t = readTF(e);
      AXIS.forEach((a, i) => { const v = vals[a + 'Value']; if (v != null && !Number.isNaN(v)) t.rot[i] = v; });
      renderTF(e, t);
      break;
    }
    case 'STYLE_OPACITY':
      e.style.opacity = String(vals.value);
      break;
    case 'STYLE_SIZE':
      if (vals.widthValue != null && !Number.isNaN(vals.widthValue)) e.style.width = vals.widthValue + (unitOf(cfg.widthUnit) === 'auto' ? 'px' : unitOf(cfg.widthUnit));
      if (vals.heightValue != null && !Number.isNaN(vals.heightValue)) e.style.height = vals.heightValue + (unitOf(cfg.heightUnit) === 'auto' ? 'px' : unitOf(cfg.heightUnit)); // AUTO tweens run in px, then snap to auto
      break;
    case 'STYLE_BACKGROUND_COLOR':
      e.style.backgroundColor = `rgba(${Math.round(vals.rValue)}, ${Math.round(vals.gValue)}, ${Math.round(vals.bValue)}, ${vals.aValue})`;
      break;
    case 'PLUGIN_LOTTIE':
      // No Lottie files in this build: the progress (0–1) is exposed as a CSS variable
      // so components can drive their own animation from the very same timeline.
      e.style.setProperty('--lottie-p', String((vals.value ?? 0) / 100));
      break;
  }
}

/* ───────────────────────── targets ───────────────────────── */
const idSel = (id: string) => `[data-w-id="${id.split('|').pop()}"]`;
function evTargets(t: Any): Element[] {
  if (!t) return [];
  if (t.appliesTo === 'PAGE') return [document.documentElement];
  if (t.selector) return Array.from(document.querySelectorAll(t.selector));
  if (t.id) return Array.from(document.querySelectorAll(idSel(t.id)));
  return [];
}
function itemTargets(t: Any, ev: Element): Element[] {
  if (!t) return [];
  const u = t.useEventTarget;
  if (u === true || t.appliesTo === 'TRIGGER_ELEMENT') return [ev];
  const sel: string | null = t.selector || (t.id ? idSel(t.id) : null);
  if (!sel) return [];
  if (u === 'CHILDREN') {
    const r = Array.from(ev.querySelectorAll(sel));
    if (!t.selector && ev.matches(sel)) r.unshift(ev);
    return r;
  }
  if (u === 'PARENT') {
    const p = t.selector ? ev.closest(sel) : ev.parentElement;
    return p ? [p] : [];
  }
  return Array.from(document.querySelectorAll(sel));
}

/* ───────────────────────── runtime state ───────────────────────── */
interface Cont {
  el: Element; type: string; cfg0: Any; groups: { keyframe: number; items: Any[] }[]; keys: string[];
  position: number; smoothing: number; rendered: boolean; progress: () => number; ev: Any;
}
interface Tween {
  el: Element; type: string; cfg: Any; keys: string[]; origin: Record<string, number>; dest: Record<string, number>;
  displayValue?: string; heightAuto?: boolean; start: number; delay: number; duration: number; easing: string; done: boolean;
}
interface Chain { cancelled: boolean }
interface Run { chain: Chain; tweens: Tween[]; next: () => void; finished: boolean }

let conts: Cont[] = [];
let runs: Run[] = [];
const runsByKey = new Map<string, Chain>();
let cleanups: Array<() => void> = [];
let rafId = 0;
let currentMq = '';
let started = false;

const mqKey = () => {
  for (const m of MQS) if (window.matchMedia(`(min-width:${m.min}px) and (max-width:${m.max}px)`).matches) return m.key as string;
  return 'main';
};
const evConfig = (ev: Any) => (Array.isArray(ev.config) ? ev.config[0] || {} : ev.config || {});

/* ── continuous (scroll-scrubbed) ── */
function buildContinuous(ev: Any, cfg: Any, target: Element) {
  const list = LISTS[ev.action.config.actionListId];
  if (!list) return;
  const pg = (list.continuousParameterGroups || []).find((g: Any) => g.id === cfg.continuousParameterGroupId);
  if (!pg) return;
  const buckets = new Map<string, { groups: { keyframe: number; items: Any[] }[]; first: Any }>();
  const sorted = [...pg.continuousActionGroups].sort((a, b) => a.keyframe - b.keyframe);
  for (const cg of sorted) {
    for (const it of cg.actionItems) {
      if (!it.config.target) continue;
      const k = JSON.stringify(it.config.target) + '|' + it.actionTypeId;
      let b = buckets.get(k);
      if (!b) { b = { groups: [], first: it }; buckets.set(k, b); }
      let g = b.groups.find((x) => x.keyframe === cg.keyframe);
      if (!g) { g = { keyframe: cg.keyframe, items: [] }; b.groups.push(g); }
      g.items.push(it);
    }
  }
  const smoothing = (cfg.smoothing || 0) / 100;
  const progress = () => {
    const de = document.documentElement;
    const f = de.clientHeight, r = de.scrollHeight;
    if (cfg.basedOn === 'VIEWPORT') return (window.pageYOffset || de.scrollTop) / r;
    const d = target.getBoundingClientRect();
    let c = (cfg.addStartOffset ? cfg.addOffsetValue || 0 : 0) / 100;
    let o = (cfg.addEndOffset ? cfg.endOffsetValue || 0 : 0) / 100;
    c = cfg.startsEntering ? c : 1 - c;
    o = cfg.startsExiting ? o : 1 - o;
    const s = d.top + Math.min(d.height * c, f);
    const u = Math.min(f + (d.top + d.height * o - s), r);
    return Math.min(Math.max(0, f - s), u) / u;
  };
  buckets.forEach((b) => {
    const type = b.first.actionTypeId;
    const keys = (KEYS[type] || []).filter((k) => b.first.config[k] != null && typeof b.first.config[k] !== 'string');
    for (const el of itemTargets(b.first.config.target, target)) {
      conts.push({ el, type, cfg0: b.first.config, groups: b.groups, keys, position: 0, smoothing, rendered: false, progress, ev });
    }
  });
}

function tickCont(c: Cont, R: number) {
  const O = Math.max(1 - c.smoothing, 0.01);
  const N = optimizeFloat((Math.max(R, 0) || 0) - c.position);
  const L = optimizeFloat(c.position + N * O);
  if (L === c.position && c.rendered) return;
  c.position = L;
  const pos = 100 * L;
  let t: Any, n: Any = null, i: number | undefined, cc: number | undefined;
  c.groups.forEach((g, e) => {
    if (e === 0) t = g.items[0];
    if (pos >= g.keyframe) {
      t = g.items[0];
      const nx = c.groups[e + 1];
      const has = nx && pos !== g.keyframe;
      n = has ? nx.items[0] : null;
      if (has) { i = g.keyframe / 100; cc = (nx.keyframe - g.keyframe) / 100; }
    }
  });
  const v: Record<string, number> = {};
  if (t && !n) {
    for (const k of c.keys) v[k] = t.config[k];
  } else if (t && n && i !== undefined && cc !== undefined) {
    const eased = applyEasing(t.config.easing, (L - i) / cc);
    for (const k of c.keys) {
      const a = t.config[k];
      const b = n.config[k];
      v[k] = b == null || a == null ? (a ?? b) : (b - a) * eased + a;
    }
  }
  applyVals(c.el, c.type, v, c.groups[0].items[0].config);
  c.rendered = true;
}

/* ── time-based action lists ── */
function readOrigin(el: Element, type: string, keys: string[], cfg: Any): Record<string, number> {
  const o: Record<string, number> = {};
  const e = el as HTMLElement;
  if (type === 'TRANSFORM_MOVE' || type === 'TRANSFORM_SCALE' || type === 'TRANSFORM_ROTATE') {
    const t = readTF(e);
    const arr = type === 'TRANSFORM_MOVE' ? t.mv : type === 'TRANSFORM_SCALE' ? t.sc : t.rot;
    keys.forEach((k) => (o[k] = arr[AXIS.indexOf(k[0])]));
    if (type === 'TRANSFORM_MOVE') {
      // if units differ between current state and destination, restart from 0 in the destination unit
      keys.forEach((k) => {
        const i = AXIS.indexOf(k[0]);
        const du = unitOf(cfg[k[0] + 'Unit']);
        if (t.mvu[i] !== du) { o[k] = 0; t.mvu[i] = du; }
      });
    }
  } else if (type === 'STYLE_OPACITY') {
    const inl = e.style.opacity;
    o.value = inl !== '' ? parseFloat(inl) : parseFloat(getComputedStyle(e).opacity);
  } else if (type === 'STYLE_SIZE') {
    const cs = getComputedStyle(e);
    const parent = e.parentElement;
    ['width', 'height'].forEach((p) => {
      const k = p + 'Value';
      if (!keys.includes(k) && !(p === 'height' && isAuto(cfg.heightUnit))) return;
      const unit = unitOf(cfg[p + 'Unit']);
      const px = parseFloat((cs as Any)[p]) || 0;
      if (unit === '%' && parent) {
        const pp = p === 'width' ? parent.clientWidth : parent.clientHeight;
        o[k] = pp ? (px / pp) * 100 : 0;
      } else if (unit === 'rem') o[k] = px / parseFloat(getComputedStyle(document.documentElement).fontSize);
      else o[k] = px;
    });
  } else if (type === 'STYLE_BACKGROUND_COLOR') {
    const m = getComputedStyle(e).backgroundColor.match(/[\d.]+/g) || ['0', '0', '0', '1'];
    o.rValue = +m[0]; o.gValue = +m[1]; o.bValue = +m[2]; o.aValue = m[3] != null ? +m[3] : 1;
  } else if (type === 'PLUGIN_LOTTIE') {
    o.value = parseFloat(e.style.getPropertyValue('--lottie-p') || '0') * 100;
  }
  return o;
}

function applyInitial(list: Any, groupIdx: number, evEl: Element) {
  const g = list.actionItemGroups?.[groupIdx];
  if (!g) return;
  for (const it of g.actionItems) {
    const type = it.actionTypeId;
    const cfg = it.config;
    for (const el of itemTargets(cfg.target, evEl)) {
      if (type === 'GENERAL_DISPLAY') { touch(el); (el as HTMLElement).style.display = cfg.value; continue; }
      const keys = (KEYS[type] || []).filter((k) => cfg[k] != null && typeof cfg[k] !== 'string');
      const vals: Record<string, number> = {};
      keys.forEach((k) => (vals[k] = cfg[k]));
      if (type === 'STYLE_SIZE' && isAuto(cfg.heightUnit)) { touch(el); (el as HTMLElement).style.height = 'auto'; }
      applyVals(el, type, vals, cfg);
    }
  }
}

function startGroup(ev: Any, evEl: Element, listId: string, index: number, chain: Chain, empties = 0) {
  if (chain.cancelled) return;
  const list = LISTS[listId];
  const groups = list?.actionItemGroups;
  if (!groups || !groups.length) return;
  const cfg = evConfig(ev);
  if (empties > groups.length) return; // a whole loop produced no motion (e.g. targets that don't exist in this build)
  if (index >= groups.length && cfg.loop) index = 0;
  if (index === 0 && list.useFirstGroupAsInitialState) index++;
  if (index >= groups.length) return;
  const items = groups[index].actionItems;
  if (!items.length) { startGroup(ev, evEl, listId, index + 1, chain, empties + 1); return; }
  const instDelay = (index === 0 || (index === 1 && list.useFirstGroupAsInitialState)) && ev.eventTypeId !== 'PAGE_START' && typeof cfg.delay === 'number' ? cfg.delay : undefined;
  const now = performance.now();
  const tweens: Tween[] = [];
  for (const it of items) {
    const type = it.actionTypeId;
    const c = it.config;
    const els = itemTargets(c.target, evEl);
    for (const el of els) {
      const delay = instDelay != null ? instDelay : c.delay || 0;
      if (type === 'GENERAL_DISPLAY') {
        tweens.push({ el, type, cfg: c, keys: [], origin: {}, dest: {}, displayValue: c.value, start: now, delay, duration: 0, easing: '', done: false });
        continue;
      }
      if (c.duration === 'auto') continue; // lottie "auto" duration → no motion in this build
      const keys = (KEYS[type] || []).filter((k) => c[k] != null && typeof c[k] !== 'string');
      const heightAuto = type === 'STYLE_SIZE' && isAuto(c.heightUnit);
      const origin = readOrigin(el, type, keys, c);
      const dest: Record<string, number> = {};
      keys.forEach((k) => (dest[k] = c[k]));
      if (heightAuto) {
        const h = el as HTMLElement;
        const prev = h.style.height;
        h.style.height = 'auto';
        const target = h.scrollHeight;
        h.style.height = prev;
        origin.heightValue = origin.heightValue ?? 0;
        dest.heightValue = target;
        if (!keys.includes('heightValue')) keys.push('heightValue');
      }
      tweens.push({ el, type, cfg: c, keys, origin, dest, heightAuto, start: now, delay, duration: Number(c.duration) || 0, easing: c.easing || '', done: false });
    }
  }
  if (!tweens.length) { startGroup(ev, evEl, listId, index + 1, chain, empties + 1); return; }
  runs.push({ chain, tweens, finished: false, next: () => startGroup(ev, evEl, listId, index + 1, chain) });
}

function stepRuns(now: number) {
  const nexts: Array<() => void> = [];
  for (const run of runs) {
    if (run.chain.cancelled) { run.finished = true; continue; }
    let allDone = true;
    for (const tw of run.tweens) {
      if (tw.done) continue;
      const t0 = tw.start + tw.delay;
      if (now < t0) { allDone = false; continue; }
      if (tw.type === 'GENERAL_DISPLAY') {
        touch(tw.el);
        (tw.el as HTMLElement).style.display = tw.displayValue as string;
        tw.done = true;
        continue;
      }
      const p = tw.duration === 0 ? 1 : Math.min(Math.max(0, (now - t0) / tw.duration), 1);
      const e = applyEasing(tw.easing, p);
      const vals: Record<string, number> = {};
      for (const k of tw.keys) vals[k] = (tw.dest[k] - tw.origin[k]) * e + tw.origin[k];
      applyVals(tw.el, tw.type, vals, tw.cfg);
      if (p >= 1) {
        tw.done = true;
        if (tw.heightAuto) { touch(tw.el); (tw.el as HTMLElement).style.height = 'auto'; }
      } else allDone = false;
    }
    if (allDone) { run.finished = true; nexts.push(run.next); }
  }
  runs = runs.filter((r) => !r.finished);
  nexts.forEach((n) => n());
}

function keyOf(evId: string, el: Element) {
  let id = (el as Any).__ixid;
  if (!id) id = (el as Any).__ixid = ++uid;
  return evId + '|' + id;
}
let uid = 0;

function stopEvent(evId: string, el: Element) {
  const k = keyOf(evId, el);
  const c = runsByKey.get(k);
  if (c) { c.cancelled = true; runsByKey.delete(k); }
}
function trigger(ev: Any, el: Element) {
  const aid = ev.action.config.autoStopEventId;
  if (aid && EVENTS[aid]) stopEvent(aid, el);
  stopEvent(ev.id, el);
  const chain: Chain = { cancelled: false };
  runsByKey.set(keyOf(ev.id, el), chain);
  startGroup(ev, el, ev.action.config.actionListId, 0, chain);
}

/* ── event binding ── */
function on<K extends keyof WindowEventMap>(t: Window, k: K, f: (e: WindowEventMap[K]) => void, o?: AddEventListenerOptions): void;
function on(t: EventTarget, k: string, f: (e: Any) => void, o?: AddEventListenerOptions): void;
function on(t: EventTarget, k: string, f: (e: Any) => void, o?: AddEventListenerOptions) {
  t.addEventListener(k, f as EventListener, o);
  cleanups.push(() => t.removeEventListener(k, f as EventListener, o));
}

function bind(mq: string) {
  const scrollWatchers: Array<() => void> = [];
  for (const id of Object.keys(EVENTS)) {
    const ev = EVENTS[id];
    if (!(ev.mediaQueries || []).includes(mq)) continue;
    const type = ev.eventTypeId;
    const targets = evTargets(ev.target);
    const cfg = evConfig(ev);

    // initial state (first group applied instantly) for time-based lists
    if (ev.action.actionTypeId === 'GENERAL_START_ACTION') {
      const list = LISTS[ev.action.config.actionListId];
      if (list?.useFirstGroupAsInitialState) targets.forEach((t) => applyInitial(list, 0, t));
    }

    switch (type) {
      case 'SCROLLING_IN_VIEW':
        for (const t of targets) for (const c of Array.isArray(ev.config) ? ev.config : [ev.config]) buildContinuous(ev, c, t);
        break;
      case 'SCROLL_INTO_VIEW': {
        for (const t of targets) {
          let st: { visible?: boolean; triggered?: boolean } = {};
          const check = () => {
            const r = t.getBoundingClientRect();
            const de = document.documentElement;
            const off = cfg.scrollOffsetUnit === 'PX' ? cfg.scrollOffsetValue : (de.clientHeight * (cfg.scrollOffsetValue || 0)) / 100;
            const vis = !(r.left > de.clientWidth || r.right < 0 || r.top > de.clientHeight - off || r.bottom < off);
            const changed = st.visible === undefined ? vis : vis !== st.visible;
            st = { ...st, visible: vis };
            if (!changed) return;
            if (!EVENTS[ev.action.config.autoStopEventId] && st.triggered) return;
            if (vis) { st.triggered = true; trigger(ev, t); }
          };
          scrollWatchers.push(check);
        }
        break;
      }
      case 'MOUSE_OVER':
      case 'MOUSE_OUT':
        for (const t of targets) {
          let hovered: boolean | undefined;
          const h = (e: MouseEvent) => {
            const inside = t.contains(e.target as Node);
            let now = false;
            if (e.type === 'mouseover' && inside) now = true;
            else if (e.type === 'mouseout' && inside && t.contains(e.relatedTarget as Node)) now = true;
            const changed = hovered === undefined ? now : now !== hovered;
            hovered = now;
            if (!changed) return;
            if (type === 'MOUSE_OVER' ? now : !now) trigger(ev, t);
          };
          on(t, 'mouseover', h); on(t, 'mouseout', h);
        }
        break;
      case 'MOUSE_CLICK':
      case 'MOUSE_SECOND_CLICK':
        for (const t of targets) {
          let count = 0;
          on(t, 'click', () => {
            count = (count % 2) + 1;
            if (type === 'MOUSE_SECOND_CLICK') { if (count === 2) trigger(ev, t); }
            else if (EVENTS[ev.action.config.autoStopEventId]) { if (count === 1) trigger(ev, t); }
            else trigger(ev, t);
          });
        }
        break;
      case 'DROPDOWN_OPEN':
      case 'DROPDOWN_CLOSE':
        for (const t of targets) on(t, type === 'DROPDOWN_OPEN' ? 'w-dd-open' : 'w-dd-close', () => trigger(ev, t));
        break;
      case 'PAGE_START':
        trigger(ev, document.documentElement);
        break;
      case 'PAGE_SCROLL_UP':
      case 'PAGE_SCROLL_DOWN': {
        const down = type === 'PAGE_SCROLL_DOWN';
        let st: Any;
        const f = () => {
          const de = document.documentElement;
          const stiff = Math.min(Math.max(window.pageYOffset || de.scrollTop, 0), de.scrollHeight - window.innerHeight);
          const u = de.scrollHeight - window.innerHeight;
          const g = Number((stiff / u).toFixed(2));
          if (st && st.percentTop === g) return;
          const y = (cfg.scrollOffsetUnit === 'PX' ? cfg.scrollOffsetValue : (window.innerHeight * (cfg.scrollOffsetValue || 0)) / 100) / u;
          let E = 0, dirChanged = false, sd = false;
          if (st) { sd = g > st.percentTop; dirChanged = st.scrollingDown !== sd; E = dirChanged ? g : st.anchorTop; }
          const inBounds = down ? g >= E + y : g <= E - y;
          const ns = { percentTop: g, inBounds, anchorTop: E, scrollingDown: sd };
          if (st && inBounds && (dirChanged || inBounds !== st.inBounds)) trigger(ev, document.documentElement);
          st = ns;
        };
        scrollWatchers.push(f);
        break;
      }
    }
  }
  if (scrollWatchers.length) {
    let dirty = true;
    const run = () => { dirty = true; };
    on(window, 'scroll', run, { passive: true });
    on(window, 'resize', run);
    const loop = () => { if (dirty) { dirty = false; scrollWatchers.forEach((w) => w()); } };
    (loop as Any).tag = 'watch';
    watchLoops.push(loop);
  }
}
let watchLoops: Array<() => void> = [];

function frame() {
  const now = performance.now();
  watchLoops.forEach((w) => w());
  // all layout reads first (one per unique progress function), then all writes
  const prog = new Map<() => number, number>();
  for (const c of conts) if (!prog.has(c.progress)) prog.set(c.progress, c.progress());
  for (const c of conts) tickCont(c, prog.get(c.progress) as number);
  stepRuns(now);
  rafId = requestAnimationFrame(frame);
}

function teardown() {
  cancelAnimationFrame(rafId);
  cleanups.forEach((f) => f());
  cleanups = [];
  conts = [];
  runs = [];
  runsByKey.clear();
  watchLoops = [];
  ORIG_STYLE.forEach((s, el) => { if (s == null) el.removeAttribute('style'); else el.setAttribute('style', s); });
  ORIG_STYLE.clear();
  TF_STATE = new WeakMap<Element, TF>();
}

export function initIx2(): () => void {
  if (started) return () => {};
  started = true;
  const de = document.documentElement;
  de.classList.add('w-mod-js', 'w-mod-ix');
  currentMq = mqKey();
  bind(currentMq);
  rafId = requestAnimationFrame(frame);
  let to: ReturnType<typeof setTimeout>;
  const onResize = () => {
    clearTimeout(to);
    to = setTimeout(() => {
      const k = mqKey();
      if (k !== currentMq) { teardown(); currentMq = k; on(window, 'resize', onResize); bind(k); rafId = requestAnimationFrame(frame); }
    }, 120);
  };
  on(window, 'resize', onResize);
  (window as Any).__ix2 = { conts: () => conts, mq: () => currentMq };
  return () => { teardown(); started = false; };
}
