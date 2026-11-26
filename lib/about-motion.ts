/**
 * About page motion (after outcrowd.io/about-us), GSAP + ScrollTrigger on Lenis smooth scroll:
 *  hero    – headline and mark lift away while eight product visuals fly in from a scattered fan and lock into a 4 × 2 grid (sticky stage)
 *  reveals – headline / mission words brighten one by one with the scroll; blocks fade up once
 *  numbers – each digit rolls up to its value when the row enters
 *  values  – the pills drop in one at a time and stack, the description beside them changes (sticky stage)
 *  studio  – highlight boxes wipe in behind "curious" and "minds."; the collage columns drift at different speeds
 *  story   – the timeline scrolls sideways while the page scrolls down (sticky stage); the year buttons jump to a chapter
 * Phones (< 768 px) get the light version (fades, digits, highlights) on a normal vertical layout; with prefers-reduced-motion nothing moves.
 * The static layout lives in about.css under the same media queries, so the page reads fine before / without this script.
 */
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
const $ = (s: string, r: ParentNode = document) => r.querySelector(s) as HTMLElement | null;
const $$ = (s: string, r: ParentNode = document) => Array.from(r.querySelectorAll(s)) as HTMLElement[];

export const DESKTOP = '(min-width: 768px) and (prefers-reduced-motion: no-preference)';
export const PHONE = '(max-width: 767px) and (prefers-reduced-motion: no-preference)';

export function initAboutMotion(): () => void {
  const root = $('.bl-about');
  if (!root) return () => {};
  gsap.registerPlugin(ScrollTrigger);
  const cleanups: Array<() => void> = [];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── smooth scroll, same feel as the home page ── */
  let lenis: Any = null;
  if (!reduce) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.7, gestureOrientation: 'vertical', normalizeWheel: false, smoothTouch: false } as Any);
    lenis.on('scroll', ScrollTrigger.update);
    let raf = 0;
    const loop = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    cleanups.push(() => { cancelAnimationFrame(raf); lenis.destroy(); });
  }
  const scrollToY = (y: number) => (lenis ? lenis.scrollTo(y, { duration: 1.2 }) : window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' }));

  const mm = gsap.matchMedia();
  let pinnedStory = false;

  // shared by both sizes: word reveals, fade-ups, rolling digits, highlight wipes
  const common = (wordStart: string) => {
    $$('.ab-reveal', root).forEach((el) => {
      gsap.fromTo($$('.ab-w', el), { opacity: 0.16 }, { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: el, start: wordStart, end: 'bottom 50%', scrub: 0.5 } });
    });
    $$('.ab-fade', root).forEach((el) => {
      gsap.from(el, { y: 48, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
    $$('.ab-stat', root).forEach((row) => {
      const strips = $$('.ab-roll-strip', row);
      gsap.set(strips, { clearProps: 'transform' });
      gsap.fromTo(strips, { yPercent: 0 }, { yPercent: (_i: number, el: HTMLElement) => -Number(el.dataset.d) * 10, duration: 1.8, ease: 'power3.out', stagger: 0.14, scrollTrigger: { trigger: row, start: 'top 85%', once: true } });
    });
    const hl = $('.ab-studio-title', root);
    if (hl) {
      const st = { trigger: hl, start: 'top 80%', once: true };
      gsap.fromTo($$('.ab-hl-bg', hl), { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'power3.inOut', stagger: 0.3, scrollTrigger: st });
      gsap.fromTo($$('.ab-hl-txt', hl), { color: '#080808' }, { color: '#ffffff', duration: 0.5, delay: 0.35, stagger: 0.3, scrollTrigger: { ...st } });
    }
  };

  mm.add(DESKTOP, () => {
    common('top 82%');

    /* hero: the head lifts away, the tiles converge into the grid */
    const hero = $('.ab-hero', root)!;
    const tiles = $$('.ab-tile', hero);
    const scatter = (i: number) => {
      const col = i % 4, row = Math.floor(i / 4), j = ((i * 37) % 11) / 10 - 0.5; // deterministic jitter
      return { x: (col - 1.5) * 190 + j * 80, y: window.innerHeight * 0.62 + row * 110 + j * 60, rotation: (col - 1.5) * 10 + j * 8, scale: 0.7 };
    };
    gsap.set(tiles, { opacity: 0, x: (i: number) => scatter(i).x, y: (i: number) => scatter(i).y, rotation: (i: number) => scatter(i).rotation, scale: 0.7 });
    gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom bottom', scrub: 0.7, invalidateOnRefresh: true } })
      .to('.ab-hero-head', { y: -140, opacity: 0, duration: 0.3, ease: 'power1.in' }, 0)
      .to('.ab-mark', { scale: 0.4, y: -200, opacity: 0, duration: 0.36, ease: 'power1.in' }, 0.04)
      .to(tiles, { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, duration: 0.62, ease: 'power2.out', stagger: 0.035 }, 0.16)
      .to({}, { duration: 0.12 });

    /* values: drop and stack */
    const vals = $('.ab-values', root)!;
    const items = $$('.ab-value', vals);
    const pills = items.map((li) => $('.ab-pill', li)!);
    const texts = items.map((li) => $('.ab-value-p', li)!);
    const tilt = [-5, 4, -3, 5];
    gsap.set(pills, { y: () => -window.innerHeight * 0.85, rotation: (i: number) => tilt[i % 4] * 5, opacity: 0 });
    gsap.set(texts, { opacity: 0, y: 24 });
    const vt = gsap.timeline({ scrollTrigger: { trigger: vals, start: 'top 35%', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true } });
    items.forEach((_, i) => {
      vt.to(pills[i], { y: 0, rotation: tilt[i % 4], opacity: 1, duration: 0.7, ease: 'back.out(1.3)' }, i);
      if (i > 0) vt.to(texts[i - 1], { opacity: 0, y: -24, duration: 0.3 }, i);
      vt.to(texts[i], { opacity: 1, y: 0, duration: 0.35 }, i + 0.3);
    });
    vt.to({}, { duration: 0.8 });

    /* studio collage: three columns drift at different speeds */
    const collage = $('.ab-collage', root);
    if (collage) $$('.ab-col', collage).forEach((c, i) => {
      gsap.fromTo(c, { yPercent: [10, -2, 16][i] }, { yPercent: [-10, 6, -14][i], ease: 'none', scrollTrigger: { trigger: collage, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    /* story: sideways */
    const story = $('.ab-story', root)!;
    const track = $('.ab-track', story)!;
    const btns = $$('.ab-years button', story);
    const n = btns.length;
    const setActive = (k: number) => btns.forEach((b, i) => (i === k ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current')));
    gsap.to(track, {
      x: () => -(track.scrollWidth - window.innerWidth),
      ease: 'none',
      scrollTrigger: { trigger: story, start: 'top top', end: 'bottom bottom', scrub: 0.8, invalidateOnRefresh: true, onUpdate: (self) => setActive(Math.round(self.progress * (n - 1))) },
    });
    pinnedStory = true;

    /* what we build: cards rise in batches */
    gsap.set('.ab-card', { opacity: 0, y: 40 });
    ScrollTrigger.batch('.ab-card', { start: 'top 90%', once: true, onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08 }) });

    return () => { pinnedStory = false; };
  });

  mm.add(PHONE, () => { common('top 90%'); });

  /* year buttons: jump to a chapter (sideways position on desktop, the chapter itself on phones) */
  const onYear = (e: Event) => {
    const b = (e.target as HTMLElement).closest('.ab-years button') as HTMLElement | null;
    if (!b) return;
    const i = Number(b.dataset.i);
    const story = $('.ab-story', root)!;
    if (pinnedStory) {
      const n = $$('.ab-years button', story).length;
      const top = story.getBoundingClientRect().top + window.scrollY;
      scrollToY(top + (i / Math.max(1, n - 1)) * (story.offsetHeight - window.innerHeight) + 2);
    } else {
      const ch = $$('.ab-chapter', story)[i];
      if (ch) scrollToY(ch.getBoundingClientRect().top + window.scrollY - 80);
    }
  };
  root.addEventListener('click', onYear);
  cleanups.push(() => root.removeEventListener('click', onYear));

  // positions depend on fonts and images
  const refresh = () => ScrollTrigger.refresh();
  (document as Any).fonts?.ready?.then(refresh).catch(() => {});
  if (document.readyState === 'complete') requestAnimationFrame(refresh); else window.addEventListener('load', refresh, { once: true });
  cleanups.push(() => window.removeEventListener('load', refresh));

  return () => {
    mm.revert();
    cleanups.forEach((f) => f());
  };
}
