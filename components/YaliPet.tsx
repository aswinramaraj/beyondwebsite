'use client';
/**
 * Yali, the Beyondlogik pet, flying around every page (mounted in app/layout.tsx).
 * It replaces the header mascot: it takes off from beside Contact, roams under the text, bites buttons and breathes fire.
 * Behaviour: lib/yali/roam.ts · styles: app/yali.css. Not rendered on phones (< 768 px), with prefers-reduced-motion
 * (the header then shows its static mascot poster) or on /mascot-demo (which has its own big mascot).
 */
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Mascot, { type MascotHandle } from '@/components/Mascot';
import { initRoam } from '@/lib/yali/roam';

export function useYaliEnabled() {
  const path = usePathname() || '/';
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const wide = matchMedia('(min-width: 768px)');
    const calm = matchMedia('(prefers-reduced-motion: reduce)');
    const upd = () => setOk(wide.matches && !calm.matches);
    upd();
    wide.addEventListener('change', upd); calm.addEventListener('change', upd);
    return () => { wide.removeEventListener('change', upd); calm.removeEventListener('change', upd); };
  }, []);
  return ok && path !== '/mascot-demo';
}

export default function YaliPet() {
  const on = useYaliEnabled();
  const pet = useRef<HTMLDivElement>(null);
  const flip = useRef<HTMLDivElement>(null);
  const shadow = useRef<HTMLDivElement>(null);
  const fx = useRef<HTMLDivElement>(null);
  const handle = useRef<MascotHandle>(null);
  const phase = useRef('rest');

  useEffect(() => {
    if (!on || !pet.current) return;
    return initRoam({ pet: pet.current, flip: flip.current, shadow: shadow.current, fx: fx.current, mascot: () => handle.current, phase: () => phase.current });
  }, [on]);

  if (!on) return null;
  return (
    <>
      <svg className="yl-defs" aria-hidden="true" width="0" height="0">
        <filter id="yl-char" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="38" />
        </filter>
      </svg>
      <div className="yl-fx" ref={fx} aria-hidden="true" />
      <div className="yl-shadow" ref={shadow} aria-hidden="true" />
      <div className="yl-pet" ref={pet} aria-hidden="true">
        <div className="yl-pet__flip" ref={flip}>
          <Mascot ref={handle} onPhase={(p) => { phase.current = p; }} idle="fly" hover={false} click={false} autoplay={false} yaw={0.55} poster="/mascot-header.webp" alt="Yali, the Beyondlogik pet" />
        </div>
      </div>
    </>
  );
}
