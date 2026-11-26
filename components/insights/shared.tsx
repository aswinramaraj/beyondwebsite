'use client';
/** Small pieces shared by the Insights feed and article pages: the team avatar, copy-link / share buttons and the reading progress bar. */
import { useEffect, useRef, useState } from 'react';

export function Avatar({ size = 'md' }: { size?: 'xs' | 'sm' | 'md' | 'lg' }) {
  return (
    <span className={`bl-ava is-${size}`} aria-hidden="true">
      <img src="/img/logo-mark-168.webp" alt="" width={168} height={175} />
    </span>
  );
}

const LinkIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1" /><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" /></svg>
);
const CheckIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5 10 17.5 19 7" /></svg>;

/** copies the absolute URL of `href` (default: this page) and confirms for a moment */
export function CopyLinkButton({ href, label = 'Copy link' }: { href?: string; label?: string }) {
  const [done, setDone] = useState(false);
  const t = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(t.current), []);
  const copy = async () => {
    const url = href ? new URL(href, location.origin).href : location.href.split('#')[0];
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = Object.assign(document.createElement('textarea'), { value: url });
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
    }
    setDone(true);
    window.clearTimeout(t.current);
    t.current = window.setTimeout(() => setDone(false), 1800);
  };
  return (
    <button type="button" className={`bl-icon-btn${done ? ' is-done' : ''}`} onClick={copy} aria-label={done ? 'Link copied' : label} title={done ? 'Link copied' : label}>
      {done ? <CheckIcon /> : <LinkIcon />}
      <span className="bl-icon-tip" aria-live="polite">{done ? 'Link copied' : ''}</span>
    </button>
  );
}

/** copy link + LinkedIn + X. The share links are plain links that the reader chooses to open – nothing is loaded from those sites. */
export function ShareBar({ title }: { title: string }) {
  const [url, setUrl] = useState('');
  useEffect(() => setUrl(location.href.split('#')[0]), []);
  const u = encodeURIComponent(url);
  return (
    <div className="bl-share">
      <CopyLinkButton />
      <a className="bl-icon-btn" href={url ? `https://www.linkedin.com/sharing/share-offsite/?url=${u}` : undefined} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" title="Share on LinkedIn">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="is-fill"><path d="M6.5 8.6H3.6V20h2.9V8.6ZM5 4a1.7 1.7 0 1 0 0 3.4A1.7 1.7 0 0 0 5 4Zm15 9.3c0-3-1.6-4.9-4.2-4.9-1.4 0-2.4.7-2.9 1.5V8.6H10V20h2.9v-6c0-1.6.8-2.6 2.1-2.6 1.3 0 2 .9 2 2.6v6H20v-6.7Z" /></svg>
      </a>
      <a className="bl-icon-btn" href={url ? `https://x.com/intent/post?url=${u}&text=${encodeURIComponent(title)}` : undefined} target="_blank" rel="noopener noreferrer" aria-label="Share on X" title="Share on X">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="is-fill"><path d="M17.8 3h3l-6.6 7.6L22 21h-6.1l-4.8-6.2L5.6 21h-3l7.1-8.1L2.2 3h6.2l4.3 5.7L17.8 3Zm-1 16.2h1.7L7.4 4.7H5.6l11.2 14.5Z" /></svg>
      </a>
    </div>
  );
}

/** thin bar at the top of the window that fills as the article is read */
export function ReadingProgress({ target }: { target: string }) {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = document.querySelector(target);
    if (!el || !bar.current) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, [target]);
  return <div className="bl-progress" aria-hidden="true"><div ref={bar} /></div>;
}
