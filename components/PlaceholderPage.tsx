import Footer from '@/components/Footer';
import { placeholders, brand } from '@/lib/content';

/** A page that has its place in the site (header link, title, footer) but no content yet. */
export default function PlaceholderPage({ slug }: { slug: keyof typeof placeholders }) {
  const p = placeholders[slug];
  return (
    <>
      <div className="page-wrapper dark bl-placeholder">
        <main className="bl-ph-main">
          <p className="bl-ph-kicker">{brand.name}</p>
          <h1 className="bl-ph-title">{p.title}</h1>
          <p className="bl-ph-lead">{p.lead}</p>
          <p className="bl-ph-soon"><span aria-hidden="true" />This page is coming soon</p>
          <a href="/" className="bl-ph-back">← Back to home</a>
        </main>
        <Footer base="/" />
      </div>
    </>
  );
}
