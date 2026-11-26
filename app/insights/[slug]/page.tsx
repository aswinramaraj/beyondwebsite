import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Footer from '@/components/Footer';
import { Avatar, ReadingProgress, ShareBar } from '@/components/insights/shared';
import { AUTHOR, formatDate, getPost, getPosts, morePosts, topicKey } from '@/lib/insights';
import '../insights.css';

// every post is generated at build time; unknown slugs are a 404
export const dynamicParams = false;
export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    title: `${post.title} | Beyondlogik Insights`,
    description: post.subtitle,
    openGraph: { type: 'article', title: post.title, description: post.subtitle, publishedTime: post.date, images: [{ url: post.cover, width: 1200, height: 900, alt: post.coverAlt }] },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const more = morePosts(post.slug, 4);
  const topicHref = `/insights?topic=${topicKey(post.topic)}`;

  return (
    <div className="page-wrapper dark bl-ins-page">
      <ReadingProgress target=".bl-art-body" />
      <main className="bl-art">
        <article>
          <header className="bl-art-head">
            <nav className="bl-art-crumbs" aria-label="Breadcrumb">
              <a href="/insights">Insights</a><span aria-hidden="true">/</span><a href={topicHref}>{post.topic}</a>
            </nav>
            <h1 className="bl-art-title">{post.title}</h1>
            <p className="bl-art-sub">{post.subtitle}</p>
            <div className="bl-art-author">
              <Avatar size="md" />
              <div>
                <div className="bl-art-name">{AUTHOR.name}</div>
                <div className="bl-art-when">{post.minutes} min read · <time dateTime={post.date}>{formatDate(post.date)}</time></div>
              </div>
            </div>
            <div className="bl-art-bar">
              <a href={topicHref} className="bl-chip">{post.topic}</a>
              <ShareBar title={post.title} />
            </div>
          </header>

          <figure className="bl-art-cover">
            <img src={post.cover} alt={post.coverAlt} width={1200} height={900} fetchPriority="high" />
          </figure>

          <div className="bl-art-body bl-prose" dangerouslySetInnerHTML={{ __html: post.html }} />

          <footer className="bl-art-foot">
            <div className="bl-art-tags">
              <a href={topicHref} className="bl-chip is-big">{post.topic}</a>
              <a href="/insights" className="bl-chip is-big">Insights</a>
            </div>
            <div className="bl-art-bar is-bottom">
              <span className="bl-art-when">Published <time dateTime={post.date}>{formatDate(post.date)}</time></span>
              <ShareBar title={post.title} />
            </div>
          </footer>
        </article>

        <section className="bl-art-writer" aria-label="About the author">
          <div className="bl-art-writer-in">
            <Avatar size="lg" />
            <div>
              <p className="bl-art-writer-h">Written by {AUTHOR.name}</p>
              <p className="bl-art-writer-p">{AUTHOR.bio}</p>
            </div>
            <a href="/insights" className="bl-btn">All insights</a>
          </div>
        </section>

        <section className="bl-art-more" aria-labelledby="more-h">
          <h2 id="more-h" className="bl-art-more-h">More from Insights</h2>
          <ul className="bl-art-grid">
            {more.map((p) => (
              <li key={p.slug} className="bl-card">
                <a href={`/insights/${p.slug}`} className="bl-card-img" tabIndex={-1} aria-hidden="true">
                  <img src={p.cover} alt="" loading="lazy" width={1200} height={900} />
                </a>
                <div className="bl-ins-by"><Avatar size="xs" /><span>{AUTHOR.name}</span></div>
                <a href={`/insights/${p.slug}`} className="bl-card-link">
                  <h3 className="bl-card-title">{p.title}</h3>
                  <p className="bl-card-sub">{p.subtitle}</p>
                </a>
                <div className="bl-ins-meta"><span className="bl-chip is-static">{p.topic}</span><span><time dateTime={p.date}>{formatDate(p.date, true)}</time> · {p.minutes} min read</span></div>
              </li>
            ))}
          </ul>
          <a href="/insights" className="bl-btn is-ghost">See all insights</a>
        </section>
      </main>
      <Footer base="/" />
    </div>
  );
}
