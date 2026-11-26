/**
 * Scroll-scrubbed IX2 timelines are expressed as % of (viewport height + element height), so an effect's length
 * in pixels depends on how tall its section is. Several sections here are shorter/taller than the originals
 * (fewer FAQ rows, more product rows, …). To keep every effect playing over the same *scroll distance* as the
 * original, each affected timeline's keyframes are rescaled by
 *      (vh + originalHeight) / (vh + ourHeight).
 * Original heights are in rem (measured on outcrowd.io at 1440 px, root 14.4 px).
 */
import { IX_LISTS } from './ix2';

type Any = any;
// action list → [selector of the section the timeline is bound to, original height in rem]
const ORIGINAL_REM: Record<string, [string, number]> = {
  'a-100': ['.section.is-cases', 218.96], // services heading (3153 px)
  'a-117': ['.section.bg-dark.cards', 81.32], // stats cards (1171 px)
  'a-132': ['.section.is-blog', 95.14], // insights heading shadow (1370 px)
  'a-131': ['.section.is-faq', 119.24], // faq heading shadow (1717 px)
  'a-171': ['.case--new-heading-wrap', 31.39], // steps intro (452 px)
};

export function compensateHeights(): void {
  if (window.innerWidth <= 767) return;
  const vh = window.innerHeight;
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
  for (const [id, [sel, remH]] of Object.entries(ORIGINAL_REM)) {
    const list: Any = IX_LISTS[id];
    const el = document.querySelector(sel) as HTMLElement | null;
    const pg = list?.continuousParameterGroups?.[0];
    if (!list || !el || !pg) continue;
    if (!pg.__origKf) pg.__origKf = pg.continuousActionGroups.map((g: Any) => g.keyframe);
    const scale = (vh + remH * rem) / (vh + el.offsetHeight);
    pg.continuousActionGroups.forEach((g: Any, i: number) => {
      g.keyframe = Math.min(100, Number((pg.__origKf[i] * scale).toFixed(3)));
    });
    // keep keyframes strictly ordered after clamping
    for (let i = 1; i < pg.continuousActionGroups.length; i++) {
      const a = pg.continuousActionGroups[i - 1];
      const b = pg.continuousActionGroups[i];
      if (b.keyframe < a.keyframe) b.keyframe = a.keyframe;
    }
  }
}
