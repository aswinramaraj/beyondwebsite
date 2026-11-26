'use client';
import { useEffect } from 'react';
import { initAboutMotion } from '@/lib/about-motion';

/** Boots the About page's smooth scroll and scroll animations after hydration (see lib/about-motion.ts). */
export default function AboutMotion() {
  useEffect(() => initAboutMotion(), []);
  return null;
}
