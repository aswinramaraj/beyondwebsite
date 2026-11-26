import type { Metadata } from 'next';
import './webflow.css';
import './inline.css';
import './site.css';
import './light.css';
import './yali.css';
import SiteHeader from '@/components/SiteHeader';
import YaliPet from '@/components/YaliPet';

export const metadata: Metadata = {
  // absolute base for social-preview images (e.g. the Insights covers). Set SITE_URL=https://your-domain when building for production.
  metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3000'),
  title: 'Beyondlogik EIS – Enterprise Intelligence System',
  description:
    'Beyondlogik EIS is one app for your workplace: an AI agent that answers employee questions, AI attendance, live bus tracking and cafeteria pre-ordering.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="w-mod-js">
      <body>
        <SiteHeader />
        {children}
        <YaliPet />
      </body>
    </html>
  );
}
