'use client';
/**
 * /insights: a Medium-style reading feed in the site's theme. Topic tabs and a search box filter the list in place;
 * the choice is kept in the URL (?topic=security&q=passkeys) so a filtered view can be shared.
 */
import { useEffect, useMemo, useState } from 'react';
import type { PostMeta } from '@/lib/insights';
import { formatDate as fmtDate, topicKey } from '@/lib/insights-format';
import { Avatar, CopyLinkButton } from './shared';

interface Props {
  posts: PostMeta[];
  topics: readonly string[];
  picks: PostMeta[];
  author: string;
  about: string;
}

export default function InsightsFeed({ posts, topics, picks, author, about }: Props) {
  const [topic, setTopic] = useState<string>('all');
  const [q, setQ] = useState('');

  // restore the filter from the URL (client-side only, so the page itself stays fully static)
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const t = sp.get('topic');
    if (t && topics.some((x) => topicKey(x) === t)) setTopic(t);
    const s = sp.get('q');
    if (s) setQ(s);
  }, [topics]);
  useEffect(() => {
    const sp = new URLSearchParams();
    if (topic !== 'all') sp.set('topic', topic);
    if (q.trim()) sp.set('q', q.trim());
    const url = location.pathname + (sp.toString() ? `?${sp}` : '');
    if (url !== location.pathname + location.search) history.replaceState(history.state, '', url);
  }, [topic, q]);

  const counts = useMemo(() => Object.fromEntries(topics.map((t) => [t, posts.filter((p) => p.topic === t).length])), [posts, topics]);
  const shown = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return posts.filter((p) => {
      if (topic !== 'all' && topicKey(p.topic) !== topic) return false;
      const hay = `${p.title} ${p.subtitle} ${p.topic}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }, [posts, topic, q]);

  const pick = (t: string) => { setTopic(t); window.scrollTo({ top: Math.min(window.scrollY, (document.getElementById('feed')?.offsetTop ?? 0) - 40), behavior: 'smooth' }); };

  return (
    <div className="bl-ins">
      <header className="bl-ins-head">
        <div>
          <p className="bl-ins-kicker">Beyondlogik Insights</p>
          <h1 className="bl-ins-title">Insights</h1>
          <p className="bl-ins-lead">Notes from our team on the technology shaping how people learn, build and work, from AI agents to passkeys.</p>
        </div>
        <label className="bl-ins-search">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5 L20 20" /></svg>
          <span className="bl-sr">Search insights</span>
          <input type="search" placeholder="Search insights" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
      </header>

      <div className="bl-ins-layout">
        <div className="bl-ins-main" id="feed">
          <nav className="bl-ins-tabs" aria-label="Topics">
            {[['all', 'All'] as const, ...topics.map((t) => [topicKey(t), t] as const)].map(([k, label]) => (
              <button key={k} type="button" className="bl-ins-tab" aria-pressed={topic === k} onClick={() => setTopic(k)}>{label}</button>
            ))}
          </nav>

          <p className="bl-sr" aria-live="polite">{shown.length} {shown.length === 1 ? 'article' : 'articles'}</p>
          {shown.length === 0 ? (
            <div className="bl-ins-empty">
              <p>No insights match{q ? <> &ldquo;{q}&rdquo;</> : null}{topic !== 'all' ? ' in this topic' : ''}.</p>
              <button type="button" onClick={() => { setQ(''); setTopic('all'); }}>Show all insights</button>
            </div>
          ) : (
            <ol className="bl-ins-list">
              {shown.map((p) => (
                <li key={p.slug} className="bl-ins-item">
                  <div className="bl-ins-item-main">
                    <div className="bl-ins-by"><Avatar size="sm" /><span>{author}</span><span className="bl-ins-in">in</span><span>Insights</span></div>
                    <a href={`/insights/${p.slug}`} className="bl-ins-item-link">
                      <h2 className="bl-ins-item-title">{p.title}</h2>
                      <p className="bl-ins-item-sub">{p.subtitle}</p>
                    </a>
                    <div className="bl-ins-meta">
                      <button type="button" className="bl-chip" onClick={() => pick(topicKey(p.topic))}>{p.topic}</button>
                      <span><time dateTime={p.date}>{fmtDate(p.date, true)}</time> · {p.minutes} min read</span>
                      <span className="bl-ins-meta-sp" />
                      <CopyLinkButton href={`/insights/${p.slug}`} />
                    </div>
                  </div>
                  <a href={`/insights/${p.slug}`} className="bl-ins-thumb" tabIndex={-1} aria-hidden="true">
                    <img src={p.cover} alt="" loading="lazy" width={1200} height={900} />
                  </a>
                </li>
              ))}
            </ol>
          )}
        </div>

        <aside className="bl-ins-side" aria-label="More from Insights">
          <section>
            <h2 className="bl-ins-side-h">Editor&rsquo;s picks</h2>
            <ul className="bl-ins-picks">
              {picks.map((p) => (
                <li key={p.slug}>
                  <div className="bl-ins-by"><Avatar size="xs" /><span>{author}</span></div>
                  <a href={`/insights/${p.slug}`}>{p.title}</a>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="bl-ins-side-h">Topics</h2>
            <div className="bl-ins-topics">
              {topics.map((t) => (
                <button key={t} type="button" className="bl-chip is-big" aria-pressed={topic === topicKey(t)} onClick={() => pick(topic === topicKey(t) ? 'all' : topicKey(t))}>
                  {t} <span>{counts[t]}</span>
                </button>
              ))}
            </div>
          </section>
          <section className="bl-ins-about">
            <h2 className="bl-ins-side-h">About Insights</h2>
            <p>{about}</p>
            <a href="/#book-a-demo" className="bl-ins-about-link">Get in touch →</a>
          </section>
        </aside>
      </div>
    </div>
  );
}
