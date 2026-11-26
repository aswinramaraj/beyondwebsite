import type { Metadata } from 'next';
import PlaceholderPage from '@/components/PlaceholderPage';

export const metadata: Metadata = { title: 'Products | Beyondlogik', description: 'Beyondlogik EIS and everything built around it.' };

export default function Page() {
  return <PlaceholderPage slug="products" />;
}
