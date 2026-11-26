'use client';
import { useEffect } from 'react';
import { initEffects } from '@/lib/effects';

/** Boots Lenis, the IX2 engine and all scripted behaviours once the page has hydrated. */
export default function Runtime() {
  useEffect(() => {
    const stop = initEffects();
    return stop;
  }, []);
  return null;
}
