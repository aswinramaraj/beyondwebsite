'use client';
/**
 * Site-wide top header: wordmark + About / Products / Insights / Studio on the left,
 * Contact button + the Beyond Logik mascot (3D, components/Mascot.tsx) on the right.
 * The mascot hovers just left of the Contact button: it takes off (Lift → Fly) when the header is on screen, does a trick every so often,
 * spins when the pointer is over it, does a backflip when clicked and breathes fire when Contact is hovered or focused.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { brand, siteNav, headerContact } from '@/lib/content';
import { useYaliEnabled } from './YaliPet';

const Mascot = dynamic(() => import('./Mascot'), { ssr: false });

function useWide() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return wide;
}

export default function SiteHeader() {
  const path = usePathname() || '/';
  const fireAt = useRef(-Infinity); // time of the last fire (so the very first hover is never blocked by the cooldown)
  const [fire, setFire] = useState(0);
  const hdrRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const wide = useWide();

  useEffect(() => { if (wide) setOpen(false); }, [wide]);

  // Yali (components/YaliPet.tsx) roams every page and takes off from beside Contact; the header only keeps its own (static)
  // mascot when Yali is off (prefers-reduced-motion). The demo page has its own, larger mascot.
  const yali = useYaliEnabled();
  const showMascot = wide && !yali && path !== '/mascot-demo';
  // hovering / focusing the Contact button makes the mascot breathe fire at it (at most once every 5 s): Yali flies over to do it
  const breatheFire = useCallback((e: React.SyntheticEvent<HTMLElement>) => {
    const now = performance.now();
    if (now - fireAt.current < 5000) return;
    fireAt.current = now;
    if (yali) window.dispatchEvent(new CustomEvent('yali:fire-at', { detail: { el: e.currentTarget } }));
    else setFire((n) => n + 1);
  }, [yali]);

  // The bar has no background, so its text must stay readable over whatever scrolls beneath it:
  // look at what is behind the logo and links and switch to light text over dark areas (the showreel video, dark frames).
  useEffect(() => {
    const hdr = hdrRef.current;
    if (!hdr) return;
    const lum = (c: string) => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const v = m[1].split(/[ ,/]+/).map(parseFloat);
      return { l: (0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]) / 255, a: v.length > 3 ? v[3] : 1 };
    };
    // average brightness of the video pixels behind (x, y): footage can be dark or light, so look at the actual frame
    const probe = document.createElement('canvas');
    probe.width = 12; probe.height = 3;
    const pctx = probe.getContext('2d', { willReadFrequently: true });
    const videoLum = (v: HTMLVideoElement, x: number, y: number) => {
      if (!pctx || v.readyState < 2 || !v.videoWidth) return null;
      const r = v.getBoundingClientRect();
      const fit = getComputedStyle(v).objectFit;
      const sc = fit === 'contain' ? Math.min(r.width / v.videoWidth, r.height / v.videoHeight) : Math.max(r.width / v.videoWidth, r.height / v.videoHeight);
      const ox = r.left + (r.width - v.videoWidth * sc) / 2, oy = r.top + (r.height - v.videoHeight * sc) / 2;
      const sx = Math.max(0, (x - 70 - ox) / sc), sy = Math.max(0, (y - 16 - oy) / sc);
      const sw = Math.min(v.videoWidth - sx, 140 / sc), sh = Math.min(v.videoHeight - sy, 32 / sc);
      if (sw < 1 || sh < 1) return null;
      try {
        pctx.drawImage(v, sx, sy, sw, sh, 0, 0, 12, 3);
        const d = pctx.getImageData(0, 0, 12, 3).data;
        let t = 0;
        for (let i = 0; i < d.length; i += 4) t += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
        return t / (d.length / 4) / 255;
      } catch { return null; }
    };
    const darkAt = (x: number, y: number) => {
      for (const el of document.elementsFromPoint(x, y)) {
        if (hdr.contains(el) || el.closest('.bl-mascot-slot')) continue;
        if (el instanceof HTMLVideoElement) {
          const l = videoLum(el, x, y);
          return l === null ? true : l < 0.45;
        }
        const bg = lum(getComputedStyle(el).backgroundColor);
        if (bg && bg.a > 0.6) return bg.l < 0.4;
      }
      return false;
    };
    const update = () => {
      const logo = hdr.querySelector('.bl-top-logo')?.getBoundingClientRect();
      if (!logo || !logo.width) return;
      const y = logo.top + logo.height / 2;
      const xs = [logo.left + logo.width / 2];
      const nav = hdr.querySelector('.bl-top-nav')?.getBoundingClientRect();
      if (nav && nav.width) xs.push(nav.left + nav.width * 0.25, nav.left + nav.width * 0.75);
      const tone = xs.filter((x) => darkAt(x, y)).length * 2 > xs.length ? 'dark' : 'light';
      if (hdr.dataset.tone !== tone) hdr.dataset.tone = tone;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    const iv = window.setInterval(update, 250); // scroll-driven animations keep moving after the scroll stops
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); window.clearInterval(iv); };
  }, [wide]);

  return (
    <>
      <header ref={hdrRef} className="bl-top" data-tone="light" data-open={open ? 'true' : 'false'}>
        <div className="bl-top-in">
          <div className="bl-top-left">
            <a href="/" className="bl-top-logo" aria-label={`${brand.name} – home`}>
              <img src="/img/logo-wordmark.webp" width={480} height={80} alt="" className="bl-top-logo-img is-light" />
              <img src="/img/logo-wordmark-white.webp" width={480} height={80} alt="" aria-hidden="true" className="bl-top-logo-img is-dark" />
            </a>
            <nav className="bl-top-nav" aria-label="Main">
              {siteNav.map((l) => (
                <a key={l.href} href={l.href} className="bl-top-link" aria-current={path.startsWith(l.href) ? 'page' : undefined}>
                  <span className="bl-top-link-in">
                    <span className="bl-top-link-a">{l.label}</span>
                    <span className="bl-top-link-b" aria-hidden="true">{l.label}</span>
                  </span>
                </a>
              ))}
            </nav>
            <button type="button" className="bl-burger" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
              <span /><span />
            </button>
          </div>
          <div className="bl-top-right">
            {showMascot && (
              <div className="bl-mascot-slot">
                <Mascot idle="fly" autoplay yaw={0.55} poster="/mascot-header.webp" action={fire ? 'Fire' : null} actionKey={fire} />
              </div>
            )}
            <a href={headerContact.href} className="bl-contact" onMouseEnter={breatheFire} onFocus={breatheFire}>
              <span className="bl-contact-in">{headerContact.label}</span>
            </a>
          </div>
        </div>
        <div className="bl-top-menu" hidden={!open}>
          {siteNav.map((l) => (
            <a key={l.href} href={l.href} className="bl-top-menu-link" onClick={() => setOpen(false)}>{l.label}</a>
          ))}
          <a href={headerContact.href} className="bl-top-menu-cta" onClick={() => setOpen(false)}>{headerContact.label}</a>
        </div>
      </header>
    </>
  );
}
