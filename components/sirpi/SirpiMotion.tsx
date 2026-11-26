'use client';
import { useEffect } from 'react';
import { createCtx, initFilm } from '@/lib/sirpi/film';
import { initInteract } from '@/lib/sirpi/interact';
import { initContest } from '@/lib/sirpi/contest';
import { initBonfire } from '@/lib/sirpi/bonfire';

/** Boots the Sirpi page (/studio): the scroll film, parallax, signature pen and contest (see lib/sirpi). Cleans up on navigation. */
export default function SirpiMotion() {
  useEffect(() => {
    const root = document.querySelector('.bl-sirpi') as HTMLElement | null;
    if (!root) return;
    const { ctx, destroy } = createCtx(root);
    const offFilm = initFilm(ctx);
    const offInteract = initInteract(ctx);
    const offContest = initContest(ctx);
    const offFire = initBonfire(ctx);
    return () => { offFire(); offContest(); offInteract(); offFilm(); destroy(); };
  }, []);
  return null;
}
