import type { Metadata } from 'next';
import MascotDemo from '@/components/MascotDemo';
import './mascot-demo.css';

// a test page: not linked anywhere and kept out of search results
export const metadata: Metadata = { title: 'Mascot demo | Beyondlogik', robots: { index: false, follow: false } };

export default function Page() {
  return <MascotDemo />;
}
