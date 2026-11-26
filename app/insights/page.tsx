import type { Metadata } from 'next';
import Footer from '@/components/Footer';
import InsightsFeed from '@/components/insights/InsightsFeed';
import { AUTHOR, PICKS, TOPICS, getPosts, toMeta } from '@/lib/insights';
import './insights.css';

export const metadata: Metadata = {
  title: 'Insights | Beyondlogik',
  description: 'Notes from the Beyondlogik team on the technology shaping how people learn, build and work: AI agents, security, the web and more.',
};

export default function Page() {
  const posts = getPosts().map(toMeta);
  const picks = PICKS.map((s) => posts.find((p) => p.slug === s)).filter((p) => p !== undefined);
  return (
    <div className="page-wrapper dark bl-ins-page">
      <main>
        <InsightsFeed posts={posts} topics={TOPICS} picks={picks} author={AUTHOR.name} about={AUTHOR.bio} />
      </main>
      <Footer base="/" />
    </div>
  );
}
