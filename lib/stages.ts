/**
 * The original "stages" timeline (IX2 action list a-165) is hand-tuned for three steps.
 * This site has four, so this rebuilds the keyframes from the original's own item templates:
 *   - same intro / heading hand-off / fade-out timings (expressed in viewport-heights of scroll)
 *   - the same step pitch (≈1.05 vh per step, as measured on the original)
 *   - the left column is positioned so each step's text lands where the original's did
 *     (measured: step text centre ≈ 27.9 rem from the top of the viewport)
 * It runs once, before the IX2 engine binds, and needs the DOM (item heights) to compute offsets.
 */
import { IX_LISTS } from './ix2';

type Any = any;

const ANCHOR_REM = 27.9; // where the active step's text is centred
const START_REM = 80.95; // where step 1 sits when the column first scrolls in
const THETA = [-14, 0, 14, 30]; // ellipse rotation per step (each card's tilt cancels it: -14°, 0°, +14°, -30°+30°)
const ELL_Y = [8, 3, -2, -7.5]; // ellipse y-offset (%) per step (original: 8 / 3 / -2)
const PITCH = 1.05; // viewport-heights of scroll per step
const FIRST = 1.9; // first step (original k38 ⇒ 1.9 vh)

export function adaptStages(): void {
  const list = IX_LISTS['a-165'];
  const hc = document.querySelector('.height-cases') as HTMLElement | null;
  const wrap = document.querySelector('.cards-cases-left-wrap') as HTMLElement | null;
  const items = Array.from(document.querySelectorAll('.cards-cases-left .cases-cards-left-item')) as HTMLElement[];
  if (!list || !hc || !wrap || !items.length) return;
  if (window.innerWidth <= 767) return; // mobile uses the stacked layout

  const N = Math.min(items.length, THETA.length);
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const vh = window.innerHeight;
  const U = hc.offsetHeight / vh + 1; // progress length in vh (element height + one viewport)
  const K = (v: number) => (v / U) * 100;
  const H = wrap.offsetHeight;

  const group = list.continuousParameterGroups[0];
  if (!group.__orig) group.__orig = JSON.parse(JSON.stringify(group.continuousActionGroups));
  const all: Any[] = group.__orig.flatMap((g: Any) => g.actionItems);
  let n = 0;
  const mk = (type: string, sel: string, patch: Any, from?: string) => {
    const tpl = all.find((i) => i.actionTypeId === type && i.config.target?.selector === (from || sel));
    if (!tpl) return null;
    const c = JSON.parse(JSON.stringify(tpl));
    c.id = `a-165-bl-${++n}`;
    c.config.target.selector = sel;
    Object.assign(c.config, patch);
    return c;
  };

  // on the original, the column's untransformed top sits at the panel's padding-top (13 rem) while pinned
  const padTop = parseFloat(getComputedStyle(wrap.parentElement as HTMLElement).paddingTop) || 13 * rem;
  // bounding rects (not offsetTop): the column has a transform, which makes it the items' offsetParent
  const centre = (el: HTMLElement) => el.getBoundingClientRect().top - wrap.getBoundingClientRect().top + el.offsetHeight / 2; // centre relative to the column's top
  const pct = (px: number) => (px / H) * 100;
  const yAt = (screenRem: number, i: number) => pct(screenRem * rem - padTop - centre(items[i]));

  const S = Array.from({ length: N }, (_, i) => FIRST + i * PITCH);
  const pinEnd = U - 1; // the section stays pinned until its bottom reaches the viewport bottom
  const f1 = pinEnd + 0.45;
  const f2 = pinEnd + 0.7;

  const kf: Record<number, Any[]> = {};
  const put = (v: number, it: Any) => { if (!it) return; const k = Number(K(v).toFixed(3)); (kf[k] = kf[k] || []).push(it); };

  // intro
  put(0.4, mk('TRANSFORM_ROTATE', '.rotate-ellipse-2', { zValue: -31 }));
  put(0.95, mk('TRANSFORM_ROTATE', '.rotate-ellipse-2', { zValue: -31 }));
  put(0.4, mk('STYLE_OPACITY', '.top-gradient', { value: 1 }));
  put(0.7, mk('STYLE_OPACITY', '.case--new-heading', { value: 0 }));
  put(1.0, mk('STYLE_OPACITY', '.case--new-heading', { value: 1 }));
  put(1.1, mk('TRANSFORM_MOVE', '.case--new-heading-wrap', { yValue: 0 }));
  put(1.95, mk('TRANSFORM_MOVE', '.case--new-heading-wrap', { yValue: -112 }));
  // column + ring per step
  put(0.95, mk('TRANSFORM_MOVE', '.cards-cases-left-wrap', { yValue: yAt(START_REM, 0) }));
  S.forEach((s, i) => {
    put(s, mk('TRANSFORM_MOVE', '.cards-cases-left-wrap', { yValue: yAt(ANCHOR_REM, i) }));
    put(s, mk('TRANSFORM_ROTATE', '.rotate-ellipse-2', { zValue: THETA[i] }));
    put(s, mk('TRANSFORM_MOVE', '.rotate-ellipse-2', { yValue: ELL_Y[i] }));
    // image cross-fades (offsets measured from the original's windows)
    const sel = `.case-rotate-img.set-${i + 1}`;
    const from = '.case-rotate-img.set-1';
    put(s - 0.45, mk('STYLE_OPACITY', sel, { value: 0 }, from));
    put(s - 0.12, mk('STYLE_OPACITY', sel, { value: 1 }, from));
    if (i < N - 1) {
      put(s + 0.3, mk('STYLE_OPACITY', sel, { value: 1 }, from));
      put(s + 0.65, mk('STYLE_OPACITY', sel, { value: 0 }, from));
    }
  });
  // hand-off after the pin ends
  put(f1, mk('STYLE_BACKGROUND_COLOR', '.cards-cases-right', { rValue: 23, gValue: 23, bValue: 23, aValue: 1 }));
  put(f2, mk('STYLE_BACKGROUND_COLOR', '.cards-cases-right', { rValue: 8, gValue: 8, bValue: 8, aValue: 1 }));
  put(f1, mk('STYLE_OPACITY', '.cards-cases-left', { value: 1 }));
  put(f2, mk('STYLE_OPACITY', '.cards-cases-left', { value: 0 }));
  put(f1, mk('STYLE_OPACITY', '.top-gradient', { value: 1 }));
  put(f2, mk('STYLE_OPACITY', '.top-gradient', { value: 0 }));

  group.continuousActionGroups = Object.keys(kf)
    .map(Number)
    .sort((a, b) => a - b)
    .map((k) => ({ keyframe: k, actionItems: kf[k] }));
}
