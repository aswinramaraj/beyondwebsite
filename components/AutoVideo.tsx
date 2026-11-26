'use client';
import { useEffect, useRef } from 'react';

/**
 * Muted, looping, inline video – the same attributes the original page uses
 * (`playsinline loop muted autoplay`). React does not serialise `muted` into server HTML, so the video is
 * muted and started explicitly after mount (browsers only allow autoplay for muted media).
 *
 * `lazy` videos (the five "Focus" motion graphics) download and play only while they are near the viewport and pause
 * when scrolled away; with "reduce motion" on, they stay on their poster frame.
 */
export default function AutoVideo({ src, poster, id, className, lazy = false, preload = 'auto' }: { src: string; poster?: string; id?: string; className?: string; lazy?: boolean; preload?: 'auto' | 'metadata' | 'none' }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    const play = () => { v.play().catch(() => { /* blocked until interaction; poster stays visible */ }); };
    if (lazy) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) play(); else v.pause(); });
      }, { rootMargin: '200px 0px' });
      io.observe(v);
      return () => io.disconnect();
    }
    play();
    // some browsers pause hidden media; resume when it becomes visible again
    const onVis = () => { if (!document.hidden) play(); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [lazy]);
  return <video ref={ref} id={id} className={className} src={src} poster={poster} playsInline loop muted autoPlay={!lazy} preload={lazy ? 'none' : preload} data-wf-ignore="true" />;
}
